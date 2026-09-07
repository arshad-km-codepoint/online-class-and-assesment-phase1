# Prototype 22 — Evaluation Dashboard

## Goal

Provide teachers with a centralized Evaluation Dashboard to view, filter, track, and manage student exam answer evaluation statuses and marks publication, complying directly with PRD Section 26.

## User

Teacher

## Requirements

Create an Evaluation Dashboard screen containing:

- Page title: **Evaluation Dashboard**
- Summary metric cards (Total Submissions, Not Started, In Progress, Completed, Published, Evaluation Progress %)
- Interactive Filter Bar with 4 mandatory prototype filters:
  1. **Exam**: Filter submissions by specific examination.
  2. **Class**: Filter by Class & Division (e.g. Grade 10 - Division A, Grade 10 - Division B, Grade 12 - Division A).
  3. **Status**: Filter by PRD Evaluation Status (`Not Started`, `In Progress`, `Completed`, `Published`).
  4. **Student**: Text search filter for candidate student name or roll number.

---

## Data Table Specifications

Each record in the Evaluation Table MUST display:

- **Exam**: Exam Name & Code (e.g., Grade 10 Mathematics Midterm 2026 - `QP-MATH-101`)
- **Student**: Candidate Name, Roll Number, and Avatar thumbnail
- **Class/division**: Class name and Section/Division designation (e.g., `Grade 10 - Division A`)
- **Submission date**: Submission date & timestamp (e.g., `10 Aug 2026, 10:45 AM`)
- **Evaluation status**: PRD-mandated badge (`Not Started` | `In Progress` | `Completed` | `Published`)
- **Obtained marks**: Awarded score formatted against maximum marks (e.g. `92 / 100`, or `—` when Not Started)
- **Maximum marks**: Total max marks for the examination

---

## Supported PRD Statuses

1. **Not Started** (Slate/Amber badge): Student has submitted paper, manual grading has not yet commenced.
2. **In Progress** (Blue badge): Teacher has evaluated partial subjective questions and saved progress.
3. **Completed** (Emerald badge): Teacher has finished evaluating all questions; total marks are calculated and verified.
4. **Published** (Purple badge): Results have been officially published to student and parent portals.

---

## Actions

- **Start Evaluation**: For `Not Started` records, opens evaluation view to begin grading.
- **Continue Evaluation**: For `In Progress` records, resumes grading where left off.
- **Review Marks**: For `Completed` records, opens final mark verification drawer/modal.
- **Publish Result**: For `Completed` records, changes status to `Published`.
- **View Published Result**: For `Published` records, opens student report card preview.
- **Bulk Publish**: Select multiple `Completed` records to publish all at once.
- **Export Summary**: Export filtered evaluation summary report.

---

## Acceptance Criteria

1. Renders clean, modern dashboard layout displaying all 7 required fields per submission row.
2. Supports all 4 PRD statuses (`Not Started`, `In Progress`, `Completed`, `Published`) with visual distinction.
3. Implements 4 working prototype filters (Exam, Class, Status, Student Search).
4. Provides working row actions to change evaluation status and publish results.
5. Reuses existing design system tokens and component styles.
