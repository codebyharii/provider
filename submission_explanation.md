# Project Submission: Prowider Mini Lead Distribution System

This document provides a detailed overview of the setup instructions, allocation algorithm, concurrency safeguards, and webhook idempotency guarantees implemented in the Prowider Lead Distribution System.

---

## 1. Setup Instructions

### Local Environment Setup
1. **Clone the repository and install dependencies**:
   ```bash
   git clone <your-repository-url>
   cd provider/prowider
   npm install
   ```
2. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prowider"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   WEBHOOK_SECRET="secret123"
   ```
3. **Initialize the Database**:
   Ensure PostgreSQL is running locally (e.g., via Docker container), then run:
   ```bash
   npx prisma db push   # Creates the schema tables in the database
   npx prisma db seed   # Seeds initial services and provider profiles
   ```
4. **Run the Project**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000/request-service` (Customer page), `http://localhost:3000/dashboard` (Provider dashboard), and `http://localhost:3000/test-tools` (Developer tools panel).

---

## 2. Lead Allocation Algorithm

The system distributes leads dynamically using a combination of category routing, fairness rotation, and strict quota limits:

1. **Step 1: Check Quota Limits**: Before any allocation, active providers' current lead counts are checked against their monthly limits. Providers that have reached their limit (e.g. 10/10 leads) are excluded.
2. **Step 2: Apply Mandatory Rules**: The system assigns the lead to providers mapped under "mandatory rules" for the requested service (e.g. Provider 1 is mandatory for Service 1).
3. **Step 3: Fair Pool Allocation (Round-Robin)**: If the mandatory providers do not fill the required quota (3 providers per lead), the remaining slots are filled from the service's "Fair Pool" (e.g. Providers 2, 3, and 4 for Service 1).
   - A rotation pointer (`nextIndex`) is fetched and updated in the `AllocationState` table.
   - The pool is rotated sequentially to ensure all pool providers receive an equal distribution of leads over time.

---

## 3. Concurrency & Race Condition Safeguards

To handle high volumes of simultaneous lead generation requests (e.g., 10 leads arriving in parallel at the exact same millisecond):

1. **Row-Level Locking (`SELECT FOR UPDATE`)**:
   Within a database transaction, the allocation logic queries the rotation index and the target providers using raw SQL with the `FOR UPDATE` clause:
   ```sql
   SELECT * FROM "Provider" WHERE "id" IN (...) ORDER BY "id" ASC FOR UPDATE;
   ```
   This prevents concurrent database operations from reading stale lead counts or over-allocating leads beyond their monthly quotas.
2. **Deadlock Prevention**:
   All target provider IDs are sorted in ascending order (`ORDER BY id ASC`) before locks are requested. This ensures that concurrent transactions request locks in the exact same sequence, preventing circular waits and deadlocks.

---

## 4. Webhook Idempotency

Webhooks (such as monthly quota resets) are guarded against duplicate delivery, server timeouts, and retry race conditions:

1. **Deduplication Logging**:
   The system records every successfully processed `event_id` in a dedicated `WebhookEvent` table.
2. **Double-Safety Catch (Constraint Enforcement)**:
   The `event_id` column has a unique database index. If two identical webhook requests execute concurrently and bypass the application-level check:
   - The database transaction throws a unique constraint violation exception (`P2002`).
   - The server catches this exception and returns a graceful `200 OK - Already processed` response to the webhook sender instead of resetting the quotas a second time or throwing a server error.
