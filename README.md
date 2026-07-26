# NovaMind

NovaMind is a full-stack, multi-agent AI assistant platform built on a microservices architecture. It routes user requests to specialized AI agents (chat, coding, search, PDF, PPT, vision, and RAG-based document Q&A), backed by a credit-based subscription system and deployed on AWS with a fully automated CI/CD pipeline.

## Overview

Instead of relying on a single general-purpose model, NovaMind uses a **LangGraph-based routing system** that analyzes each user request and dispatches it to the most suitable specialized agent — whether that's answering a coding question, searching the web, summarizing a PDF, generating a PowerPoint, or analyzing an image. The platform is built as independently deployable microservices, each containerized with Docker and orchestrated on AWS ECS.

## Architecture

```
Client (React SPA)
      │
      ▼
 CloudFront (CDN) ── S3 (static hosting)
      │
      ▼
   Gateway Service  ── Firebase Auth verification, request routing
      │
      ├── Auth Service     (user management, Firebase Admin, S3)
      ├── Chat Service      (LangGraph orchestration entry)
      ├── Agent Service     (multi-agent AI execution)
      └── Billing Service   (Razorpay payments, credits, plans)
      │
      ▼
 MongoDB · Redis (ElastiCache) · AWS S3
```

All backend services communicate through an Express-based **API Gateway**, which handles authentication middleware, CORS, and request proxying to downstream services.

## Key Features

- **Multi-Agent AI System** — A LangGraph state machine routes each query to one of eight specialized agents: general chat, web search, coding help, PDF generation, PPT generation, PDF-based RAG Q&A, image analysis, and vision tasks.
- **Microservices Backend** — Gateway, Auth, Chat, Agent, and Billing run as independent Node.js/Express services, each with its own Dockerfile and deployment pipeline.
- **Authentication** — Google Sign-In via Firebase Auth on the client, verified server-side using Firebase Admin SDK.
- **Credit-Based Subscription System** — Three tiers (Free, Starter, Pro) with monthly credit allocations, integrated with Razorpay for payment processing and order verification.
- **Rate Limiting** — Redis-backed per-user, per-agent rate limiting to prevent abuse of AI endpoints.
- **Document Generation** — Server-side PDF generation (`pdfkit`) and PowerPoint generation (`pptxgenjs`) as agent outputs, with S3 upload/download support.
- **Responsive UI** — React 19 + Redux Toolkit frontend with Tailwind CSS, real-time chat interface, markdown rendering with syntax highlighting, and a billing drawer for plan management.
- **Automated CI/CD** — GitHub Actions pipeline builds and pushes Docker images to Amazon ECR, deploys backend services to ECS, and syncs the built frontend to S3 with CloudFront cache invalidation.

## Tech Stack

**Frontend**
- React 19, Redux Toolkit, React Redux
- Tailwind CSS 4, Vite
- Firebase (client SDK), Axios
- react-markdown, rehype-highlight, remark-gfm (chat rendering)
- Framer Motion (`motion`)

**Backend**
- Node.js, Express 5 (all services)
- LangGraph, LangChain Core (agent orchestration)
- LangChain integrations: Google GenAI, Groq, OpenAI, OpenRouter, Tavily, Qdrant
- MongoDB with Mongoose
- Redis (ioredis) for rate limiting and session data
- Firebase Admin SDK (server-side auth verification)
- Razorpay (payments)
- AWS SDK v3 (S3 client, presigned URLs)
- pdfkit, pptxgenjs, pdf-parse (document generation & parsing)
- express-http-proxy (gateway routing)

**Infrastructure & DevOps**
- Docker (per-service Dockerfiles)
- AWS ECS (container orchestration), ECR (image registry)
- AWS ElastiCache (Redis), S3, CloudFront
- GitHub Actions (CI/CD)

## Services

| Service   | Responsibility                                                        |
|-----------|-------------------------------------------------------------------------|
| `gateway` | Single entry point; auth middleware, CORS, request proxying to services |
| `auth`    | User records, Firebase Admin verification, S3-backed profile assets     |
| `chat`    | Conversation and message persistence, LangGraph entry point             |
| `agent`   | Runs the multi-agent graph (chat, search, coding, PDF, PPT, vision, RAG) |
| `billing` | Razorpay order creation/verification, plan management, credit deduction |

## Credit Plans

| Plan    | Price (₹) | Credits | Validity |
|---------|-----------|---------|----------|
| Free    | 0         | 300     | 30 days  |
| Starter | 199       | 500     | 30 days  |
| Pro     | 499       | 2000    | 30 days  |

## CI/CD Pipeline

On every push to `main`, GitHub Actions:
1. Builds and pushes Docker images for all five backend services to Amazon ECR
2. Forces a new ECS deployment for each service
3. Builds the React frontend (with environment secrets injected at build time)
4. Syncs the production build to S3
5. Invalidates the CloudFront cache for instant propagation

## Getting Started

### Prerequisites
- Node.js 22+
- Docker & Docker Compose
- MongoDB instance
- Firebase project (Auth + Admin SDK credentials)
- Razorpay account (test/live keys)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/Rohitverma-creator/novaMind.git
cd novaMind

# Start Redis
cd backend
docker-compose up -d

# Install and run each backend service
cd gateway && npm install && npm run dev
cd services/auth && npm install && npm run dev
cd services/chat && npm install && npm run dev
cd services/agent && npm install && npm run dev
cd services/billing && npm install && npm run dev

# Install and run the frontend
cd frontend
npm install
npm run dev
```

Each service requires its own `.env` file with relevant credentials (MongoDB URI, Firebase config, AWS keys, Razorpay keys, LLM provider API keys).

## Author

**Rohit Verma**
B.Tech Computer Science, AKTU (2022–2026)
