import csv
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# Optimized 2-Month (8 Weeks / 40 Mandays per role) Plan for:
# 1 Frontend Engineer, 1 Backend Engineer, 1 QA Engineer

sprint_tasks = [
    # ------------------------------------------------------------------------------------------------------------------
    # SPRINT 1 (Weeks 1–2 / Days 1–10): Foundation, RBAC, Academic Structure & Question Bank
    # ------------------------------------------------------------------------------------------------------------------
    {
        "task_id": "FE-101",
        "sprint": "Sprint 1 (W1-2)",
        "week": "Week 1",
        "phase": "Phase 1: Foundation & RBAC",
        "track": "Frontend",
        "module": "UI Framework",
        "task_name": "Design System, Shell Layout & Dynamic Role Switcher",
        "description": "Responsive layout, Sidebar, Header, Role Switcher (Admin/Coord/Teacher/Proctor/Student/Parent), core UI components",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0 (Blocker)",
        "mandays": 3,
        "deliverable": "Global Layout, Role Switcher & Atomic UI Kit"
    },
    {
        "task_id": "BE-101",
        "sprint": "Sprint 1 (W1-2)",
        "week": "Week 1",
        "phase": "Phase 1: Foundation & RBAC",
        "track": "Backend",
        "module": "Database & Architecture",
        "task_name": "PostgreSQL Schema, Models & Migration Pipeline",
        "description": "Database schema for Tenants, Academic Hierarchy, Users, Roles, Permissions, Accommodations, indexing and constraints",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 3,
        "deliverable": "PostgreSQL Schema & Prisma/ORM Models"
    },
    {
        "task_id": "FE-102",
        "sprint": "Sprint 1 (W1-2)",
        "week": "Week 1",
        "phase": "Phase 1: Foundation & RBAC",
        "track": "Frontend",
        "module": "Authentication",
        "task_name": "Multi-Role Login & ERP Seamless SSO Portal",
        "description": "Email/Password & Student PIN login forms, Seamless ERP 1-Click SSO Launch receiver (JWT/LTI 1.3), role route guards, auto-refresh tokens",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0 (Blocker)",
        "mandays": 2,
        "deliverable": "Login Views, ERP SSO Receiver, Role Guards"
    },
    {
        "task_id": "BE-102",
        "sprint": "Sprint 1 (W1-2)",
        "week": "Week 1",
        "phase": "Phase 1: Foundation & RBAC",
        "track": "Backend",
        "module": "Authentication",
        "task_name": "JWT Auth, ERP SSO Handshake & JIT Provisioning",
        "description": "Endpoints for native login, ERP Signed Launch Token validator, Just-In-Time (JIT) student/staff auto-provisioning, and RBAC middleware",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 3,
        "deliverable": "Auth REST APIs, ERP SSO Handshake & JIT Provisioner"
    },
    {
        "task_id": "QA-101",
        "sprint": "Sprint 1 (W1-2)",
        "week": "Week 1-2",
        "phase": "Phase 1 & 2 QA",
        "track": "QA & Testing",
        "module": "Test Architecture",
        "task_name": "Test Environment Setup & Auth/Academic Test Cases",
        "description": "Setup automated test framework (Playwright/Postman), write test suites for Auth, RBAC permissions, and Academic CRUD APIs",
        "assigned_to": "1x QA Engineer",
        "complexity": "Medium",
        "priority": "P0 (Blocker)",
        "mandays": 10,
        "deliverable": "Automated Test Suite for Auth & Core APIs"
    },
    {
        "task_id": "FE-103",
        "sprint": "Sprint 1 (W1-2)",
        "week": "Week 2",
        "phase": "Phase 1: Foundation & RBAC",
        "track": "Frontend",
        "module": "Academic Master Data",
        "task_name": "Academic Hierarchy & User Roster Management UI",
        "description": "CRUD screens for Academic Years, Classes, Divisions, Subjects, Chapters, and Student roster with Accommodations modal",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0 (Blocker)",
        "mandays": 2,
        "deliverable": "Academic Structure & User Views"
    },
    {
        "task_id": "BE-103",
        "sprint": "Sprint 1 (W1-2)",
        "week": "Week 2",
        "phase": "Phase 1: Foundation & RBAC",
        "track": "Backend",
        "module": "Academic Services",
        "task_name": "Academic Hierarchy & Roster CRUD APIs",
        "description": "REST endpoints for Academic structure, Teacher allocations, Student roster, Accommodations, and CSV bulk import",
        "assigned_to": "1x Backend Engineer",
        "complexity": "Medium",
        "priority": "P0 (Blocker)",
        "mandays": 2,
        "deliverable": "Academic & User CRUD REST APIs"
    },
    {
        "task_id": "FE-201",
        "sprint": "Sprint 1 (W1-2)",
        "week": "Week 2",
        "phase": "Phase 2: Question Bank",
        "track": "Frontend",
        "module": "Question Bank",
        "task_name": "Question Bank Explorer & Multi-Type Authoring UI",
        "description": "Question explorer with hierarchy filter, authoring for MCQ, One-word, Short/Long, Essay with KaTeX formulas and rubrics",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 3,
        "deliverable": "Question Bank Explorer & Authoring Studio"
    },
    {
        "task_id": "BE-201",
        "sprint": "Sprint 1 (W1-2)",
        "week": "Week 2",
        "phase": "Phase 2: Question Bank",
        "track": "Backend",
        "module": "Question Bank",
        "task_name": "Question Bank Storage, Search & Randomizer APIs",
        "description": "Question schemas, full-text search, subject/chapter filtering, bulk CSV question import, and dynamic random question pool selector",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 2,
        "deliverable": "Question Bank API Suite & Randomizer"
    },

    # ------------------------------------------------------------------------------------------------------------------
    # SPRINT 2 (Weeks 3–4 / Days 11–20): 7-Step Exam Creation Wizard & Live Classroom
    # ------------------------------------------------------------------------------------------------------------------
    {
        "task_id": "FE-301",
        "sprint": "Sprint 2 (W3-4)",
        "week": "Week 3-4",
        "phase": "Phase 3: Exam Wizard",
        "track": "Frontend",
        "module": "Exam Creation",
        "task_name": "7-Step Exam Creation Wizard (Pool + PDF Upload)",
        "description": "Step 1 (Basic info), Step 2 (Recipients), Step 3 (Academic mapping), Step 4 (Source), Step 5 (Marks matrix & PDF setup), Step 6 (Controls), Step 7 (Publish)",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 6,
        "deliverable": "Complete 7-Step Exam Creation Wizard"
    },
    {
        "task_id": "BE-301",
        "sprint": "Sprint 2 (W3-4)",
        "week": "Week 3",
        "phase": "Phase 3: Exam Wizard",
        "track": "Backend",
        "module": "Exam Engine",
        "task_name": "Exam Engine Schemas, CRUD & Multi-Step APIs",
        "description": "Exams, Recipients, Questions, Sections, Security models, validation pipeline, and state machine (Draft -> Scheduled -> Active)",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 4,
        "deliverable": "Exam Configuration & Scheduler APIs"
    },
    {
        "task_id": "BE-302",
        "sprint": "Sprint 2 (W3-4)",
        "week": "Week 4",
        "phase": "Phase 3: Exam Wizard",
        "track": "Backend",
        "module": "PDF Paper Engine",
        "task_name": "PDF Question Paper Upload & Section Setup Service",
        "description": "Multipart PDF upload to S3/GCS, section schema storage (Section A/B/C, max marks, choice rules), and PDF URL signing",
        "assigned_to": "1x Backend Engineer",
        "complexity": "Medium",
        "priority": "P0 (Blocker)",
        "mandays": 2,
        "deliverable": "PDF Upload & Section Setup APIs"
    },
    {
        "task_id": "FE-401",
        "sprint": "Sprint 2 (W3-4)",
        "week": "Week 4",
        "phase": "Phase 4: Live Classes",
        "track": "Frontend",
        "module": "Virtual Classroom",
        "task_name": "Live Classroom UI & Spot Quiz Real-Time Modal",
        "description": "Teacher video grid/Meet embed, attendance list, 1-click spot quiz trigger, live response bar chart, student quiz popup",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "High",
        "priority": "P1 (High)",
        "mandays": 4,
        "deliverable": "Live Classroom & Spot Quiz Overlay UI"
    },
    {
        "task_id": "BE-401",
        "sprint": "Sprint 2 (W3-4)",
        "week": "Week 4",
        "phase": "Phase 4: Live Classes",
        "track": "Backend",
        "module": "WebSockets",
        "task_name": "Live Class Signaling & Spot Quiz Redis Collector",
        "description": "WebSocket gateway for classroom events (join/leave/chat), attendance heartbeat tracker, and sub-second in-memory spot quiz collector",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P1 (High)",
        "mandays": 4,
        "deliverable": "Classroom WebSocket Gateway & Spot Quiz Engine"
    },
    {
        "task_id": "QA-102",
        "sprint": "Sprint 2 (W3-4)",
        "week": "Week 3-4",
        "phase": "Phase 3 & 4 QA",
        "track": "QA & Testing",
        "module": "Exam & Class Testing",
        "task_name": "Exam Creation Flow, PDF Parsing & Live WS Testing",
        "description": "Validate 7-step wizard validations, marks matching, PDF uploads, recipient assignments, WebRTC signaling & spot quiz broadcast latency",
        "assigned_to": "1x QA Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 10,
        "deliverable": "Exam Wizard & Live Class QA Verification Report"
    },

    # ------------------------------------------------------------------------------------------------------------------
    # SPRINT 3 (Weeks 5–6 / Days 21–30): Student Secure Exam Portal & Real-Time Proctoring
    # ------------------------------------------------------------------------------------------------------------------
    {
        "task_id": "FE-501",
        "sprint": "Sprint 3 (W5-6)",
        "week": "Week 5",
        "phase": "Phase 5: Student Exam",
        "track": "Frontend",
        "module": "Pre-Exam Check",
        "task_name": "Student Pre-Exam System Readiness Check Wizard",
        "description": "4-Step Pre-check: Cam & Mic check, AI Face identification, Network ping/bandwidth test, Fullscreen & exam rules acknowledgement",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 3,
        "deliverable": "System Readiness Check Wizard View"
    },
    {
        "task_id": "BE-501",
        "sprint": "Sprint 3 (W5-6)",
        "week": "Week 5",
        "phase": "Phase 5: Student Exam",
        "track": "Backend",
        "module": "Session Security",
        "task_name": "Student Session Init & Encrypted Token Generator",
        "description": "Time window & eligibility verification, device readiness logging, reference selfie storage, and tamper-proof session token generator",
        "assigned_to": "1x Backend Engineer",
        "complexity": "Medium",
        "priority": "P0 (Blocker)",
        "mandays": 2,
        "deliverable": "Student Session Init & Token Service"
    },
    {
        "task_id": "FE-502",
        "sprint": "Sprint 3 (W5-6)",
        "week": "Week 5-6",
        "phase": "Phase 5: Student Exam",
        "track": "Frontend",
        "module": "Exam Interface",
        "task_name": "Secure Exam Lockdown Workspace & Palette",
        "description": "Locked-down Fullscreen UI, Tab switch detector, accommodations countdown timer, Question Palette (Answered/Review/Unanswered), auto-save sync",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 4,
        "deliverable": "Locked-Down Exam Interface & Question Palette"
    },
    {
        "task_id": "BE-502",
        "sprint": "Sprint 3 (W5-6)",
        "week": "Week 5-6",
        "phase": "Phase 5: Student Exam",
        "track": "Backend",
        "module": "Auto-Save Engine",
        "task_name": "Resilient Auto-Save Pipeline & Auto-Submit Daemon",
        "description": "Redis keystroke buffer, batch flush to Postgres every 10s, S3 attachment uploads, server-side timer daemon to auto-close expired exams",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 4,
        "deliverable": "Fault-Tolerant Auto-Save & Auto-Close Daemon"
    },
    {
        "task_id": "FE-601",
        "sprint": "Sprint 3 (W5-6)",
        "week": "Week 6",
        "phase": "Phase 6: Proctoring",
        "track": "Frontend",
        "module": "Live Proctoring",
        "task_name": "Invigilator Live Monitoring Grid & Alert Drawer",
        "description": "Tile grid of student webcams, risk score color badges (0-100), quick actions (warn, pause, terminate), malpractice violation timeline",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 3,
        "deliverable": "Invigilator Monitoring Grid & Alerts UI"
    },
    {
        "task_id": "BE-601",
        "sprint": "Sprint 3 (W5-6)",
        "week": "Week 6",
        "phase": "Phase 6: Proctoring",
        "track": "Backend",
        "module": "Proctoring Bus",
        "task_name": "Telemetry Ingestion Bus & Dynamic Risk Scoring Engine",
        "description": "WebSockets (/proctor-feed), telemetry event parser (tab switch, face lost, multi-face), 0-100 risk scoring algorithm, S3 snapshot vault",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 4,
        "deliverable": "Real-time Telemetry & Risk Scoring Service"
    },
    {
        "task_id": "QA-103",
        "sprint": "Sprint 3 (W5-6)",
        "week": "Week 5-6",
        "phase": "Phase 5 & 6 QA",
        "track": "QA & Testing",
        "module": "Security & Exam Testing",
        "task_name": "Exam Lockdown, Auto-Save Stress Test & Proctoring Simulation",
        "description": "Simulate network dropouts during exam, verify offline answer recovery, test tab-switch traps, simulate 50+ proctor telemetry events simultaneously",
        "assigned_to": "1x QA Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 10,
        "deliverable": "Resilience & Security Test Sign-off Report"
    },

    # ------------------------------------------------------------------------------------------------------------------
    # SPRINT 4 (Weeks 7–8 / Days 31–40): Evaluation, 4-Tier Result Approval, Reports & Launch
    # ------------------------------------------------------------------------------------------------------------------
    {
        "task_id": "FE-701",
        "sprint": "Sprint 4 (W7-8)",
        "week": "Week 7",
        "phase": "Phase 7: Evaluation",
        "track": "Frontend",
        "module": "Grading Workspace",
        "task_name": "Teacher Evaluation Dashboard & PDF Annotation Canvas",
        "description": "Submission queue, blind grading mode (mask PII), side-by-side rubric grading, and interactive PDF digital pen annotation tool",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 4,
        "deliverable": "Evaluation Dashboard & PDF Grading Canvas"
    },
    {
        "task_id": "BE-701",
        "sprint": "Sprint 4 (W7-8)",
        "week": "Week 7",
        "phase": "Phase 7: Evaluation",
        "track": "Backend",
        "module": "Auto & Manual Grading",
        "task_name": "Auto-Grading Worker & Vector Annotation Storage APIs",
        "description": "Auto-eval worker for MCQ & One-Word, manual rubric grading APIs, blind evaluation PII masking, vector JSON pen annotation storage",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 4,
        "deliverable": "Auto-Grading & Manual Evaluation APIs"
    },
    {
        "task_id": "FE-702",
        "sprint": "Sprint 4 (W7-8)",
        "week": "Week 7-8",
        "phase": "Phase 7: Result Approval",
        "track": "Frontend",
        "module": "Approval Workflow",
        "task_name": "4-Tier Result Approval & Moderation UI",
        "description": "Progress steps (Eval Done -> Teacher Review -> Coordinator Sign-Off -> Published), Grace marks / formula runner, Official Publish action",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "Medium",
        "priority": "P0 (Blocker)",
        "mandays": 2,
        "deliverable": "4-Tier Result Approval & Moderation Views"
    },
    {
        "task_id": "BE-702",
        "sprint": "Sprint 4 (W7-8)",
        "week": "Week 7-8",
        "phase": "Phase 7: Result Approval",
        "track": "Backend",
        "module": "Approval Engine",
        "task_name": "4-Tier Approval State Machine & Moderation Processor",
        "description": "State machine transitions, grace mark processor, grade computation, coordinator signature verification, and immutable sign-off logs",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 3,
        "deliverable": "Result Approval State Machine Engine"
    },
    {
        "task_id": "FE-801",
        "sprint": "Sprint 4 (W7-8)",
        "week": "Week 8",
        "phase": "Phase 8: Reports & Portals",
        "track": "Frontend",
        "module": "Scorecards & Reports",
        "task_name": "Student/Parent Scorecards & ERP Sync Status Dashboard",
        "description": "Student/Parent report cards, topic mastery radar charts, question review modal, and ERP Gradebook Sync Status view with manual retry triggers",
        "assigned_to": "1x Frontend Engineer",
        "complexity": "Medium",
        "priority": "P1 (High)",
        "mandays": 4,
        "deliverable": "Scorecard Portals & ERP Sync Status Dashboard"
    },
    {
        "task_id": "BE-801",
        "sprint": "Sprint 4 (W7-8)",
        "week": "Week 8",
        "phase": "Phase 8: Reports & Portals",
        "track": "Backend",
        "module": "Reports & ERP",
        "task_name": "Batch PDF Generator, ERP Gradebook Sync & LTI 1.3 AGS",
        "description": "PDF report card generator (Puppeteer/PDFKit), multi-channel notification dispatcher, Bi-directional School ERP Sync webhook adapter, and LTI 1.3 Assignment & Grade Service stub",
        "assigned_to": "1x Backend Engineer",
        "complexity": "High",
        "priority": "P1 (High)",
        "mandays": 3,
        "deliverable": "PDF Generator, ERP Sync Adapter & LTI 1.3 AGS"
    },
    {
        "task_id": "QA-104",
        "sprint": "Sprint 4 (W7-8)",
        "week": "Week 7-8",
        "phase": "Phase 7 & 8 QA",
        "track": "QA & Testing",
        "module": "Regression & Launch",
        "task_name": "Full End-to-End Regression, Security Pentest & UAT Sign-Off",
        "description": "Full end-to-end regression of entire exam cycle, OWASP security checks, load testing evaluation submission spikes, and User Acceptance Testing sign-off",
        "assigned_to": "1x QA Engineer",
        "complexity": "High",
        "priority": "P0 (Blocker)",
        "mandays": 10,
        "deliverable": "Final QA Production Release Sign-Off"
    }
]

# 1. GENERATE REVISED CSV FILE
csv_file_path = "/home/arshad/Workspace/demo/online-class and assesment/docs/PROJECT_DEVELOPMENT_TASKLIST_AND_MANDAYS.csv"
fieldnames = [
    "task_id", "sprint", "week", "phase", "track", "module", "task_name",
    "description", "assigned_to", "complexity", "priority", "mandays", "deliverable"
]

with open(csv_file_path, mode="w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    for row in sprint_tasks:
        writer.writerow(row)

print(f"Generated 2-Month Sprint CSV: {csv_file_path}")

# 2. GENERATE REVISED EXCEL (.XLSX) WITH SPRINT TIMELINES
excel_file_path = "/home/arshad/Workspace/demo/online-class and assesment/docs/PROJECT_DEVELOPMENT_TASKLIST_AND_MANDAYS.xlsx"
wb = openpyxl.Workbook()

# Style configurations
header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid") # Deep Slate/Navy
header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
sub_header_fill = PatternFill(start_color="334155", end_color="334155", fill_type="solid")
sub_header_font = Font(name="Calibri", size=10, bold=True, color="FFFFFF")

fe_fill = PatternFill(start_color="EFF6FF", end_color="EFF6FF", fill_type="solid") # Light Blue
be_fill = PatternFill(start_color="F0FDF4", end_color="F0FDF4", fill_type="solid") # Light Green
qa_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # Light Amber
p0_font = Font(name="Calibri", size=10, bold=True, color="DC2626") # Red
p1_font = Font(name="Calibri", size=10, bold=True, color="D97706") # Amber

thin_border = Border(
    left=Side(style='thin', color='CBD5E1'),
    right=Side(style='thin', color='CBD5E1'),
    top=Side(style='thin', color='CBD5E1'),
    bottom=Side(style='thin', color='CBD5E1')
)

# SHEET 1: 2-MONTH EXECUTIVE SPRINT ROADMAP
ws_summary = wb.active
ws_summary.title = "2-Month Sprint Plan (3-Person)"
ws_summary.views.sheetView[0].showGridLines = True

# Title Block
ws_summary.merge_cells("A1:G1")
ws_summary["A1"] = "2-MONTH PRODUCTION DELIVERY PLAN (1 FE + 1 BE + 1 QA — 8 WEEKS / 40 WORKING DAYS)"
ws_summary["A1"].font = Font(name="Calibri", size=13, bold=True, color="FFFFFF")
ws_summary["A1"].fill = header_fill
ws_summary["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws_summary.row_dimensions[1].height = 30

ws_summary["A3"] = "Role / Engineer"
ws_summary["B3"] = "Capacity (8 Wks)"
ws_summary["C3"] = "Sprint 1 (W1-2)"
ws_summary["D3"] = "Sprint 2 (W3-4)"
ws_summary["E3"] = "Sprint 3 (W5-6)"
ws_summary["F3"] = "Sprint 4 (W7-8)"
ws_summary["G3"] = "Total Allocated"

for col in ["A3", "B3", "C3", "D3", "E3", "F3", "G3"]:
    ws_summary[col].font = header_font
    ws_summary[col].fill = sub_header_fill
    ws_summary[col].alignment = Alignment(horizontal="center", vertical="center")
    ws_summary[col].border = thin_border

sprints_breakdown = [
    ("1x Frontend Engineer", "40 Mandays", "10 MD", "10 MD", "10 MD", "10 MD", "40 MD (100% capacity)"),
    ("1x Backend Engineer", "40 Mandays", "10 MD", "10 MD", "10 MD", "10 MD", "40 MD (100% capacity)"),
    ("1x QA / Automation Engineer", "40 Mandays", "10 MD", "10 MD", "10 MD", "10 MD", "40 MD (100% capacity)"),
]

row_idx = 4
for role, cap, s1, s2, s3, s4, tot in sprints_breakdown:
    ws_summary.cell(row=row_idx, column=1, value=role).alignment = Alignment(horizontal="left")
    ws_summary.cell(row=row_idx, column=2, value=cap).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=3, value=s1).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=4, value=s2).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=5, value=s3).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=6, value=s4).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=7, value=tot).alignment = Alignment(horizontal="center")
    for c in range(1, 8):
        ws_summary.cell(row=row_idx, column=c).border = thin_border
    row_idx += 1

# Total Row
ws_summary.cell(row=row_idx, column=1, value="TOTAL SPRINT EFFORT").font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=2, value="120 Mandays").font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=3, value="30 Mandays").font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=4, value="30 Mandays").font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=5, value="30 Mandays").font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=6, value="30 Mandays").font = Font(name="Calibri", size=11, bold=True)
ws_summary.cell(row=row_idx, column=7, value="120 MD / 8 Weeks").font = Font(name="Calibri", size=11, bold=True)
for c in range(1, 8):
    ws_summary.cell(row=row_idx, column=c).alignment = Alignment(horizontal="center")
    ws_summary.cell(row=row_idx, column=c).fill = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid")
    ws_summary.cell(row=row_idx, column=c).border = thin_border

# Sprint Milestone Highlights Table
row_idx += 3
ws_summary.cell(row=row_idx, column=1, value="Sprint #").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=2, value="Timeline").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=3, value="Frontend Milestone").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=4, value="Backend Milestone").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=5, value="QA Milestone").fill = sub_header_fill
ws_summary.cell(row=row_idx, column=6, value="Sprint Release Goal").fill = sub_header_fill
ws_summary.merge_cells(start_row=row_idx, start_column=6, end_row=row_idx, end_column=7)

for c in range(1, 8):
    ws_summary.cell(row=row_idx, column=c).font = header_font
    ws_summary.cell(row=row_idx, column=c).alignment = Alignment(horizontal="center", vertical="center")
    ws_summary.cell(row=row_idx, column=c).border = thin_border

milestones = [
    ("Sprint 1", "Weeks 1–2", "UI Shell, Multi-Role Login, Academic & Question Bank Authoring UI", "DB Schemas, JWT Auth/RBAC, Academic APIs & Question Bank Storage", "Auth & Academic CRUD automated test suites", "Working Foundation + Question Repository"),
    ("Sprint 2", "Weeks 3–4", "7-Step Exam Creation Wizard (Pool + PDF Upload), Live Classroom UI", "Exam Engine & Scheduling APIs, PDF Upload S3 Service, WebSockets", "Exam wizard validation & Live class latency testing", "Functional Exam Creator & Live Class Gateway"),
    ("Sprint 3", "Weeks 5–6", "Pre-Exam System Check, Secure Lockdown Workspace, Proctoring Grid", "Session Init, Resilient Auto-Save Pipeline, Telemetry & Risk Scoring Bus", "Exam resilience, auto-save dropout stress test & anti-cheat", "Full Student Exam Experience & Live Proctoring"),
    ("Sprint 4", "Weeks 7–8", "Evaluation Dashboard, PDF Pen Grading Tool, 4-Tier Approval & Scorecards", "Auto-grading, Manual rubric APIs, 4-Tier Approval State Machine, Reports", "Full regression, Security audit, UAT Sign-Off", "Production Launch & Go-Live")
]

row_idx += 1
for s_name, time_str, fe_m, be_m, qa_m, goal_str in milestones:
    ws_summary.cell(row=row_idx, column=1, value=s_name).alignment = Alignment(horizontal="center", vertical="center")
    ws_summary.cell(row=row_idx, column=2, value=time_str).alignment = Alignment(horizontal="center", vertical="center")
    ws_summary.cell(row=row_idx, column=3, value=fe_m).alignment = Alignment(horizontal="left", vertical="center")
    ws_summary.cell(row=row_idx, column=4, value=be_m).alignment = Alignment(horizontal="left", vertical="center")
    ws_summary.cell(row=row_idx, column=5, value=qa_m).alignment = Alignment(horizontal="left", vertical="center")
    ws_summary.merge_cells(start_row=row_idx, start_column=6, end_row=row_idx, end_column=7)
    ws_summary.cell(row=row_idx, column=6, value=goal_str).alignment = Alignment(horizontal="left", vertical="center")
    for c in range(1, 8):
        ws_summary.cell(row=row_idx, column=c).border = thin_border
    ws_summary.row_dimensions[row_idx].height = 26
    row_idx += 1

for col in ws_summary.columns:
    max_len = max(len(str(cell.value or "")) for cell in col)
    col_letter = get_column_letter(col[0].column)
    ws_summary.column_dimensions[col_letter].width = max(max_len + 4, 15)

# SHEET 2: ALL SPRINT TASKS MASTER LIST
ws_all = wb.create_sheet(title="Sprint Tasks Breakdown")
ws_all.views.sheetView[0].showGridLines = True

headers = [
    ("Task ID", 12),
    ("Sprint", 16),
    ("Week", 12),
    ("Phase", 28),
    ("Track", 14),
    ("Module", 22),
    ("Task Name", 38),
    ("Description", 55),
    ("Assigned To", 22),
    ("Complexity", 14),
    ("Priority", 14),
    ("Mandays", 12),
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

for r_idx, task in enumerate(sprint_tasks, start=2):
    ws_all.cell(row=r_idx, column=1, value=task["task_id"]).alignment = Alignment(horizontal="center", vertical="center")
    ws_all.cell(row=r_idx, column=2, value=task["sprint"]).alignment = Alignment(horizontal="center", vertical="center")
    ws_all.cell(row=r_idx, column=3, value=task["week"]).alignment = Alignment(horizontal="center", vertical="center")
    ws_all.cell(row=r_idx, column=4, value=task["phase"]).alignment = Alignment(horizontal="left", vertical="center")
    
    track_cell = ws_all.cell(row=r_idx, column=5, value=task["track"])
    track_cell.alignment = Alignment(horizontal="center", vertical="center")
    if task["track"] == "Frontend":
        track_cell.fill = fe_fill
    elif task["track"] == "Backend":
        track_cell.fill = be_fill
    else:
        track_cell.fill = qa_fill

    ws_all.cell(row=r_idx, column=6, value=task["module"]).alignment = Alignment(horizontal="left", vertical="center")
    ws_all.cell(row=r_idx, column=7, value=task["task_name"]).alignment = Alignment(horizontal="left", vertical="center")
    
    desc_cell = ws_all.cell(row=r_idx, column=8, value=task["description"])
    desc_cell.alignment = Alignment(horizontal="left", vertical="center", wrap_text=True)
    
    ws_all.cell(row=r_idx, column=9, value=task["assigned_to"]).alignment = Alignment(horizontal="left", vertical="center")
    ws_all.cell(row=r_idx, column=10, value=task["complexity"]).alignment = Alignment(horizontal="center", vertical="center")
    
    prio_cell = ws_all.cell(row=r_idx, column=11, value=task["priority"])
    prio_cell.alignment = Alignment(horizontal="center", vertical="center")
    if "P0" in task["priority"]:
        prio_cell.font = p0_font
    else:
        prio_cell.font = p1_font

    ws_all.cell(row=r_idx, column=12, value=task["mandays"]).alignment = Alignment(horizontal="center", vertical="center")
    ws_all.cell(row=r_idx, column=13, value=task["deliverable"]).alignment = Alignment(horizontal="left", vertical="center")

    for c in range(1, 14):
        ws_all.cell(row=r_idx, column=c).border = thin_border
    ws_all.row_dimensions[r_idx].height = 24

# Save Workbook
wb.save(excel_file_path)
print(f"Generated 2-Month Sprint Excel: {excel_file_path}")
