# DocuVox Assistant

![Next.js](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**DocuVox Assistant** is a full-stack RAG (Retrieval-Augmented Generation) application that lets users upload PDF documents, chat with them conversationally, and generate audio podcast summaries from their content — turning static documents into both a conversation and a voice.

## What It Does

- **Chat with PDFs** — upload a document and ask questions about it; answers are generated using semantic search over the document combined with Google Gemini
- **Podcast generation** — turns a document into a single-speaker audio summary (script written by Gemini, converted to speech via Google Cloud TTS)
- **Secure multi-user auth** — each user's documents and chat history are private, powered by Clerk
- **Real-time status updates** — the UI polls the backend for live progress on long-running jobs like PDF processing and podcast generation

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, Framer Motion |
| **Backend** | Node.js, Express.js, BullMQ |
| **AI & Data** | Google Gemini, ElevenLabs Text-to-Speech, LangChain.js, Qdrant (vector DB), MongoDB Atlas, Upstash Redis |
| **Infrastructure** | Vercel (frontend), Railway (API + worker), Cloudflare R2 (object storage), Clerk (auth) |

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌───────────────┐
│  Next.js UI  │ ───▶ │  Express API  │ ───▶ │  BullMQ Queue │
│  (Vercel)    │ ◀─── │  (Railway)    │      │  (Upstash     │
└─────────────┘      └──────────────┘      │   Redis)      │
                             │              └───────┬───────┘
                             ▼                      ▼
                      ┌─────────────┐        ┌──────────────┐
                      │  MongoDB    │ ◀───── │  Worker       │
                      │  Atlas      │        │  (Railway)    │
                      └─────────────┘        └───────┬───────┘
                                                      │
                                     ┌────────────────┼────────────────┐
                                     ▼                ▼                ▼
                              ┌───────────┐   ┌────────────┐   ┌──────────────┐
                              │  Qdrant   │   │  Gemini +  │   │  Cloudflare  │
                              │  (vectors)│   │  Google TTS│   │  R2 (storage)│
                              └───────────┘   └────────────┘   └──────────────┘
```

1. **Frontend (Vercel)** — Next.js client handles UI, authentication, and polling for job status.
2. **Backend API (Railway)** — Express server handles incoming requests and enqueues heavy tasks.
3. **Job Queue (Upstash Redis)** — BullMQ queues PDF processing and podcast generation jobs.
4. **Worker (Railway)** — a separate process consumes the queue: parses PDFs, generates embeddings, writes to Qdrant, generates podcast scripts and audio.
5. **MongoDB** stores documents, chat rooms, and messages. **Qdrant** stores embeddings for retrieval during chat.

## Getting Started

### Prerequisites

- Node.js v20+, npm, Git
- Free-tier accounts for: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas), [Qdrant Cloud](https://cloud.qdrant.io), [Upstash Redis](https://upstash.com), [Google AI Studio](https://aistudio.google.com/apikey), [Google Cloud TTS](https://console.cloud.google.com), [Cloudflare R2](https://developers.cloudflare.com/r2/), [Clerk](https://clerk.com)

### Backend setup

```sh
cd server
npm install --legacy-peer-deps
```

Create a `.env` file in `server/`:

```env
MONGODB_URI=
QDRANT_URL=
QDRANT_API_KEY=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
GOOGLE_API_KEY=
CLIENT_URL=http://localhost:3000
PORT=8001
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
GOOGLE_APPLICATION_CREDENTIALS=
R2_ENDPOINT=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
```

Run the API and worker in separate terminals:

```sh
npm run dev          # API server (port 8001)
npm run dev-worker   # background worker
```

### Frontend setup

```sh
cd client
npm install
```

Create a `.env.local` file in `client/`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

```sh
npm run dev
```

Visit **http://localhost:3000**.

> **Note on MongoDB connection strings:** if you hit a `querySrv ECONNREFUSED` error connecting to Atlas, your network/Node's DNS resolver may not support `mongodb+srv://` SRV lookups. Use Atlas's **standard (non-SRV) connection string** instead (Connect → Drivers → toggle "Legacy URI String"), which lists shard hosts directly and avoids the DNS SRV query entirely.

## What I Worked On

Getting this running end-to-end involved real debugging beyond just filling in API keys:

- Diagnosed and fixed a `better-sqlite3`/`typeorm` peer-dependency conflict in `@langchain/community` by installing with `--legacy-peer-deps`
- Traced a `querySrv ECONNREFUSED` MongoDB Atlas connection failure to Node's DNS resolver not handling `mongodb+srv://` SRV lookups correctly on Windows, and resolved it by switching to Atlas's standard (non-SRV, multi-host) connection string
- Found and corrected an env variable name mismatch (`NEXT_PUBLIC_API_BASE_URL` vs. an assumed `NEXT_PUBLIC_API_URL`) that was causing silent 404s on all API calls from the frontend
- Set up Clerk authentication from scratch (temporary keyless mode → claimed permanent API keys) and wired it into both frontend and backend
- Provisioned and connected MongoDB Atlas, Qdrant Cloud, and Upstash Redis from empty accounts to a working configuration
- Identified a gap between the documented RAG pipeline and the actual implementation: the worker embeds raw per-page PDF content directly, with no explicit text-chunking step

## Known Limitations / Ideas for Extension

- No explicit chunking strategy — each PDF page is embedded as a single chunk, which can hurt retrieval quality on dense pages
- No automated tests
- Podcast generation is single-speaker only

These are areas I'm planning to improve as I extend this project further.

