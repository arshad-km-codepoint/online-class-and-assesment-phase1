# Prototype 25 — Result Calculation & Review

## Goal

Provide teachers with an automatic result calculation summary console, Pass/Fail threshold validator, individual evaluated answer sheet inspector, and publication trigger before official result release, fulfilling PRD Sections 29 and 30.

## User

Teacher

## Requirements

Create a Result Calculation & Review screen containing:

- **Candidate Header Banner**: Candidate Student Name, Roll Number, Class/Division, Avatar, Exam Title, Submission Timestamp, and "Publish Candidate Result" action button.
- **5 Core Summary Metric Cards (PRD Section 29 & Prompt)**:
  1. **Total Marks**: Maximum exam total marks (e.g. `100 Marks`).
  2. **Obtained Marks**: Sum of objective auto-scored + subjective awarded + attachment marks (e.g. `92 Marks`).
  3. **Percentage**: Computed percentage `(Obtained / Total) * 100` (e.g. `92%`).
  4. **Pass/Fail Status**: Automatic Pass/Fail determination badge (`PASS` in emerald vs `FAIL` in red) calculated against configured minimum pass mark threshold.
  5. **Grade (if configured)**: Assigned grade badge (`A+`, `A`, `B+`, `B`, `C`, `F`) based on configured grading rules.
- **Configured Pass Mark Threshold Bar**: Interactive pass mark threshold control (e.g. `40%`, cutoff `40 Marks`) allowing teachers to adjust pass criteria and see Pass/Fail dynamically recompute.
- **Inspect Individual Evaluated Answers Console (User Prompt Requirement)**:
  - Interactive accordion/list allowing teachers to inspect each question in the attempt before publication.
  - Displays Question No, Question Prompt Text, Candidate Submitted Response, Evaluation Mode (`Auto-Scored MCQ` vs `Manual Subjective` vs `Attachment Sheet`), Awarded Marks vs Max Marks, and Teacher Remarks.
- **Grading Rules Scale Breakdown**: Reference table of configured grade boundaries.
- **Primary Publication Actions (PRD Section 30)**:
  - `Publish Candidate Result` button
  - `Back to Evaluation Dashboard` button

---

## Automatic Result Calculation Formulas

1. **Obtained Marks** = $\sum (\text{Objective Marks}) + \sum (\text{Subjective Awarded Marks}) + \sum (\text{Attachment Marks})$
2. **Percentage (%)** = $\left( \frac{\text{Obtained Marks}}{\text{Total Marks}} \right) \times 100$
3. **Pass/Fail**:
   - `PASS` if $\text{Percentage} \ge \text{Configured Pass Mark \%}$
   - `FAIL` if $\text{Percentage} < \text{Configured Pass Mark \%}$
4. **Grade**: Derived from active `gradeRules` array matching percentage interval.

---

## Acceptance Criteria

1. Renders complete result summary card displaying Total marks, Obtained marks, Percentage, Pass/Fail, and Grade.
2. Automatically determines Pass/Fail based on configured pass mark threshold.
3. Provides interactive inspector allowing teachers to expand and review each individual evaluated answer before publication.
4. Allows adjusting pass mark threshold and dynamically re-calculating Pass/Fail status.
5. Provides working publication action returning to Prototype 22 (Evaluation Dashboard).
