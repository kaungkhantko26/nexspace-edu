# NexSpace EDU AI

# nexspace-edu

A production-oriented AI academic workspace for students. The app includes a premium landing page, dashboard, AI workspace, secure API routes, Prisma data model, Express API service, and FastAPI AI-processing microservice.

## Stack

- Next.js 15 App Router, TypeScript, TailwindCSS
- Framer Motion, Three.js, Lucide, shadcn-style primitives
- Zustand, TanStack Query
- Prisma with PostgreSQL schema
- Express TypeScript API service
- FastAPI AI-processing service
- OpenRouter-compatible AI chat endpoint through `OPENROUTER_API_KEY`

## Run Locally

```bash
npm install
npm run dev
```

Optional services:

```bash
npm run server:dev
npm run ai:dev
```

Copy `.env.example` to `.env` and set:

```bash
DATABASE_URL="postgresql://..."
OPENROUTER_API_KEY="..."
OPENROUTER_MODEL="openai/gpt-4o-mini"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Do not commit real API keys. The key supplied in the prompt should be stored only in your local `.env`.

## Routes

- `/` landing page
- `/dashboard` student dashboard and analytics
- `/workspace` AI chat workspace with academic modes
- `/admin` admin operations dashboard
- `/api/ai/chat` OpenRouter-compatible AI endpoint
- `/api/files` upload validation endpoint
- `/api/reports` assignment, plagiarism, and AI detector report endpoint
- `/api/planner` study planner API

## Production Wiring

The app is structured for deployment with:

- Frontend on Vercel
- PostgreSQL on Supabase
- Object storage on Supabase Storage
- Express API on Railway or Render
- FastAPI AI service on Railway, Render, or a GPU worker
- Stripe webhooks and Clerk auth keys added through environment variables

The RAG flow is represented in `lib/rag.ts` and the Prisma schema. Connect the embedding provider and vector store after choosing Pinecone or ChromaDB.
