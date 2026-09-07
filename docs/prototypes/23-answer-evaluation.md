# Prototype 23 — Answer Evaluation

## Goal

Prototype the teacher answer evaluation experience for one candidate student attempt, providing question-by-question grading, auto-evaluated MCQ distinction, subjective answer scoring, attachment inspection, and teacher feedback, adhering directly to PRD Sections 25, 27, and 28.

## User

Teacher

## Requirements

Create an Answer Evaluation screen containing:

- **Candidate Header Banner**: Student Name, Roll Number, Class/Division, Avatar, Exam Title, Total Exam Score progress bar, and "Back to Evaluation Dashboard" button.
- **Question Navigator**: Left-side grid/list palette showing all exam questions, their status (`Auto-Scored`, `Graded`, `Pending`, `Current`), and quick-jump navigation.
- **Main Evaluation Panel**:
  - **Question Display**: Full question prompt text, section label, max marks badge, and evaluation mode indicator.
  - **Student Answer Display**:
    - **Auto-Evaluated MCQs**: Visually distinct system auto-scored card highlighting student's selected option vs. correct answer key with green/red feedback badges.
    - **Text Answers**: Formatted candidate answer card for short answer, long answer, and essay questions.
    - **Attachment-Based Answers (PRD Sec 28)**: File container card with filename, file size, "View Attachment" preview modal button, and "Download Attachment" link.
  - **Model Answer / Rubric Reference Drawer**: Toggleable panel to inspect ideal model solution and rubric criterion scoring breakdown.
  - **Teacher Evaluation Console**:
    - **Marks Awarded**: Numerical input field `[ 4 ] / Max Marks` with validation.
    - **Teacher Remarks**: Multi-line textarea `[ Good explanation. Minor points missing. ]`.
- **Navigation Controls**:
  - **Previous Question** button
  - **Next Question** button
  - **Save Draft & Continue Later** button
  - **Complete & Lock Evaluation** button

---

## Auto-Evaluated MCQs vs. Manual Evaluation Distinction

1. **Auto-Evaluated MCQs**:
   - Distinct system badging: `Auto-Scored by System (Key Matched)`
   - Displays all choices (A, B, C, D) highlighting student choice and correct option.
   - Default marks automatically calculated; option provided for manual override with teacher rationale.

2. **Manually Evaluated Answers**:
   - Marked with `Requires Teacher Grading` badge.
   - Interactive marks input field `[ 4 ] / 5`.
   - Remarks box for teacher feedback.

---

## Acceptance Criteria

1. Renders complete answer evaluation view for a student attempt.
2. Displays Question, Student Answer, Maximum Marks, Marks Awarded, and Teacher Remarks for each question.
3. Provides Next Question and Previous Question navigation + Question Navigator palette.
4. Clearly distinguishes system auto-scored MCQs from manually evaluated subjective questions.
5. Implements attachment viewing and downloading for file-based submissions (PRD Sec 28).
6. Allows saving marks and finalizing evaluation, returning to Prototype 22 (Evaluation Dashboard).
