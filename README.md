# Prowider — Mini Lead Distribution System

A robust, real-time full-stack lead generation and fair distribution system. This application simulates a lead assignment platform where customers submit service inquiries, and the system automatically, fairly, and concurrently allocates those leads to service providers based on predefined business rules and quotas.

## 🔗 Live Demo
* **Website Link**: [https://provider-gold-theta.vercel.app/request-service](https://provider-gold-theta.vercel.app/request-service)

---

## 🗂 Technology Stack

| Layer | Choice | Reason |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | React Server Components, serverless API routes, and SSE streaming. |
| **Language** | TypeScript | Strong type-safety from database schema to UI components. |
| **Database** | PostgreSQL | Enterprise-grade relational engine with robust ACID transactions and row locking. |
| **ORM** | Prisma | Schema-first database mapping, migrations, and built-in type-generation. |
| **Real-time** | Server-Sent Events (SSE) | Simple, browser-native stream communication without WebSockets overhead. |
| **Styling** | Vanilla CSS + Design Tokens | Curated modern typography, harmonized HSL palettes, and glassmorphism. |
| **Validation** | Zod | Runtime validation for API route payloads and user input schemas. |

---

## 🛠 Features & Architecture

### 1. Fair Lead Allocation Algorithm
Leads are processed instantly in a secure database transaction with the following business rules:
* **Mandatory Providers**: Certain providers are assigned to specific services (e.g., Provider 1 for Service 1, Provider 5 for Service 2, etc.).
* **Fair Fallback Pool**: If more providers are needed to fill the slot quota (3 providers per lead), remaining slots are allocated from a fair rotation pool of providers using a round-robin rotation counter (`AllocationState` table).
* **Quota Enforcement**: Providers are excluded from both mandatory and pool assignments if they have already reached their monthly lead limit (`monthlyQuota`), ensuring strict adherence to budget constraints.

### 2. Concurrency & Race Condition Guards
To handle high volumes of parallel lead requests (e.g., 10 leads generated at the exact same millisecond):
* **Row-Level Locking**: The system requests locks using PostgreSQL `SELECT ... FOR UPDATE` on both the rotation index state and the target provider records.
* **Deadlock Prevention**: Target provider IDs are sorted in ascending order before lock acquisition, preventing cyclic waiting states and deadlocks under concurrent traffic.
* **Quota Protection**: Read-and-write actions are encapsulated inside a Prisma transactional context (`tx`), ensuring no two threads read stale quota numbers and write conflicting allocations.

### 3. Real-Time Dashboard (SSE)
* **SSE Manager**: Connection requests are registered into a client pool. When a lead is created, the system immediately broadcasts the new lead details to all connected dashboards.
* **Memory Leak Cleanup**: The SSE endpoint cleans up closed/inactive connections by tracking unique string IDs and purging them on connection drop.

### 4. Webhook Idempotency
* **Event Logging**: Webhook requests (e.g., monthly quota resets) are checked against a `WebhookEvent` registry table.
* **Double-Safety Catch**: If two identical webhook requests bypass the initial check simultaneously, the database's unique constraint throws a key violation (`P2002`). The router catches this exception and returns a graceful `200 OK - Already processed` response to the webhook provider rather than crashing or double-resetting quotas.

---

## 🚀 Getting Started (Local Setup)

### 1. Install Dependencies
```bash
git clone https://github.com/codebyharii/provider.git
cd provider/prowider
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the root of the project:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/prowider"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
WEBHOOK_SECRET="secret123"
```

### 3. Deploy Database and Seed
Make sure your PostgreSQL instance (or local Docker container) is running:
```bash
npx prisma db push
npx prisma db seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open your browser:
* **Customer Inquiry Form**: [http://localhost:3000/request-service](http://localhost:3000/request-service)
* **Real-time Provider Dashboard**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
* **Test Tools (Concurrent Generators)**: [http://localhost:3000/test-tools](http://localhost:3000/test-tools)

---

## 🌐 Deploying to Production (Vercel & Supabase)

### 1. Database Setup (Supabase / Neon)
1. Register on [Supabase](https://supabase.com) and create a PostgreSQL database.
2. In the project dashboard under **Settings > Database**, select **Session Pooler** (port `5432`) or **Transaction Pooler** (port `6543`) to get an IPv4 compatible connection URI.
3. Update `DATABASE_URL` in your local `.env` and run:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

### 2. Frontend & API Hosting (Vercel)
1. Push your latest code changes to GitHub.
2. Import the repository into your [Vercel](https://vercel.com) account.
3. Add the environment variables:
   * `DATABASE_URL` = (Your Supabase / Neon connection string)
   * `WEBHOOK_SECRET` = (Your custom webhook authorization key)
   * `NEXT_PUBLIC_APP_URL` = (Your live vercel.app URL after deployment)
4. Click **Deploy**.
