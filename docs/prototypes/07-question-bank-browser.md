# Prototype 07 — Question Bank Browser

## Goal

Prototype selecting specific questions from the existing item bank pool to fulfill the configured question structure from Prototype 06.

This step allows teachers to filter the question database by Subject, Chapter, Class, and Question Type, and select questions up to the required target count for each type.

## User

Teacher

## Entry Point

This screen is opened when the teacher completes **Step 5 (Question Type & Marks Distribution / Prototype 06)** and clicks:

`Continue`

from Prototype 06.

---

## Required Context & Filters

The browser view MUST support filtering and context scoping by:

* **Subject**: e.g., `Mathematics`, `Physics`, `Chemistry` (Inherited from Step 3 Academic Mapping)
* **Chapter**: Filter by specific mapped chapters or `All Mapped Chapters`
* **Class**: Target class (e.g., `Grade 10`)
* **Question Type**: Quick filter tabs (`All Types`, `MCQ`, `One Word`, `Short Answer`, `Long Answer`, `Essay`)
* **Search Query**: Real-time keyword filter on question text and topic titles.

---

## Question Cards / Table Requirements

Each question card/row in the browser list MUST explicitly display:

1. **Question Text** (With options preview for MCQ)
2. **Question Type** (MCQ, One Word, Short Answer, Long Answer, Essay)
3. **Chapter** (e.g., `Ch 1: Quadratic Equations`)
4. **Difficulty** (`Easy`, `Medium`, `Hard`)
5. **Marks** (Points assigned to question, e.g., `1 Mark`, `5 Marks`, `15 Marks`)
6. **Selection State** (Interactive Checkbox & Selected / Unselected indicator badge)

---

## Selection Progress & Quota Tracker

A prominent live selection progress panel tracks selection quotas configured in Prototype 06:

### Example Quota Counters:

* **MCQ**: `7 / 10 Selected` (Target: 10)
* **One Word**: `5 / 5 Selected` (Target: 5 — Complete)
* **Short Answer**: `5 / 5 Selected` (Target: 5 — Complete)
* **Long Answer**: `2 / 2 Selected` (Target: 2 — Complete)
* **Essay**: `1 / 1 Selected` (Target: 1 — Complete)

---

## Validation & Blocking Rules

### PRD Required Rule:
**The system MUST prevent proceeding when fewer than the required number of questions are selected for any type.**

* Example:
  * If MCQ target is `10` and only `7` are selected:
  * Show Error Banner: `Incomplete question selection: MCQ requires 10 questions (7/10 selected). Please select 3 more MCQ questions before continuing.`
  * Block `Continue to Step 7`.

---

## Navigation & State Preservation

* **Back (`Step 5 — Marks Distribution`)**: Returns to Marks Distribution while preserving picked questions.
* **Save as Draft**: Saves draft exam with picked question list.
* **Continue (`Step 7 — Exam Controls & Review / Prototype 08`)**: Validates that all quotas are 100% satisfied, saves selected questions into context state, and advances to Prototype 08.

---

## UI Demo Controls / Presets

Include quick demo toolbar buttons:
1. `Preset: Auto-Select All Required Questions (100% Complete)`
2. `Preset: Partial Selection (Incomplete - Trigger Error)`
3. `Deselect All Questions`

---

## Out of Scope

* Randomisation rules (Belongs to later prototypes)
* Creating brand new questions from scratch

---

## Acceptance Criteria

1. Question bank browser filters by Subject, Chapter, Class, and Question Type.
2. Question cards/rows explicitly display Question Text, Type, Chapter, Difficulty, Marks, and Selection state.
3. Live quota counter shows selection progress (e.g. `MCQ — Select 10 questions | 7 / 10 selected`).
4. System blocks proceeding when fewer than required questions are selected for any type.
5. Step 1–5 data is preserved and displayed in step summary header.
6. Selected questions payload is stored in global context state.
