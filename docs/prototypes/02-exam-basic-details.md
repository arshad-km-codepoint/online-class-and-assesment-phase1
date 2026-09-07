# Prototype 02 — Exam Type + Basic Details

## Goal

Create the first step of the teacher exam-creation flow.

This prototype should allow a teacher to choose the exam type and enter the basic exam information.

## User

Teacher

## Entry Point

This screen is opened when the teacher clicks:

`Create Online Exam`

from Prototype 01 — Teacher Exam List.

## Exam Type

The teacher must choose one of:

* Spot Test
* Scheduled Test

### Spot Test

A Spot Test is intended for an exam that can be attended immediately or within a short period.

Provide an option such as:

* Make exam available immediately after publishing

### Scheduled Test

When Scheduled Test is selected, show:

* Start Date
* Start Time
* End Date
* End Time

The schedule fields should not be required for Spot Test unless needed by the existing project rules.

## Basic Exam Details

Provide fields for:

* Exam Name
* Exam Code
* Exam Duration
* Total Marks
* Minimum Pass Mark
* Instructions

## Exam Code

The Exam Code should support the existing project approach.

If no existing convention exists, prototype:

* Automatically generated exam code
* Optional manual editing

Example:

`MAT-G8-2026-001`

The code must be unique.

For the prototype, uniqueness may be validated against mock data.

## Exam Duration

Duration should be entered in minutes.

Examples:

* 30 minutes
* 60 minutes
* 90 minutes

Duration must be greater than zero.

## Marks

Provide:

* Total Marks
* Minimum Pass Mark

Validation:

* Total Marks must be greater than zero.
* Minimum Pass Mark cannot exceed Total Marks.

Example:

Total Marks: `50`

Minimum Pass Mark: `20`

## Instructions

Provide a multiline text area for teacher instructions.

Example placeholder:

`Answer all questions. Do not refresh the page during the examination.`

## Actions

Provide:

* Cancel
* Save as Draft
* Continue

### Cancel

Return to the Online Examination listing.

### Save as Draft

Save the current prototype state as a draft exam using mock/local state if backend functionality does not exist.

### Continue

Validate the current form and navigate to:

`Prototype 03 — Recipient Selection`

If Prototype 03 is not implemented yet, navigate to a placeholder route/page.

## Validation States to Prototype

Include visible validation for:

### Required fields

* Exam Name
* Exam Type
* Exam Duration
* Total Marks
* Minimum Pass Mark

### Invalid duration

Example:

`Exam duration must be greater than 0.`

### Invalid pass mark

Example:

`Minimum pass mark cannot exceed total marks.`

### Duplicate Exam Code

Example:

`This exam code is already in use.`

### Scheduled exam validation

Prototype sensible validation for:

* Missing start date/time
* Missing end date/time
* End time before start time

Do not build advanced scheduling rules yet.

## UI States

Prototype at least:

1. Empty form
2. Spot Test selected
3. Scheduled Test selected
4. Validation errors
5. Successfully completed form

## Data / State

Use mock or local state unless an existing examination backend already exists.

Keep the form state structured so it can later be connected to the real exam entity/API.

Suggested conceptual shape:

```ts
{
  examName,
  examCode,
  examType,
  startDate,
  startTime,
  endDate,
  endTime,
  duration,
  totalMarks,
  passMarks,
  instructions
}
```

Adapt this to the existing project conventions instead of introducing a new architecture unnecessarily.

## Navigation

Expected prototype flow:

`Teacher Exam List`

→

`Exam Type + Basic Details`

→

`Recipient Selection`

Preserve entered data when moving between prototype steps.

## Out of Scope

Do NOT implement:

* Recipient selection
* Class/division selection
* Subject selection
* Chapter selection
* Question source
* Question bank
* Marks distribution by question type
* PDF upload
* Student exam interface
* Evaluation
* Result publication
* Reports

Those belong to later prototype tasks.

## Acceptance Criteria

The prototype is complete when:

* Teacher can choose Spot Test or Scheduled Test.
* Relevant scheduling fields appear based on exam type.
* Teacher can enter basic exam details.
* Total marks and pass marks are validated.
* Exam duration is validated.
* Exam Code can be represented and checked against mock data.
* Teacher can save the current state as a draft.
* Teacher can continue toward Recipient Selection.
* Data entered on this step is preserved for the next step.
* Existing project UI components and styling are reused.
* No unrelated examination features are implemented.
* Relevant lint/typecheck/tests pass.

## Context

This is one part of the larger Online Examination flow.

Do not treat this page as a standalone product.

The complete creation flow will eventually be:

Exam Type + Basic Details

→ Recipient Selection

→ Academic Mapping

→ Question Source

→ Question / Marks Configuration

→ Review

→ Publish

Refer to:

* `docs/online-exam-prd.md`
* `docs/prototype-context.md`

for the full product context.
