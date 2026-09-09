# Online Class & Assessment Platform — Master PRD & Architecture Index

> **Platform:** Enterprise Online Class & Assessment System  
> **Backend Architecture:** Node.js + Fastify, PostgreSQL (Database-per-Tenant), Redis, Drizzle ORM, BullMQ, WebSockets  
> **Frontend Architecture:** React (Latest / v18+ / 19), TypeScript, Zustand Store Architecture, Tailwind CSS ("EduDrive" Design System)  
> **Integration Mode:** Standalone SaaS + Pluggable Connected School ERP / SIS (HMAC-SHA256 Webhooks, SSO Launch, LTI 1.3 Advantage)  

---

## Document Navigation

| Document | Target Layer | Key Contents & Tech Specs |
| :--- | :--- | :--- |
| **[Backend PRD](file:///home/arshad/Workspace/demo/online-class%20and%20assesment-phase1/docs/PRD_BACKEND.md)** | Backend & Data Layer | Node Fastify, Database-per-tenant (`own-db`), Drizzle ORM schema, PgBouncer pooling, Redis write-behind buffer (50k+ concurrent test-takers), BullMQ worker queues, Zero-data loss autosave, API specifications. |
| **[Frontend PRD](file:///home/arshad/Workspace/demo/online-class%20and%20assesment-phase1/docs/PRD_FRONTEND.md)** | Frontend & Client App | React Latest, 1:1 Domain-Modular Structure matching Backend (`src/modules/*`), Zustand modular stores, EduDrive design tokens, 9-step Exam Wizard, Student Delivery Engine, Live Classroom & Quiz Studio, Teacher Evaluation with Canvas Annotations. |
| **[API & Webhook Spec](file:///home/arshad/Workspace/demo/online-class%20and%20assesment-phase1/docs/API_AND_WEBHOOK_INTEGRATION_SPEC.md)** | Integration Layer | Bi-directional REST webhooks, HMAC-SHA256 signatures, JIT user provisioning, automatic gradebook sync back to ERP. |
| **[ERP & Standalone Architecture](file:///home/arshad/Workspace/demo/online-class%20and%20assesment-phase1/docs/ERP_INTEGRATION_AND_STANDALONE_ARCHITECTURE.md)** | Architecture Layer | Hexagonal decoupled adapter pattern, dual-mode deployment (100% Standalone vs Connected ERP), LTI 1.3 Advantage specifications. |

---

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Clients Layer (React Latest + Zustand)"
        WebTeacher["Teacher Web Portal<br/>(Wizard, Evaluation, Live Room)"]
        WebStudent["Student High-Stakes Portal<br/>(Delivery Engine, Readiness, Autosave)"]
        WebAdmin["Admin & Coordinator Portal<br/>(Hierarchy, 4-Step Approval, Reports)"]
        ParentPortal["Parent Portal<br/>(Multi-Child Scorecards, Live Classes)"]
    end

    subgraph "API & Gateway Layer (Node Fastify)"
        Gateway["Fastify API Gateway"]
        TenantHook["Tenant Resolver Hook (Host / Header / JWT)"]
        AuthHook["Auth Guard & RBAC Hook (RS256 JWT)"]
        WSServer["Fastify WebSocket Multiplexer"]
    end

    subgraph "Application Services & Workers"
        ExamService["Exam & Delivery Engine"]
        EvalService["Evaluation & Annotation Engine"]
        LiveClassService["Live Classroom & Telemetry"]
        SyncWorker["BullMQ Worker (ERP Sync & Auto-Submit)"]
    end

    subgraph "In-Memory & Cache (Redis 7.2)"
        RedisCache["Redis Cluster<br/>(Timer State, Autosave Buffer, Pub/Sub, Blacklist)"]
    end

    subgraph "Master Infrastructure"
        MasterDB[("Master Catalog DB<br/>(Tenants, Subscriptions, DB Credentials)")]
    end

    subgraph "Isolated Tenant Databases (PostgreSQL - Database per Tenant)"
        TenantDB1[("Tenant DB 1<br/>School Al Amal")]
        TenantDB2[("Tenant DB 2<br/>Dubai Academy")]
        TenantDBN[("Tenant DB N<br/>Riyadh International")]
    end

    subgraph "External Systems"
        SchoolERP["School ERP / SIS"]
        ThirdPartyLMS["LTI 1.3 LMS (Canvas / Moodle)"]
    end

    WebTeacher --> Gateway
    WebStudent --> Gateway
    WebAdmin --> Gateway
    ParentPortal --> Gateway
    WebStudent -.->|Real-time Telemetry & Heartbeat| WSServer
    WebTeacher -.->|Live Quiz Controls & Review| WSServer

    Gateway --> TenantHook
    TenantHook --> AuthHook
    TenantHook --> MasterDB
    TenantHook --> RedisCache
    AuthHook --> ExamService
    AuthHook --> EvalService
    AuthHook --> LiveClassService
    WSServer --> LiveClassService

    ExamService --> RedisCache
    ExamService --> TenantDB1
    ExamService --> TenantDB2
    EvalService --> TenantDB1
    LiveClassService --> RedisCache
    SyncWorker --> RedisCache
    SyncWorker --> SchoolERP

    SchoolERP -->|REST Webhook / SSO Launch| Gateway
    ThirdPartyLMS -->|LTI 1.3 Launch| Gateway
```
