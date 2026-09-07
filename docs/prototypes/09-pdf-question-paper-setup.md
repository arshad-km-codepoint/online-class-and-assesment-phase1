# Prototype 09 — PDF Question Paper Setup

## Goal

Prototype the PDF question paper creation flow when Option 2 ("Upload Question Paper PDF") is selected in Step 4 (Question Source Choice / Prototype 05).

This pathway is completely separate from the question pool prototypes and allows teachers to upload a complete PDF document that serves as the official, non-editable student question paper.

## User

Teacher

## Entry Point

This screen is opened when the teacher selects **Upload Question Paper PDF** in Step 4 (Question Source Choice / Prototype 05) and clicks:

`Continue`

---

## Required Elements & Inputs

The PDF Setup screen MUST include:

1. **PDF Drag-and-Drop Uploader Zone**: Interactive file upload dropzone supporting `.pdf` files up to 15 MB.
2. **Uploaded Document Preview Card & Modal**:
   * Displays PDF filename, file size, page count, upload timestamp.
   * Action button: `Preview PDF Document` (Opens modal viewer).
3. **Exam Parameters Configuration**:
   * **Total Marks**: Points allocated to the PDF exam.
   * **Question Count**: Total number of questions contained inside the PDF paper.
   * **Duration (Minutes)**: Allotted exam time.
   * **Answer Submission Type**:
     - `Digital OMR Grid` (Multiple Choice Bubbles)
     - `Online Text / Subjective Answers`
     - `Upload Hand-written Answer Sheet Images`
     - `Hybrid (OMR + Subjective Answers)`
4. **Official Non-Editable Paper Note**: Explicit notice confirming that the uploaded PDF will be presented to students in a read-only viewer.

---

## Error States & Actions (Required)

1. **Invalid Format Error**:
   * Triggered when a non-PDF file (e.g. `.docx`, `.png`) is uploaded.
   * Displays red error banner: `Invalid file format. Only PDF files (.pdf) are supported.`
2. **File Too Large Error**:
   * Triggered when file exceeds 15 MB (e.g. 18.5 MB).
   * Displays red error banner: `File size exceeds 15 MB limit (Uploaded: 18.5 MB). Please compress your PDF.`
3. **Replace PDF Action**:
   * Action button on uploaded card: `Replace PDF`.
   * Re-opens file selector and resets validation state.

---

## Navigation & State Preservation

* **Back (`Step 4 — Question Source Choice`)**: Returns to Step 4 while retaining PDF upload state.
* **Save as Draft**: Saves draft exam with attached PDF metadata.
* **Continue (`Step 6 — PDF Section Breakdown & Answer Key / Prototype 10`)**: Validates uploaded PDF and exam parameters, saves payload into context state, and advances to Prototype 10.

---

## UI Demo Controls / Presets

Include quick demo toolbar buttons:
1. `Preset: Valid Physics Exam PDF (100% Valid)`
2. `Simulate: Invalid Format Error (.docx)`
3. `Simulate: File Too Large Error (18.5 MB)`
4. `Reset Upload Zone`

---

## Acceptance Criteria

1. Interactive PDF dropzone accepts file drops or click-to-upload.
2. Renders document preview card with file name, size, page count, and PDF preview modal.
3. Provides inputs for Total Marks, Question Count, Duration, and Answer Submission Type.
4. Triggers visible validation error for invalid file formats (non-.pdf).
5. Triggers visible validation error for files exceeding 15 MB.
6. Provides `Replace PDF` action button to re-upload.
7. Step 1–4 parameters are preserved and displayed in step summary header.
8. PDF setup payload is stored in global context state.
