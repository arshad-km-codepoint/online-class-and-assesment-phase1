# Prototype 11 — Exam Review & Publish

## Goal

Provide teachers with a final, comprehensive checkpoint to review all examination parameters before publishing.

This screen aggregates data from all prior wizard steps into 10 structured summary sections, allows one-click section editing, validates completeness, and publishes the exam to the live platform.

## User

Teacher

## Entry Point

This screen is opened when the teacher completes **Step 6 / Step 7 (Answer Submission / Question Controls)** and clicks:

`Continue to Step 7: Final Review & Publish`

---

## Required Summary Sections (10 Checkpoints)

The review screen MUST display clear, structured summary cards for:

1. **Exam Details**: Exam Name, Code, Exam Type (`Spot Exam` vs `Scheduled Exam`), Immediate Availability state.
2. **Schedule**: Start Date & Time, End Date & Time, Exam Duration (Minutes).
3. **Recipients**: Target Class, Division, Selection Mode (`Class-wise` vs `Student-wise`), Total recipient student count.
4. **Subject & Chapters**: Mapped Subject name, list of selected chapters (Chapter numbers & titles).
5. **Marks**: Total Exam Marks, Pass Marks threshold.
6. **Question Source**: Question Source method (`Existing Question Pool` vs `Upload Question Paper PDF`).
7. **Question Distribution**: Table breakdown of Question Count and Marks Each per question type (MCQ, One Word, Short Answer, Long Answer, Essay).
8. **Questions / PDF Content**: List of selected question titles or preview card for uploaded PDF document (`FileName.pdf`, size, page count).
9. **Answer Method**: Student response modes (`Text Answer`, `Attachment Answer`), allowed file formats (`PDF`, `JPG`, `PNG`, `DOC`), Max attachment size (MB).
10. **Instructions**: Candidate guidelines and exam rules text.

---

## Primary Actions

Each section card and footer provides actionable controls:

* **Edit Section Buttons**: Direct link on each summary card (e.g. `Edit Basic Details`, `Edit Recipients`) jumping directly back to the respective wizard step.
* **Save Draft**: Saves the exam with `Draft` status in context state and redirects to Teacher Exam List.
* **Publish Exam**: Validates all sections, updates exam status to `Scheduled` or `Live`, adds record to global `scheduledExams` array, triggers toast notification, and redirects to Prototype 01 (Teacher Exam List).

---

## Publication Blocking Validation Rules

Publication is strictly BLOCKED with a prominent error banner if any of the following validations fail:

1. **Missing Exam Name or Code**
2. **Zero Recipients Selected**
3. **Zero Chapters Mapped**
4. **Calculated Question Marks Total ≠ Target Exam Marks**
5. **Incomplete Question Quotas** (fewer questions picked than required)
6. **Missing PDF Document** (if PDF branch selected)
7. **Zero Allowed Attachment Formats** (if attachment mode enabled)

---

## Navigation & State Preservation

* **Back**: Navigates back to the preceding step.
* **Publish Confirmation Modal**: Displays final confirmation prompt (`Confirm Exam Publication`).

---

## Acceptance Criteria

1. Renders 10 structured review sections with full details.
2. Each section contains an active `Edit` button navigating back to that step.
3. System validates completeness and blocks publication if any section is invalid.
4. Clicking `Publish Exam` updates exam state and adds published exam to Teacher Exam List (Prototype 01).
5. Displays floating toast notification upon successful publication.
