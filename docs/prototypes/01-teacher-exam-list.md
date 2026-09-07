# Prototype 01 — Teacher Exam List

## Goal

Create the teacher-facing Online Examination landing screen.

This prototype is only for viewing and entering exam management.

## User

Teacher

## Requirements

Create an Online Exams page containing:

- Page title: Online Examination
- Primary action: Create Online Exam
- Search exams
- Filter by status
- Exam list/table/cards

Each exam should show:

- Exam Name
- Exam Code
- Subject
- Class / Division
- Exam Type
- Date / Schedule
- Total Marks
- Status

Supported prototype statuses:

- Draft
- Published
- Available
- In Progress
- Submitted
- Under Evaluation
- Result Published

## Actions

Depending on status, provide appropriate actions such as:

- View
- Edit
- Continue Setup
- Evaluation
- Results

## Prototype data

Use mock exam records.

Include examples for:

- Draft exam
- Scheduled future exam
- Currently available exam
- Completed/submitted exam
- Result-published exam

## Interaction

Clicking "Create Online Exam" should navigate to the route reserved for Prototype 02.

For now, the destination can be a placeholder if Prototype 02 has not been implemented.

## Out of scope

Do NOT implement:

- Exam creation form
- Question selection
- Student exam interface
- Evaluation
- Reports
- Backend APIs

## Acceptance criteria

- Teacher can clearly understand existing exams.
- Status of each exam is obvious.
- Teacher can start creating a new exam.
- Existing project design system is reused.
- Layout works on desktop and reasonable tablet/mobile sizes.
- Mock data is isolated so it can later be replaced by API data.