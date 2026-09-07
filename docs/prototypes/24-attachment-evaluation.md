# Prototype 24 — Attachment Evaluation

## Goal

Provide teachers with a dedicated, split-screen Attachment Evaluation workspace to visually review, annotate, grade, and download file-based candidate answer submissions, fulfilling PRD Section 28 requirements.

## User

Teacher

## Requirements

Create an Attachment Evaluation screen containing:

- **Attachment Canvas & Viewport (Left/Center Panel)**:
  - **Visual Attachment Editing / Evaluation Toolbar**:
    - **Annotation Tools**: Red Checkmark stamp (`✓`), Red Cross stamp (`✗`), Highlight Box, Floating Teacher Comment Note (`💬`).
    - **Viewport Controls**: Zoom In (`+`), Zoom Out (`-`), Rotate 90°, Page Navigator (e.g. Page 1 of 3).
  - **Interactive Document Canvas**: Renders student document (PDF / Image) with interactive annotation overlay where teachers can click to place checkmarks, crosses, or comments.
  - **Download Enforcer**: Displays explicit download permission status badge (`Download Permitted` vs `Download Restricted`) with working file download link when permitted.

- **Question Context & Grading Console (Right Panel)**:
  - **Candidate Student Info**: Student Name, Roll Number, Class/Division, Avatar, and Submission Date.
  - **Question Context**: Full Question Text prompt, Section Label, and Maximum Marks.
  - **Marks Awarded Input**: Numerical field `[ 32 ] / 35` with real-time score validation.
  - **Teacher Remarks**: Textarea field for feedback comments.
  - **Grading Rubrics Breakdown**: List of rubric criteria with max scores and awarded points.

- **Answer Navigation Controls (Footer)**:
  - **Previous Answer** button (cycles to preceding candidate file submission)
  - **Next Answer** button (cycles to next candidate file submission)
  - **Save Evaluation** button
  - **Back to Evaluation Dashboard** button

---

## Question & Candidate Attempt Association

Every attachment record strictly maintains metadata binding it to:
1. `questionId` (e.g., `q-eval-6`)
2. `questionText` (e.g., "State and prove Thales Theorem...")
3. `examId` & `examName` (e.g. "Grade 10 Mathematics Midterm 2026")
4. `studentId` & `studentName` (e.g., "Diya Sen", Roll: 1004)

---

## Acceptance Criteria

1. Renders split-screen visual canvas alongside question context and evaluation console.
2. Supports interactive visual annotation stamps (checkmarks, crosses, comment pins) directly on the document preview.
3. Respects download permissions configuration (`Download Permitted` vs `Download Restricted`).
4. Maintains explicit association between attachment, specific question ID, and candidate attempt.
5. Provides Next Answer and Previous Answer navigation controls across file submissions.
