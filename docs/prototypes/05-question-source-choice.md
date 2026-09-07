# Prototype 05 — Question Source Choice

## Goal

Prototype the decision point where a teacher selects how questions are added to an examination.

This screen is a critical branch point in the exam creation flow.

## User

Teacher

## Entry Point

This screen is opened when the teacher completes **Step 3 (Subject & Chapter Mapping / Prototype 04)** and clicks:

`Continue`

from Prototype 04 — Academic Mapping.

---

## Question Source Options

The teacher must select one of two question paper generation methods explicitly defined by the PRD:

### 1. Existing Question Pool (Option 1)
* Select questions from the system question bank based on Subject, Chapter, Class, and Question Types.
* **Branches to**: `Prototype 06 — Question Bank Selection`

### 2. Upload Question Paper PDF (Option 2)
* Upload a complete question paper PDF document and configure section breakdown, marks allocation, and answer keys.
* **Branches to**: `Prototype 09 — Upload Question Paper PDF`

---

## UI Components & Cards

Provide prominent visual choice cards for each branch:

1. **Existing Question Pool Card**:
   * Icon: Database / Layers / BookOpen
   * Title: Existing Question Pool
   * Subtitle: Select from Item Bank & Question Database
   * Features: Filter by subject/chapter, auto-calculate marks, objective & subjective items.
   * Selection indicator / Radio button.

2. **Upload Question Paper PDF Card**:
   * Icon: FileUp / FileText / Upload
   * Title: Upload Question Paper PDF
   * Subtitle: Attach Scanned / Printed Exam Paper PDF
   * Features: Upload PDF file, define question sections, configure marks distribution and model answers.
   * Selection indicator / Radio button.

---

## Validation & Rules

* Question Source selection is **mandatory**.
* Clicking `Continue` without choosing a source displays a validation error: `Please select a question source method before continuing.`

---

## Navigation & Branching

* **Back (`Step 3 — Academic Mapping`)**: Returns to Academic Mapping while preserving all previously entered data (Steps 1, 2, 3).
* **Save as Draft**: Saves current exam draft with chosen question source.
* **Continue (Branching Execution)**:
  * If **Existing Question Pool** is selected → Navigate to `Step 5 (Pool Branch / Prototype 06)`
  * If **Upload Question Paper PDF** is selected → Navigate to `Step 5 (PDF Branch / Prototype 09)`

---

## UI Demo Controls / Presets

Include quick demo toolbar buttons:
1. `Select: Existing Question Pool`
2. `Select: Upload Question Paper PDF`
3. `Simulate Validation Error`

---

## Out of Scope

* Detailed question filtering & bank browsing (Belongs to Prototype 06)
* PDF upload dropzone & PDF renderer (Belongs to Prototype 09)

---

## Acceptance Criteria

1. Teacher can choose between Existing Question Pool and Upload Question Paper PDF.
2. Selection state is preserved and saved in global context.
3. Attempting to continue with no selection triggers a validation error.
4. Continuing with Existing Question Pool branches to Prototype 06 placeholder/view.
5. Continuing with Upload Question Paper PDF branches to Prototype 09 placeholder/view.
6. Step 1, 2, and 3 data is preserved and displayed in step summary.
