# Online Class & Assessment Platform — Master PRD & Architecture Index

> **Platform:** Enterprise Online Class & Assessment System  
> **Backend Architecture:** Node.js 24 + Fastify 5 modular monolith, PostgreSQL tenant cells, bounded PgBouncer pools, durable saves/outbox, isolated Redis/BullMQ, Socket.IO\
> **Frontend Architecture:** React (Latest / v18+ / 19), TypeScript, Zustand Store Architecture, Tailwind CSS ("EduDrive" Design System)  
> **Integration Mode:** Standalone SaaS + Pluggable Connected School ERP / SIS (HMAC-SHA256 Webhooks, SSO Launch, LTI 1.3 Advantage)  

---

## Document Navigation

| Document | Target Layer | Key Contents & Tech Specs |
| :--- | :--- | :--- |
| **[Backend PRD](PRD_BACKEND.md)** | Backend & Data Layer | Durable PostgreSQL answer/submission transactions, revision/idempotency protocol, database-per-tenant cells and connection budgets, independent workers, scheduled/reactive scaling, recovery requirements and 1k/10k/50k qualification gates (not certified capacities). |
| **[Frontend PRD](PRD_FRONTEND.md)** | Frontend & Client App | React Latest, 1:1 Domain-Modular Structure matching Backend (`src/modules/*`), Zustand modular stores, EduDrive design tokens, 9-step Exam Wizard, Student Delivery Engine, Live Classroom & Quiz Studio, Teacher Evaluation with Canvas Annotations. |
| **[API & Webhook Spec](API_AND_WEBHOOK_INTEGRATION_SPEC.md)** | Integration Layer | Bi-directional REST webhooks, HMAC-SHA256 signatures, JIT user provisioning, automatic gradebook sync back to ERP. |
| **[ERP & Standalone Architecture](ERP_INTEGRATION_AND_STANDALONE_ARCHITECTURE.md)** | Architecture Layer | Hexagonal decoupled adapter pattern, dual-mode deployment (100% Standalone vs Connected ERP), LTI 1.3 Advantage specifications. |

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
        WSServer["Socket.IO Gateway"]
    end

    subgraph "Application Services & Workers"
        ExamService["Exam & Delivery Engine"]
        EvalService["Evaluation & Annotation Engine"]
        LiveClassService["Live Classroom & Telemetry"]
        SyncWorker["Independent Workers and Deadline Sweeper"]
        Outbox["Durable DB Outbox and Reconciler"]
    end

    subgraph "Separate Redis Workloads"
        RedisCache["Disposable Metadata Cache / Realtime PubSub"]
        QueueRedis["Dedicated BullMQ Redis<br/>(Reconstructable from DB outbox)"]
    end

    subgraph "Master Infrastructure"
        MasterDB[("Master Catalog DB<br/>(Tenants, Placement, Schedules, Secret References)")]
    end

    subgraph "Tenant Databases Across HA PostgreSQL Cells"
        Pooler["Budgeted PgBouncer Pools"]
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
    ExamService -->|Commit answers and receipt| Pooler
    EvalService --> Pooler
    Pooler --> TenantDB1
    Pooler --> TenantDB2
    Pooler --> TenantDBN
    TenantDB1 --> Outbox
    TenantDB2 --> Outbox
    TenantDBN --> Outbox
    Outbox --> QueueRedis
    QueueRedis --> SyncWorker
    SyncWorker --> Pooler
    LiveClassService --> RedisCache
    SyncWorker --> SchoolERP

    SchoolERP -->|REST Webhook / SSO Launch| Gateway
    ThirdPartyLMS -->|LTI 1.3 Launch| Gateway
```

Backend PRD v2.0 is the authority for tenant routing, durable saves/submission, scaling and recovery. Frontend save/retry/status behavior must follow its Section 5. Capacity remains a target until the corresponding load and failure qualification reports pass.
