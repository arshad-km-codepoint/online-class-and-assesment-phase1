# Prototype 08 — Random Question Selection

## Goal

Prototype random question selection as an optional alternative mode to manual question picking.

This allows teachers to automatically sample a random subset of questions (e.g., select 10 questions randomly from 50 available MCQs) matching subject, chapter, and question type criteria.

## User

Teacher

## Entry Point

This mode is available on **Step 6 (Question Selection / Prototype 07/08)** via a top mode toggle:

`[ Mode: Manual Selection ]` | `[ Mode: Random Selection (Optional) ]`

---

## Key Features & Modes

### 1. Two Selection Modes:
* **Manual Selection Mode**: Browse item bank and manually check off individual questions (from Prototype 07).
* **Random Selection Mode**: Configure random sampling rules per question type.

---

## Required Controls for Random Selection

The Random Selection mode MUST provide explicit controls for:

1. **Selection Mode Switch**: Toggle between `Manual Selection` and `Random Selection`.
2. **Number Required**: Input specifying target count per question type (e.g. `10 required`).
3. **Available Question Count**: Live count of matching questions available in item bank (e.g. `50 available`).
4. **Regenerate Selection Button**: Re-runs the random sampling algorithm to pick a fresh random seed and new question set.
5. **View Generated Set Button / Drawer**: Opens a preview modal/drawer displaying the list of randomly selected questions.
6. **Lock Selection Toggle / Button**: Freezes the generated question set to prevent accidental re-generation or changes upon wizard re-navigation.

---

## Random Sampling Rules & Validation

* **Available Pool Check**: Ensures `Available Question Count >= Number Required`.
  * If `Available < Required` (e.g., 8 available, 10 required) → Show Warning: `Insufficient questions in pool (8 available, 10 required). Please lower required count or add more questions to bank.`
* **Lock State Enforcement**: When `Selection Locked` is active:
  * Regenerate button is disabled.
  * Status badge shows `🔒 Locked — Question set frozen`.

---

## Navigation & State Preservation

* **Back (`Step 5 — Marks Distribution`)**: Returns to Step 5 while preserving random selection state and locked set.
* **Save as Draft**: Saves draft exam with generated question set seed.
* **Continue (`Step 7 — Exam Controls & Review / Prototype 08 final`)**: Validates locked/generated question set and advances to Step 7.

---

## Acceptance Criteria

1. User can switch between `Manual Selection` and `Random Selection` modes.
2. Random mode displays `Number Required` and `Available Question Count` for each question type.
3. User can click `Regenerate Selection` to produce a fresh random sample.
4. User can click `View Generated Set` to inspect all randomly selected items in a preview drawer.
5. User can click `Lock Selection` to freeze the generated question set.
6. System warns if available pool size is less than number required.
7. Selected question set state is preserved in global context state.
