# Prototype 26 — Publish Results

## Goal

Provide teachers with a dedicated result publishing interaction screen and modal flow, enforcing clear state transitions (`Draft Result` → `Publish` → `Confirmation` → `Published`), partial evaluation publication blocking, student mark masking until publication, and post-publication notification feedback, fulfilling PRD Section 30.

## User

Teacher (Publisher) & Student / Parent (Consumer)

## Requirements

Create a Publish Results interaction environment containing:

- **State Stepper Banner**: Clear visual indicator showing current result lifecycle phase:
  1. `Draft Result`: Evaluated marks exist as drafts; unpublished to students.
  2. `Publish Action`: Dedicated trigger to initiate result publication.
  3. `Confirmation Modal`: Final verification step with notification channel controls.
  4. `Published`: Results locked, timestamps logged, and report cards released to student portal.

- **Draft Result Console**:
  - Displays Total Candidates, Passed Count, Failed Count, Average Marks, and Highest Marks.
  - Interactive Recharts Analytics: Score/Grade Band distribution and Pass/Fail donut chart.
  - Candidate Roster displaying candidate details, marks obtained, percentage, grade, and `Draft Result` / `Published` status badges.

- **Partial Evaluations Remaining / Publish Blocked Guard**:
  - When an exam has any unevaluated student submissions (`Not Started` or `In Progress`), clicking "Publish Results" triggers a **"Publish Blocked — Unevaluated Submissions"** state modal.
  - Displays exact pending count (e.g., "3 of 45 student answer sheets are still unevaluated").
  - Lists pending candidates with direct "Evaluate Now" quick links.
  - Provides options to either complete pending evaluations or "Publish Evaluated Candidates Only".

- **Final Confirmation Modal**:
  - Requires explicit user confirmation.
  - Displays automated notification channel toggles (App Push, Email, Parent SMS).
  - Outlines exact candidate count and warning that scores will become visible on student portals.

- **Successful Publication State**:
  - Displays green celebration banner with publication date & timestamp (e.g. `Published on 11 Aug 2026, 05:55 PM`).
  - Summarizes notification delivery stats.
  - Provides options to preview live student report cards, download Excel CSV roster, print result sheet, or recall/unpublish.

- **Student Mark Masking Rule**:
  - In `StudentResultsView.tsx`, if exam results are in `Draft` state (not yet `Published`), student sees a locked card banner: `Evaluation Completed • Results Awaiting Teacher Publication`.
  - Numerical marks, percentage, grade, and official report card buttons are HIDDEN/LOCKED until the teacher publishes the results.
  - Once published, student view automatically unlocks full score breakdown and report card view.

---

## State Machine & Transitions

$$\text{Draft Result} \xrightarrow{\text{Publish Action}} \text{Check Evaluation Status} \begin{cases} \xrightarrow{\text{Has Unevaluated}} \text{Publish Blocked Modal} \\ \xrightarrow{\text{All Evaluated}} \text{Confirmation Modal} \xrightarrow{\text{Confirm}} \text{Published State} \end{cases}$$

---

## Acceptance Criteria

1. Dedicated publication interaction view with clear state stepper (`Draft Result` → `Publish` → `Confirmation` → `Published`).
2. Correctly detects pending unevaluated submissions and blocks publication when partial evaluations remain.
3. Interactive confirmation modal requiring user verification and offering notification options.
4. Successful publication state displays timestamp, notification summary, and updated candidate status badges.
5. Strictly masks student marks, percentage, grade, and report card view in Student Portal until results are published.
6. Reuses existing design system tokens, colors, and typography.
