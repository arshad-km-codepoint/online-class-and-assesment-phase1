# Prototype 10 — Answer Submission Configuration

## Goal

Configure student response and answer submission rules during exam setup.

This prototype allows teachers to decide how students can submit their answers—via direct text input, file attachments (scanned handwritten sheets/diagrams), or a combination of both—and configure security and file upload rules.

## User

Teacher

## Entry Point

This screen is opened when the teacher completes **Step 5 (PDF Setup / Prototype 09)** or **Step 6 (Question Selection / Prototype 07/08)** and advances to Answer Submission Configuration.

---

## Required Response Modes

The configuration interface MUST support:

1. **Text Answer Mode**:
   * Applies primarily to `One Word`, `Short Answer`, `Long Answer`, and `Essay`.
   * Options for:
     - Plain Text Input
     - Rich Text Editor (formatted text, lists, equations)
     - Character / Word count limits (optional max words)

2. **Attachment Answer Mode**:
   * Supports student file uploads for handwritten answer sheets, diagrams, calculations, and supporting work.
   * **Allowed Formats Checkboxes** (Explicitly required):
     - `PDF (.pdf)`
     - `JPG / JPEG (.jpg, .jpeg)`
     - `PNG (.png)`
     - `Documents / Supporting Work (.doc, .docx, .txt)`
   * **Maximum Attachment Size**: Configurable limit per file (e.g. `5 MB`, `10 MB`, `15 MB`, `25 MB`).
   * **Max Attachments Count**: Maximum number of files a student can upload (e.g., `1`, `3`, `5` files).

---

## Interactive Per-Question-Type & Per-Section Rules

Allows teachers to customize response mode per question type or section:

| Question Type / Section | Text Answer Enabled | Attachment Answer Enabled | Primary Mode |
| :--- | :--- | :--- | :--- |
| **MCQ** | Auto-Graded Bubbles | Disabled | Digital OMR / Options |
| **One Word** | Enabled (Plain Text) | Disabled | Direct Text |
| **Short Answer** | Enabled (Text Input) | Optional | Text + Optional Image |
| **Long Answer** | Enabled (Rich Text) | Enabled | Hybrid / Attachment |
| **Essay** | Enabled (Rich Text) | Enabled | Hybrid / Attachment |

---

## Validation & Rules

* **At least one response mode MUST be enabled** for subjective/descriptive questions.
* If Attachment Answer is enabled, **at least one file format MUST be selected**.
* Maximum attachment size MUST be specified (1 MB to 25 MB).

---

## Navigation & State Preservation

* **Back**: Returns to prior step while retaining submission rules.
* **Save as Draft**: Saves draft exam with submission configuration.
* **Continue**: Validates submission rules and advances to Step 7 (Exam Controls & Final Review).

---

## UI Demo Controls / Presets

Include quick demo toolbar buttons:
1. `Preset: Standard Digital + Image Uploads (Recommended)`
2. `Preset: Strict PDF Only Uploads (Max 10 MB)`
3. `Preset: Text Only (No Attachments)`
4. `Reset Configuration`

---

## Out of Scope

* Student answering interface (Belongs to Student Portal prototypes)

---

## Acceptance Criteria

1. Interface configures Text Answer and Attachment Answer modes.
2. Attachment configuration includes checkboxes for PDF, JPG/JPEG, PNG, DOC/DOCX.
3. Configures Maximum Attachment Size limit (MB) and Max Attachment count.
4. Provides per-question-type response mode customization matrix.
5. System validates that at least one allowed file format is selected when attachments are enabled.
6. Parameters from prior steps are preserved.
7. Submission configuration payload is stored in global context state.
