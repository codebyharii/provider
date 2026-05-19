# Prowider — Mini Lead Distribution System

Full-stack project blueprint · Next.js · PostgreSQL · Prisma · Real-time · Fair Allocation

## 🗂 Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR, API routes, real-time support |
| Language | TypeScript | Type safety across stack |
| Database | PostgreSQL | ACID compliance, concurrency safety |
| ORM | Prisma | Schema-first, migrations, type-gen |
| Real-time | Server-Sent Events (SSE) | Simple, no extra infra, browser-native |
| Styling | Tailwind CSS + CSS Variables | Utility-first + design token system |
| Validation | Zod | Runtime schema validation |
| Concurrency | PostgreSQL row-level locking (`SELECT FOR UPDATE`) | Prevents race conditions |
| Idempotency | Webhook event log table (dedupe by `event_id`) | Safe repeated webhook calls |

## 🚀 Getting Started

```bash
# 1. Clone and install
git clone https://github.com/your-org/prowider.git
cd prowider
npm install

# 2. Configure environment
cp .env.example .env
# → fill in DATABASE_URL

# 3. Push schema and seed
npx prisma db push
npx prisma db seed

# 4. Run dev server
npm run dev

# 5. Open
#   http://localhost:3000/request-service   → customer form
#   http://localhost:3000/dashboard         → provider dashboard
#   http://localhost:3000/test-tools        → webhook test panel
```
