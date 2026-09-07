import csv
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

tasks_data = [
    # -------------------------------------------------------------
    # PHASE 1: Foundation, RBAC, Academic Master Data & Auth
    # -------------------------------------------------------------
    {
        "task_id": "FE-101",
        "phase": "Phase 1: Foundation & RBAC",
        "module": "UI Framework & Design System",
        "track": "Frontend",
        "task_name": "Design System, Atomic UI Kit & Theme Provider",
        "description": "Implement responsive layout, sidebar, header, dynamic role switcher, atomic inputs, modals, toast alerts, theme provider (light/dark/high-contrast)",
        "role": "Senior Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "None",
        "deliverable": "Reusable UI Component Library & Global Layout"
    },
    {
        "task_id": "FE-102",
        "phase": "Phase 1: Foundation & RBAC",
        "module": "Authentication & RBAC",
        "track": "Frontend",
        "task_name": "Multi-Role Login Portal & Session Guards",
        "description": "Implement Login with Email/Password, SSO, and Student PIN/QR, route guards for 6 roles (Admin, Coordinator, Teacher, Proctor, Student, Parent), silent JWT refresh",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 3,
        "dependencies": "FE-101, BE-102",
        "deliverable": "Auth Views, Role Guards, Session Context"
    },
    {
        "task_id": "FE-103",
        "phase": "Phase 1: Foundation & RBAC",
        "module": "Academic Master Data",
        "track": "Frontend",
        "task_name": "Academic Hierarchy Management UI",
        "description": "CRUD screens for Academic Years, Classes, Divisions/Sections, Subjects, and Chapters/Topics with hierarchy tree view",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "FE-101, BE-103",
        "deliverable": "Academic Structure Management Views"
    },
    {
        "task_id": "FE-104",
        "phase": "Phase 1: Foundation & RBAC",
        "module": "User Management",
        "track": "Frontend",
        "task_name": "Student & Teacher Roster with Accommodations UI",
        "description": "Searchable student roster, teacher allocations, student accommodation modal (extra time multipliers, relaxed proctoring, breaks)",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 3,
        "dependencies": "FE-101, BE-104",
        "deliverable": "User Roster & Accommodations Config Modal"
    },
    {
        "task_id": "BE-101",
        "phase": "Phase 1: Foundation & RBAC",
        "module": "Database & Architecture",
        "track": "Backend",
        "task_name": "PostgreSQL Schema Design & Migrations",
        "description": "Design relational models for Tenants, Academic Structure, Users, Roles, Permissions, Accommodations, setup indexing and soft-deletes",
        "role": "Lead Backend Engineer / DBA",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "None",
        "deliverable": "PostgreSQL Schema, Migration Scripts, Prisma/ORM Models"
    },
    {
        "task_id": "BE-102",
        "phase": "Phase 1: Foundation & RBAC",
        "module": "Auth & Security",
        "track": "Backend",
        "task_name": "JWT Auth, Refresh Token Rotation & RBAC Middleware",
        "description": "Endpoints for login, refresh, logout, student-pin login, RBAC permission middleware, rate-limiting, and tenant isolation filters",
        "role": "Backend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "BE-101",
        "deliverable": "Auth REST APIs, Token Service, Security Middleware"
    },
    {
        "task_id": "BE-103",
        "phase": "Phase 1: Foundation & RBAC",
        "module": "Academic Services",
        "track": "Backend",
        "task_name": "Academic Hierarchy CRUD Endpoints",
        "description": "REST APIs for Years, Classes, Divisions, Subjects, Chapters, Topics with validation and hierarchy integrity constraints",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "BE-101, BE-102",
        "deliverable": "Academic Hierarchy REST APIs"
    },
    {
        "task_id": "BE-104",
        "phase": "Phase 1: Foundation & RBAC",
        "module": "User Services",
        "track": "Backend",
        "task_name": "User Management & Bulk Student CSV Streamer",
        "description": "CRUD APIs for Students, Teachers, Accommodations, and high-performance transactional CSV/Excel streaming parser for 5,000+ roster import",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 5,
        "dependencies": "BE-101, BE-102",
        "deliverable": "User Management APIs & Bulk Roster Ingestion Service"
    },

    # -------------------------------------------------------------
    # PHASE 2: Question Bank Management & Content Pool
    # -------------------------------------------------------------
    {
        "task_id": "FE-201",
        "phase": "Phase 2: Question Bank",
        "module": "Question Repository",
        "track": "Frontend",
        "task_name": "Question Bank Explorer & Hierarchy Filter UI",
        "description": "Tree filter (Subject -> Class -> Chapter -> Type -> Difficulty), search, question card preview with bloom level, tags, usage metrics",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 3,
        "dependencies": "FE-101, BE-202",
        "deliverable": "Question Bank Explorer & Filter View"
    },
    {
        "task_id": "FE-202",
        "phase": "Phase 2: Question Bank",
        "module": "Question Authoring",
        "track": "Frontend",
        "task_name": "Multi-Type Question Authoring Studio",
        "description": "Authoring editors for MCQ, One-Word, Short/Long answer, Essay with scoring rubric, KaTeX formula editor, image attachment uploads",
        "role": "Senior Frontend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "FE-101, BE-202",
        "deliverable": "Rich Question Authoring Suite & Math Palette"
    },
    {
        "task_id": "FE-203",
        "phase": "Phase 2: Question Bank",
        "module": "Bulk Import/Export",
        "track": "Frontend",
        "task_name": "Bulk Question Upload & QTI/Word Export UI",
        "description": "Drag-and-drop CSV/Excel/Word/QTI question upload with client-side syntax validation and export question pool to printable PDF/Word",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P2",
        "mandays": 3,
        "dependencies": "FE-201, BE-202",
        "deliverable": "Question Bulk Upload & Export Modal"
    },
    {
        "task_id": "BE-201",
        "phase": "Phase 2: Question Bank",
        "module": "Data Modeling",
        "track": "Backend",
        "task_name": "Question Bank Schemas & Versioning Engine",
        "description": "Schemas for Questions, Options, Rubrics, Tags, Revision history, full-text search indexing with Bloom taxonomy & difficulty metadata",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 3,
        "dependencies": "BE-101",
        "deliverable": "Question Bank Database Models & Migrations"
    },
    {
        "task_id": "BE-202",
        "phase": "Phase 2: Question Bank",
        "module": "Question APIs",
        "track": "Backend",
        "task_name": "Question Bank REST & Search APIs",
        "description": "CRUD APIs, full-text search, filter by subject/chapter/type, bulk upload async worker with progress reporting, QTI exporter",
        "role": "Backend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "BE-201",
        "deliverable": "Question Bank API Suite & File Importer Worker"
    },
    {
        "task_id": "BE-203",
        "phase": "Phase 2: Question Bank",
        "module": "Algorithms",
        "track": "Backend",
        "task_name": "Dynamic Question Randomizer & Constraint Solver",
        "description": "Algorithm to select N random non-repeating questions matching subject, chapter, difficulty weightages and total marks constraints",
        "role": "Senior Backend Engineer",
        "complexity": "High",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "BE-201, BE-202",
        "deliverable": "Randomized Exam Generation Service"
    },

    # -------------------------------------------------------------
    # PHASE 3: Comprehensive Exam Creation & Wizard Workflow
    # -------------------------------------------------------------
    {
        "task_id": "FE-301",
        "phase": "Phase 3: Exam Creation Wizard",
        "module": "Wizard Step 1 & 2",
        "track": "Frontend",
        "task_name": "Basic Details & Recipient Selection UI",
        "description": "Step 1 (Spot vs Scheduled test, codes, dates, duration, instructions) + Step 2 (Class-wise vs Student-wise recipient selection with exclusions)",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "FE-101, BE-302",
        "deliverable": "Exam Wizard Steps 1 & 2"
    },
    {
        "task_id": "FE-302",
        "phase": "Phase 3: Exam Creation Wizard",
        "module": "Wizard Step 3 & 4",
        "track": "Frontend",
        "task_name": "Academic Mapping & Question Source Choice UI",
        "description": "Step 3 (Subject & Chapter multi-select with weightage) + Step 4 (Choice card: Question Bank Pool vs Upload PDF Paper)",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 3,
        "dependencies": "FE-301, BE-302",
        "deliverable": "Exam Wizard Steps 3 & 4"
    },
    {
        "task_id": "FE-303",
        "phase": "Phase 3: Exam Creation Wizard",
        "module": "Wizard Step 5A",
        "track": "Frontend",
        "task_name": "Question Pool & Marks Distribution Matrix UI",
        "description": "Step 5A (Marks distribution matrix per question type, dynamic total validation, manual picker modal, random pool config)",
        "role": "Senior Frontend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "FE-201, FE-302, BE-302",
        "deliverable": "Question Distribution Matrix & Selector Component"
    },
    {
        "task_id": "FE-304",
        "phase": "Phase 3: Exam Creation Wizard",
        "module": "Wizard Step 5B",
        "track": "Frontend",
        "task_name": "PDF Paper Upload & Section Breakdown UI",
        "description": "Step 5B (PDF upload with inline PDF.js preview, Section A/B/C breakdown, question count, max marks, optional question rules)",
        "role": "Frontend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "FE-302, BE-302",
        "deliverable": "PDF Question Paper Configurator & Section Builder"
    },
    {
        "task_id": "FE-305",
        "phase": "Phase 3: Exam Creation Wizard",
        "module": "Wizard Step 6 & 7",
        "track": "Frontend",
        "task_name": "Submission Formats, Security Controls & Publishing UI",
        "description": "Step 6 (Allowed submission formats, fullscreen, proctor rules, shuffle) + Step 7 (Summary review, draft save, publish confirmation)",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "FE-303, FE-304, BE-302",
        "deliverable": "Exam Controls & Summary Review Step"
    },
    {
        "task_id": "BE-301",
        "phase": "Phase 3: Exam Creation Wizard",
        "module": "Data Models",
        "track": "Backend",
        "task_name": "Exam Engine Schemas & Relations",
        "description": "Schemas for Exams, ExamRecipients, ExamChapters, ExamQuestions, ExamSections, ExamSecuritySettings, Audit logs",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "BE-101, BE-201",
        "deliverable": "Exam Schema & Relational Models"
    },
    {
        "task_id": "BE-302",
        "phase": "Phase 3: Exam Creation Wizard",
        "module": "Exam APIs",
        "track": "Backend",
        "task_name": "Multi-Step Exam Creation & Validation APIs",
        "description": "REST endpoints for basic info, recipients, academic mapping, marks distribution, question assignment, PDF upload, security settings, publish",
        "role": "Senior Backend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 6,
        "dependencies": "BE-301",
        "deliverable": "Exam Configuration REST API Suite"
    },
    {
        "task_id": "BE-303",
        "phase": "Phase 3: Exam Creation Wizard",
        "module": "Lifecycle Daemon",
        "track": "Backend",
        "task_name": "Exam Lifecycle Scheduler & State Machine",
        "description": "Background worker (BullMQ/Celery) managing transitions (DRAFT -> SCHEDULED -> ACTIVE -> EVALUATING -> PUBLISHED) & Spot test instant dispatch",
        "role": "Backend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "BE-302",
        "deliverable": "Exam State Machine & Dispatch Worker"
    },

    # -------------------------------------------------------------
    # PHASE 4: Live Classroom & In-Class Spot Assessment Engine
    # -------------------------------------------------------------
    {
        "task_id": "FE-401",
        "phase": "Phase 4: Live Class & Spot Quizzes",
        "module": "Virtual Classroom",
        "track": "Frontend",
        "task_name": "Teacher Live Classroom UI & Attendance Panel",
        "description": "Video Grid / Google Meet embed / WebRTC container, Mic/Camera/Screen-share controls, live student attendance list with engagement status",
        "role": "Senior Frontend Engineer",
        "complexity": "High",
        "priority": "P1",
        "mandays": 5,
        "dependencies": "FE-101, BE-401",
        "deliverable": "Teacher Live Classroom Dashboard"
    },
    {
        "task_id": "FE-402",
        "phase": "Phase 4: Live Class & Spot Quizzes",
        "module": "Spot Quizzing",
        "track": "Frontend",
        "task_name": "Live Spot Quiz Launcher & Response Monitor (Teacher)",
        "description": "1-click spot quiz trigger from bank or rapid MCQ, countdown timer, live real-time response bar chart, instant answer reveal & leaderboard",
        "role": "Frontend Engineer",
        "complexity": "High",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "FE-401, BE-403",
        "deliverable": "Spot Quiz Launcher & Real-Time Monitor"
    },
    {
        "task_id": "FE-403",
        "phase": "Phase 4: Live Class & Spot Quizzes",
        "module": "Student Classroom",
        "track": "Frontend",
        "task_name": "Student Classroom Viewer & Floating Spot Quiz Overlay",
        "description": "Student stream viewer, chat, hand-raise, and floating spot quiz popup with countdown timer, submission, and instant feedback",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "FE-101, BE-402, BE-403",
        "deliverable": "Student Live Classroom View & Spot Quiz Modal"
    },
    {
        "task_id": "BE-401",
        "phase": "Phase 4: Live Class & Spot Quizzes",
        "module": "Classroom Service",
        "track": "Backend",
        "task_name": "Live Class Session Management & WebRTC Signaling",
        "description": "Schemas for LiveClasses, Attendees, WebRTC signaling / Video SDK provider integration, session creation, attendance recording",
        "role": "Lead Backend / WebRTC Engineer",
        "complexity": "High",
        "priority": "P1",
        "mandays": 5,
        "dependencies": "BE-101, BE-102",
        "deliverable": "Live Classroom Management & Signaling Service"
    },
    {
        "task_id": "BE-402",
        "phase": "Phase 4: Live Class & Spot Quizzes",
        "module": "WebSocket Gateway",
        "track": "Backend",
        "task_name": "Classroom WebSocket Gateway & Heartbeat Tracker",
        "description": "Socket.io / WS server managing room events (join/leave/chat/hand-raise) and student attendance ping every 30s for exact duration logs",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "BE-401",
        "deliverable": "Live Class WebSocket Gateway"
    },
    {
        "task_id": "BE-403",
        "phase": "Phase 4: Live Class & Spot Quizzes",
        "module": "Spot Quizzing",
        "track": "Backend",
        "task_name": "Real-Time Spot Quiz Dispatcher & In-Memory Aggregator",
        "description": "Redis-backed ultra-low-latency response collector, live aggregate percentage calculator, and WebSocket broadcast of leaderboards",
        "role": "Senior Backend Engineer",
        "complexity": "High",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "BE-402",
        "deliverable": "Spot Quiz Real-Time Aggregation Engine"
    },

    # -------------------------------------------------------------
    # PHASE 5: Student Secure Assessment Portal & Pre-Check Workflow
    # -------------------------------------------------------------
    {
        "task_id": "FE-501",
        "phase": "Phase 5: Student Exam Portal",
        "module": "Exam Discovery",
        "track": "Frontend",
        "task_name": "Student Exams List & Schedule Hub",
        "description": "Tabs for Upcoming, Live/Active, Under Evaluation, Completed, exam card with timer, syllabus, and Start System Check action",
        "role": "Frontend Engineer",
        "complexity": "Low",
        "priority": "P0",
        "mandays": 2,
        "dependencies": "FE-101, BE-501",
        "deliverable": "Student Exams Hub View"
    },
    {
        "task_id": "FE-502",
        "phase": "Phase 5: Student Exam Portal",
        "module": "System Readiness",
        "track": "Frontend",
        "task_name": "4-Step Pre-Exam System Readiness Check Wizard",
        "description": "Step 1 (Camera & Mic permission + audio meter), Step 2 (AI Face check + ID reference photo), Step 3 (Network latency & fullscreen check), Step 4 (Rules & PIN)",
        "role": "Senior Frontend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "FE-101, BE-501",
        "deliverable": "System Readiness Check Wizard Component"
    },
    {
        "task_id": "FE-503",
        "phase": "Phase 5: Student Exam Portal",
        "module": "Exam Interface",
        "track": "Frontend",
        "task_name": "Secure Exam Lockdown Workspace & Question Palette",
        "description": "Fullscreen enforcement, tab-switch traps, countdown timer with accommodation multiplier, color-coded Question Palette (Answered/Review/Unanswered)",
        "role": "Senior Frontend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 6,
        "dependencies": "FE-502, BE-501, BE-502",
        "deliverable": "Locked-Down Exam Interface & Question Palette"
    },
    {
        "task_id": "FE-504",
        "phase": "Phase 5: Student Exam Portal",
        "module": "Answer Submissions",
        "track": "Frontend",
        "task_name": "Multi-Format Answer Inputs & Mobile QR Upload",
        "description": "MCQ, Short/Long text, KaTeX formulas, PDF upload dropzone, and Mobile QR scanner modal to upload handwritten answer sheet photos from phone",
        "role": "Frontend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "FE-503, BE-502, BE-503",
        "deliverable": "Answer Input Canvas & Mobile Upload Modal"
    },
    {
        "task_id": "BE-501",
        "phase": "Phase 5: Student Exam Portal",
        "module": "Session Security",
        "track": "Backend",
        "task_name": "Student Pre-Check & Encrypted Session Token API",
        "description": "Eligibility verification, time window check, readiness payload logger (specs, IP, selfie URL), and short-lived encrypted exam session token generator",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "BE-301, BE-302",
        "deliverable": "Exam Session Init & Pre-Check APIs"
    },
    {
        "task_id": "BE-502",
        "phase": "Phase 5: Student Exam Portal",
        "module": "Auto-Save Engine",
        "track": "Backend",
        "task_name": "Resilient Auto-Save Pipeline (Redis + Postgres)",
        "description": "High-throughput Redis cache for student keystrokes/answers, batch sync to Postgres every 10s, out-of-order sequence conflict resolver",
        "role": "Lead Backend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "BE-501",
        "deliverable": "Fault-Tolerant Answer Auto-Save Engine"
    },
    {
        "task_id": "BE-503",
        "phase": "Phase 5: Student Exam Portal",
        "module": "Attachment Upload",
        "track": "Backend",
        "task_name": "Presigned S3 Upload & Mobile QR Sync Gateway",
        "description": "Presigned URLs for direct S3 upload of answer attachments, short-lived mobile sync session for mobile camera photo uploads directly to active question",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "BE-502",
        "deliverable": "Attachment S3 Service & Mobile Upload Sync Gateway"
    },
    {
        "task_id": "BE-504",
        "phase": "Phase 5: Student Exam Portal",
        "module": "Submission Daemon",
        "track": "Backend",
        "task_name": "Exam Final Submit & Auto-Close Timer Daemon",
        "description": "Submit endpoint with integrity verification, server-side timer daemon to auto-lock and submit overdue sessions, triggers auto-eval worker",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "BE-502",
        "deliverable": "Exam Final Submission API & Auto-Close Daemon"
    },

    # -------------------------------------------------------------
    # PHASE 6: Real-time Proctoring, Telemetry & Plagiarism Detection
    # -------------------------------------------------------------
    {
        "task_id": "FE-601",
        "phase": "Phase 6: Proctoring & Telemetry",
        "module": "Live Monitoring",
        "track": "Frontend",
        "task_name": "Invigilator Live Monitoring Grid & Risk Badges",
        "description": "Tile view (4x4, 6x6) of student webcams, risk tier filters (Normal, Monitor, Suspicious, Critical 0-100), quick actions (warn, pause, terminate)",
        "role": "Senior Frontend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 6,
        "dependencies": "FE-101, BE-601",
        "deliverable": "Invigilator Monitoring Grid Dashboard"
    },
    {
        "task_id": "FE-602",
        "phase": "Phase 6: Proctoring & Telemetry",
        "module": "Session Detail",
        "track": "Frontend",
        "task_name": "Student Live Session Detail & 1-to-1 Warning Chat",
        "description": "Dual-stream view (Webcam + Screen), violation timeline stream, 1-to-1 invigilator chat, student control triggers",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "FE-601, BE-601",
        "deliverable": "Student Session Detail & Warning Modal"
    },
    {
        "task_id": "FE-603",
        "phase": "Phase 6: Proctoring & Telemetry",
        "module": "Malpractice Vault",
        "track": "Frontend",
        "task_name": "Malpractice Alerts & Evidence Locker UI",
        "description": "Filterable logged violations table, Evidence Review modal (synchronized webcam snapshot, screen capture, audio clip, confirm/dismiss actions)",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "FE-601, BE-602",
        "deliverable": "Malpractice Alert Table & Evidence Review Modal"
    },
    {
        "task_id": "FE-604",
        "phase": "Phase 6: Proctoring & Telemetry",
        "module": "Plagiarism UI",
        "track": "Frontend",
        "task_name": "Answer Similarity & Collision Comparison Viewer",
        "description": "Pairwise similarity matrix, side-by-side student answer comparison highlighting matching text, same wrong MCQ patterns, time delta, shared IP",
        "role": "Frontend Engineer",
        "complexity": "High",
        "priority": "P2",
        "mandays": 4,
        "dependencies": "FE-101, BE-603",
        "deliverable": "Answer Similarity Analysis Dashboard"
    },
    {
        "task_id": "BE-601",
        "phase": "Phase 6: Proctoring & Telemetry",
        "module": "Telemetry Bus",
        "track": "Backend",
        "task_name": "Invigilation WebSocket Service & Telemetry Ingestion",
        "description": "WebSockets (/proctor-feed, /student-telemetry), real-time event bus for tab switches, face lost, multi-face, audio anomalies, and command dispatch",
        "role": "Lead Backend / Real-Time Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "BE-101, BE-501",
        "deliverable": "Real-Time Telemetry & Invigilation WebSocket Bus"
    },
    {
        "task_id": "BE-602",
        "phase": "Phase 6: Proctoring & Telemetry",
        "module": "Risk Scoring",
        "track": "Backend",
        "task_name": "Dynamic Risk Scoring Engine & S3 Evidence Locker",
        "description": "Streaming rule engine computing 0-100 risk score based on violation severity/frequency, encrypted S3 archival of snapshot frames and audio snippets",
        "role": "Senior Backend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "BE-601",
        "deliverable": "Dynamic Risk Scoring Engine & Evidence Vault"
    },
    {
        "task_id": "BE-603",
        "phase": "Phase 6: Proctoring & Telemetry",
        "module": "Plagiarism Engine",
        "track": "Backend",
        "task_name": "Plagiarism & Answer Similarity Analysis Job",
        "description": "Post-exam background worker computing cosine text similarity, Levenshtein distance, MCQ wrong-option clusters, IP/device collision checks",
        "role": "Data / Backend Engineer",
        "complexity": "High",
        "priority": "P2",
        "mandays": 5,
        "dependencies": "BE-502, BE-504",
        "deliverable": "Automated Similarity Analysis Worker"
    },

    # -------------------------------------------------------------
    # PHASE 7: Evaluation Engine, Blind Grading & 4-Tier Approval Workflow
    # -------------------------------------------------------------
    {
        "task_id": "FE-701",
        "phase": "Phase 7: Evaluation & Grading",
        "module": "Teacher Dashboard",
        "track": "Frontend",
        "task_name": "Evaluation Dashboard & Submissions Queue",
        "description": "Exam submission overview (Total, Auto-Graded, Pending Manual Review, Completed), filter by class/division/status, progress bars",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 3,
        "dependencies": "FE-101, BE-702",
        "deliverable": "Evaluation Dashboard & Queue View"
    },
    {
        "task_id": "FE-702",
        "phase": "Phase 7: Evaluation & Grading",
        "module": "Grading Workspace",
        "track": "Frontend",
        "task_name": "Question/Student Grading Workspace & Blind Mode",
        "description": "Side-by-side student answer vs model rubric, mark award inputs with max limits, step marks, feedback, Blind Evaluation toggle (mask student PII)",
        "role": "Senior Frontend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "FE-701, BE-702",
        "deliverable": "Subjective Answer Grading Workspace"
    },
    {
        "task_id": "FE-703",
        "phase": "Phase 7: Evaluation & Grading",
        "module": "PDF Annotation",
        "track": "Frontend",
        "task_name": "On-Screen PDF & Handwritten Attachment Grading Tool",
        "description": "Interactive PDF/Image canvas with Zoom, Rotate, Freehand Pen, Checkmarks, Crossmarks, Text comments, Score stamps, auto-sum marks",
        "role": "Senior Frontend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 6,
        "dependencies": "FE-701, BE-702",
        "deliverable": "Digital PDF Annotation & Pen Grading Canvas"
    },
    {
        "task_id": "FE-704",
        "phase": "Phase 7: Evaluation & Grading",
        "module": "Approval Workflow",
        "track": "Frontend",
        "task_name": "4-Tier Result Approval & Moderation UI",
        "description": "Progress steps (Eval Done -> Teacher Review -> Coordinator Approval -> Published), Grace marks / formula runner, Official Publish action",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 4,
        "dependencies": "FE-701, BE-703",
        "deliverable": "Result Approval & Moderation View"
    },
    {
        "task_id": "BE-701",
        "phase": "Phase 7: Evaluation & Grading",
        "module": "Auto-Grading",
        "track": "Backend",
        "task_name": "Objective Question Auto-Evaluation Service",
        "description": "Automated grading worker for MCQ (single/multi), One-Word regex synonym matching, negative mark calculation rules",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P0",
        "mandays": 3,
        "dependencies": "BE-504",
        "deliverable": "Auto-Evaluation Background Worker"
    },
    {
        "task_id": "BE-702",
        "phase": "Phase 7: Evaluation & Grading",
        "module": "Manual Grading APIs",
        "track": "Backend",
        "task_name": "Manual Evaluation & Vector Annotation Storage APIs",
        "description": "APIs to fetch submissions, assign rubric scores, feedback, blind grading PII masking filter, store JSON vector layer for pen annotations",
        "role": "Senior Backend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "BE-701",
        "deliverable": "Manual Grading & Annotation APIs"
    },
    {
        "task_id": "BE-703",
        "phase": "Phase 7: Evaluation & Grading",
        "module": "Approval State Machine",
        "track": "Backend",
        "task_name": "4-Tier Result Approval State Machine & Moderation Engine",
        "description": "State transitions (Teacher submit -> Coordinator sign-off -> Publish), bulk grace mark processor, grade calculation, immutable sign-off logs",
        "role": "Backend Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "BE-702",
        "deliverable": "Result Approval State Machine & Moderation Engine"
    },

    # -------------------------------------------------------------
    # PHASE 8: Analytics, Parent/Student Dashboards, ERP Sync & Audit
    # -------------------------------------------------------------
    {
        "task_id": "FE-801",
        "phase": "Phase 8: Analytics, ERP & Dashboards",
        "module": "Student/Parent Portal",
        "track": "Frontend",
        "task_name": "Student & Parent Digital Scorecard Portal",
        "description": "Report Card view with subject breakdown, rank, grade, question-level review modal (correct answer, marks, feedback), performance radar chart",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "FE-101, BE-801",
        "deliverable": "Student & Parent Scorecard Portal Views"
    },
    {
        "task_id": "FE-802",
        "phase": "Phase 8: Analytics, ERP & Dashboards",
        "module": "Academic Reports",
        "track": "Frontend",
        "task_name": "Academic Analytics & Tabulation Sheet Exporter UI",
        "description": "Class performance comparisons, question discrimination index, Bloom achievement heatmaps, Master Tabulation sheet & batch PDF downloads",
        "role": "Frontend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "FE-101, BE-801",
        "deliverable": "Academic Analytics & Report Export Views"
    },
    {
        "task_id": "FE-803",
        "phase": "Phase 8: Analytics, ERP & Dashboards",
        "module": "System Settings",
        "track": "Frontend",
        "task_name": "System Settings, ERP Status & Global Audit Log UI",
        "description": "Proctoring sensitivity thresholds config, ERP sync status & health dashboard, tamper-proof global audit log viewer",
        "role": "Frontend Engineer",
        "complexity": "Low",
        "priority": "P2",
        "mandays": 3,
        "dependencies": "FE-101, BE-803, BE-804",
        "deliverable": "System Settings & Audit Log Views"
    },
    {
        "task_id": "BE-801",
        "phase": "Phase 8: Analytics, ERP & Dashboards",
        "module": "Reports Engine",
        "track": "Backend",
        "task_name": "Analytics Aggregator & Batch PDF Report Generator",
        "description": "Performance aggregations, discrimination index calculator, asynchronous PDF report card generation service (Puppeteer/PDFKit)",
        "role": "Backend Engineer",
        "complexity": "High",
        "priority": "P1",
        "mandays": 5,
        "dependencies": "BE-703",
        "deliverable": "Analytics Service & PDF Report Card Generator"
    },
    {
        "task_id": "BE-802",
        "phase": "Phase 8: Analytics, ERP & Dashboards",
        "module": "Notifications",
        "track": "Backend",
        "task_name": "Multi-Channel Notification Dispatcher",
        "description": "SMS, WhatsApp Business API, and Email (SendGrid/SES) worker for exam schedule reminders, start alerts, result publish notifications",
        "role": "Backend Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 4,
        "dependencies": "BE-303, BE-703",
        "deliverable": "Multi-Channel Notification Gateway"
    },
    {
        "task_id": "BE-803",
        "phase": "Phase 8: Analytics, ERP & Dashboards",
        "module": "ERP Sync",
        "track": "Backend",
        "task_name": "Bi-Directional School ERP Sync Adapter",
        "description": "Inbound sync (Students, Teachers, Classes, Timetable) and Outbound sync (Final published marks & attendance back to ERP gradebook) with webhooks",
        "role": "Lead Backend / Integration Engineer",
        "complexity": "High",
        "priority": "P1",
        "mandays": 5,
        "dependencies": "BE-103, BE-104, BE-703",
        "deliverable": "ERP Bi-Directional Sync Gateway & Webhooks"
    },
    {
        "task_id": "BE-804",
        "phase": "Phase 8: Analytics, ERP & Dashboards",
        "module": "Compliance & Audit",
        "track": "Backend",
        "task_name": "Cold Storage Archival & Immutable Audit Trail",
        "description": "Automated 90-day cold storage archival for proctoring video/evidence, immutable audit logging for all mark overrides and approvals",
        "role": "Backend / DevOps Engineer",
        "complexity": "Medium",
        "priority": "P1",
        "mandays": 3,
        "dependencies": "BE-602, BE-703",
        "deliverable": "Compliance Archival Worker & Audit Service"
    },

    # -------------------------------------------------------------
    # CROSS-CUTTING: QA Testing, Security & DevOps
    # -------------------------------------------------------------
    {
        "task_id": "QA-101",
        "phase": "Cross-Cutting: QA & DevOps",
        "module": "Testing & QA",
        "track": "QA & Testing",
        "task_name": "End-to-End Automated Test Suite (Playwright / Cypress)",
        "description": "E2E test automation for Exam creation wizard, Student pre-check & exam taking, Auto-save recovery, Proctoring alerts, Teacher grading",
        "role": "Senior QA Automation Engineer",
        "complexity": "High",
        "priority": "P1",
        "mandays": 8,
        "dependencies": "All Phases",
        "deliverable": "E2E Playwright Automation Test Suite"
    },
    {
        "task_id": "SEC-101",
        "phase": "Cross-Cutting: QA & DevOps",
        "module": "Security & Pentesting",
        "track": "Security",
        "task_name": "Security Audit, Penetration Testing & Anti-Cheat Validation",
        "description": "DevTools bypass testing, WebSocket token spoofing tests, Rate limit stress testing, OWASP Top 10 API vulnerability scan, PII encryption review",
        "role": "Security Specialist",
        "complexity": "High",
        "priority": "P0",
        "mandays": 5,
        "dependencies": "BE-102, BE-501, BE-601",
        "deliverable": "Vulnerability Assessment & Pentest Report"
    },
    {
        "task_id": "OPS-101",
        "phase": "Cross-Cutting: QA & DevOps",
        "module": "Infrastructure & CI/CD",
        "track": "DevOps",
        "task_name": "Cloud Infrastructure (K8s/Docker), CI/CD & Auto-Scaling",
        "description": "Docker containerization, Kubernetes helm charts, Redis cluster, S3 storage buckets, WebSocket load balancers, and GitHub Actions CI/CD pipeline",
        "role": "DevOps Engineer",
        "complexity": "High",
        "priority": "P0",
        "mandays": 6,
        "dependencies": "BE-101, BE-601",
        "deliverable": "Terraform / K8s Deployment & CI/CD Pipeline"
    }
]

# 1. GENERATE CSV FILE
csv_file_path = "/home/arshad/Workspace/demo/online-class and assesment/docs/PROJECT_DEVELOPMENT_TASKLIST_AND_MANDAYS.csv"
fieldnames = [
    "task_id", "phase", "module", "track", "task_name", "description",
    "role", "complexity", "priority", "mandays", "dependencies", "deliverable"
]

with open(csv_file_path, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in tasks_data:
        writer.writerow(row)

print(f"Generated CSV successfully: {csv_file_path}")

# 2. GENERATE EXCEL (.XLSX) WITH STYLED SHEETS AND DASHBOARD SUMMARY
excel_file_path = "/home/arshad/Workspace/demo/online-class and assesment/docs/PROJECT_DEVELOPMENT_TASKLIST_AND_MANDAYS.xlsx"
wb = openpyxl.Workbook()

# Style configurations
header_fill = PatternFill(start_color="1E293B", end_color="1E293B", fill_type="solid") # Dark Navy
header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
sub_header_fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
sub_header_font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")

fe_fill = PatternFill(start_color="EFF6FF", end_color="EFF6FF", fill_type="solid") # Light Blue
be_fill = PatternFill(start_color="F0FDF4", end_color="F0FDF4", fill_type="solid") # Light Green
qa_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # Light Amber
p0_font = Font(name="Calibri", size=10, bold=True, color="DC2626") # Red
p1_font = Font(name="Calibri", size=10, bold=True, color="D97706") # Amber
p2_font = Font(name="Calibri", size=10, color="2563EB") # Blue

thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

# SHEET 1: EXECUTIVE SUMMARY & MANDAYS BY TRACK & PHASE
ws_summary = wb.active
ws_summary.title = "Executive Summary & Effort"
ws_summary.views.sheetView[0].showGridLines = True

# Title Block
ws_summary.merge_cells("A1:G1")
ws_summary["A1"] = "ONLINE CLASS & ASSESSMENT PLATFORM — PROJECT EFFORT & MANDAY SUMMARY"
ws_summary["A1"].font = Font(name="Calibri", size=15, bold=True, color="FFFFFF")
ws_summary["A1"].fill = header_fill
ws_summary["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws_summary.row_dimensions[1].height = 32

# Metrics calculation
total_mandays = sum(t["mandays"] for t in tasks_data)
fe_mandays = sum(t["mandays"] for t in tasks_data if t["track"] == "Frontend")
be_mandays = sum(t["mandays"] for t in tasks_data if t["track"] == "Backend")
qa_ops_mandays = sum(t["mandays"] for t in tasks_data if t["track"] in ["QA & Testing", "Security", "DevOps"])

ws_summary["A3"] = "Track"
ws_summary["B3"] = "Total Tasks"
ws_summary["C3"] = "Total Mandays"
ws_summary["D3"] = "% Effort"
ws_summary["E3"] = "Recommended Team Size"
ws_summary["F3"] = "Est. Duration (Weeks)"

for col in ["A3", "B3", "C3", "D3", "E3", "F3"]:
    ws_summary[col].font = header_font
    ws_summary[col].fill = sub_header_fill
    ws_summary[col].alignment = Alignment(horizontal="center", vertical="center")
    ws_summary[col].border = thin_border

track_summaries = [
    ("Frontend Track", len([t for t in tasks_data if t["track"] == "Frontend"]), fe_mandays, "2 Senior React/TS Devs", f"{round(fe_mandays / 2 / 5, 1)} wks"),
    ("Backend Track", len([t for t in tasks_data if t["track"] == "Backend"]), be_mandays, "2 Senior Node/Postgres/WebRTC Devs", f"{round(be_mandays / 2 / 5, 1)} wks"),
    ("QA, Security & DevOps", len([t for t in tasks_data if t["track"] in ["QA & Testing", "Security", "DevOps"]]), qa_ops_mandays, "1 QA Lead + 1 DevOps/Sec", f"{round(qa_ops_mandays / 2 / 5, 1)} wks"),
]

row_idx = 4
for name, count, days, team, dur in track_summaries:
    ws_summary.cell(row=row_idx, column=1, value=name).alignment = Alignment(horizontal="left")
    ws_summary.cell(row=row_idx, column=2, value=count).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=3, value=days).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=4, value=f"{round((days/total_mandays)*100, 1)}%").alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=5, value=team).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=6, value=dur).alignment = Alignment(horizontal="center")
    for c in range(1, 7):
        ws_summary.cell(row=row_idx, column=c).border = thin_border
    row_idx += 1

# Total Row
ws_summary.cell(row=row_idx, column=1, value="TOTAL OVERALL PROJECT").font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=2, value=len(tasks_data)).font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=3, value=total_mandays).font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=4, value="100.0%").font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=5, value="5-6 Engineers Total").font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=6, value="~12-14 Weeks Delivery").font = Font(name="Calibri", size=11, bold=True)
for c in range(1, 7):
    ws_summary.cell(row=row_idx, column=c).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=c).fill = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid")
    ws_summary.cell(row=row_idx, column=c).border = thin_border

# Phase Breakdown Table
row_idx += 3
ws_summary.cell(row=row_idx, column=1, value="Phase").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=2, value="FE Mandays").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=3, value="BE Mandays").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=4, value="Other Mandays").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=5, value="Total Phase Mandays").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=6, value="Phase Priority").fill = sub_header_fill

for c in range(1, 7):
    ws_summary.cell(row=row_idx, column=c).font = header_font
    ws_summary.cell(row=row_idx, column=c).alignment = Alignment(horizontal="center", vertical="center")
    ws_summary.cell(row=row_idx, column=c).border = thin_border

phases = [
    "Phase 1: Foundation & RBAC",
    "Phase 2: Question Bank",
    "Phase 3: Exam Creation Wizard",
    "Phase 4: Live Class & Spot Quizzes",
    "Phase 5: Student Exam Portal",
    "Phase 6: Proctoring & Telemetry",
    "Phase 7: Evaluation & Grading",
    "Phase 8: Analytics, ERP & Dashboards",
    "Cross-Cutting: QA & DevOps"
]

row_idx += 1
for p in phases:
    p_tasks = [t for t in tasks_data if t["phase"] == p]
    fe_d = sum(t["mandays"] for t in p_tasks if t["track"] == "Frontend")
    be_d = sum(t["mandays"] for t in p_tasks if t["track"] == "Backend")
    ot_d = sum(t["mandays"] for t in p_tasks if t["track"] not in ["Frontend", "Backend"])
    tot_d = sum(t["mandays"] for t in p_tasks)
    
    ws_summary.cell(row=row_idx, column=1, value=p).alignment = Alignment(horizontal="left")
    ws_summary.cell(row=row_idx, column=2, value=fe_d).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=3, value=be_d).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=4, value=ot_d).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=5, value=tot_d).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=6, value="P0 / Essential" if "Phase 1" in p or "Phase 3" in p or "Phase 5" in p else "P1 / High").alignment = Alignment(horizontal="center")
    for c in range(1, 7):
        ws_summary.cell(row=row_idx, column=c).border = thin_border
    row_idx += 1

for col in ws_summary.columns:
    max_len = max(len(str(cell.value or "")) for cell in col)
    col_letter = get_column_letter(col[0].column)
    ws_summary.column_dimensions[col_letter].width = max(max_len + 4, 14)

# SHEET 2: ALL TASKS MASTER LIST
ws_all = wb.create_sheet(title="All Tasks Master List")
ws_all.views.sheetView[0].showGridLines = True

headers = [
    ("Task ID", 12),
    ("Phase", 30),
    ("Module", 24),
    ("Track", 14),
    ("Task Name", 38),
    ("Description", 55),
    ("Assigned Role", 26),
    ("Complexity", 14),
    ("Priority", 12),
    ("Mandays", 12),
    ("Dependencies", 18),
    ("Key Deliverable / Artifact", 38)
]

for col_idx, (header_text, width) in enumerate(headers, start=1):
    cell = ws_all.cell(row=1, column=col_idx, value=header_text)
    cell.font = header_font
    cell.fill = header_fill
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    col_letter = get_column_letter(col_idx)
    ws_all.column_dimensions[col_letter].width = width

ws_all.row_dimensions[1].height = 28

for r_idx, task in enumerate(tasks_data, start=2):
    ws_all.cell(row=r_idx, column=1, value=task["task_id"]).alignment = Alignment(horizontal="center", vertical="center")
    ws_all.cell(row=r_idx, column=2, value=task["phase"]).alignment = Alignment(horizontal="left", vertical="center")
    ws_all.cell(row=r_idx, column=3, value=task["module"]).alignment = Alignment(horizontal="left", vertical="center")
    
    track_cell = ws_all.cell(row=r_idx, column=4, value=task["track"])
    track_cell.alignment = Alignment(horizontal="center", vertical="center")
    if task["track"] == "Frontend":
        track_cell.fill = fe_fill
    elif task["track"] == "Backend":
        track_cell.fill = be_fill
    else:
        track_cell.fill = qa_fill

    ws_all.cell(row=r_idx, column=5, value=task["task_name"]).alignment = Alignment(horizontal="left", vertical="center")
    
    desc_cell = ws_all.cell(row=r_idx, column=6, value=task["description"])
    desc_cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    
    ws_all.cell(row=r_idx, column=7, value=task["role"]).alignment = Alignment(horizontal="left", vertical="center")
    ws_all.cell(row=r_idx, column=8, value=task["complexity"]).alignment = Alignment(horizontal="center", vertical="center")
    
    prio_cell = ws_all.cell(row=r_idx, column=9, value=task["priority"])
    prio_cell.alignment = Alignment(horizontal="center", vertical="center")
    if task["priority"] == "P0":
        prio_cell.font = p0_font
    elif task["priority"] == "P1":
        prio_cell.font = p1_font
    else:
        prio_cell.font = p2_font

    ws_all.cell(row=r_idx, column=10, value=task["mandays"]).alignment = Alignment(horizontal="center", vertical="center")
    ws_all.cell(row=r_idx, column=11, value=task["dependencies"]).alignment = Alignment(horizontal="center", vertical="center")
    ws_all.cell(row=r_idx, column=12, value=task["deliverable"]).alignment = Alignment(horizontal="left", vertical="center")

    for c in range(1, 13):
        ws_all.cell(row=r_idx, column=c).border = thin_border
    ws_all.row_dimensions[r_idx].height = 24

# SHEET 3: FRONTEND TRACK
ws_fe = wb.create_sheet(title="Frontend Track")
ws_fe.views.sheetView[0].showGridLines = True
for col_idx, (header_text, width) in enumerate(headers, start=1):
    cell = ws_fe.cell(row=1, column=col_idx, value=header_text)
    cell.font = header_font
    cell.fill = sub_header_fill
    cell.alignment = Alignment(horizontal="center", vertical="center")
    col_letter = get_column_letter(col_idx)
    ws_fe.column_dimensions[col_letter].width = width

fe_tasks = [t for t in tasks_data if t["track"] == "Frontend"]
for r_idx, task in enumerate(fe_tasks, start=2):
    for c_idx, key in enumerate(["task_id", "phase", "module", "track", "task_name", "description", "role", "complexity", "priority", "mandays", "dependencies", "deliverable"], start=1):
        c = ws_fe.cell(row=r_idx, column=c_idx, value=task[key])
        c.border = thin_border
        c.alignment = Alignment(horizontal="center" if key in ["task_id", "track", "complexity", "priority", "mandays", "dependencies"] else "left", vertical="center")
    ws_fe.row_dimensions[r_idx].height = 24

# SHEET 4: BACKEND TRACK
ws_be = wb.create_sheet(title="Backend Track")
ws_be.views.sheetView[0].showGridLines = True
for col_idx, (header_text, width) in enumerate(headers, start=1):
    cell = ws_be.cell(row=1, column=col_idx, value=header_text)
    cell.font = header_font
    cell.fill = sub_header_fill
    cell.alignment = Alignment(horizontal="center", vertical="center")
    col_letter = get_column_letter(col_idx)
    ws_be.column_dimensions[col_letter].width = width

be_tasks = [t for t in tasks_data if t["track"] == "Backend"]
for r_idx, task in enumerate(be_tasks, start=2):
    for c_idx, key in enumerate(["task_id", "phase", "module", "track", "task_name", "description", "role", "complexity", "priority", "mandays", "dependencies", "deliverable"], start=1):
        c = ws_be.cell(row=r_idx, column=c_idx, value=task[key])
        c.border = thin_border
        c.alignment = Alignment(horizontal="center" if key in ["task_id", "track", "complexity", "priority", "mandays", "dependencies"] else "left", vertical="center")
    ws_be.row_dimensions[r_idx].height = 24

# Save Workbook
wb.save(excel_file_path)
print(f"Generated Excel successfully: {excel_file_path}")
