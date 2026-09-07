# Prototype 06 — Question Type & Marks Distribution

## Goal

Configure the exam structure and question breakdown per question type before picking individual questions from the question bank.

This prototype allows teachers to specify how many questions of each type will be included and how many marks each question carries.

## User

Teacher

## Entry Point

This screen is opened when the teacher selects **Existing Question Pool** in Step 4 (Question Source Choice / Prototype 05) and clicks:

`Continue`

---

## Required Question Types

The configuration table MUST support all 5 question types explicitly required:

1. **MCQ** (Multiple Choice Question)
2. **One Word** (Short one-word / fill-in answer)
3. **Short Answer** (Brief descriptive answer)
4. **Long Answer** (Detailed analytical answer)
5. **Essay** (Extended essay / comprehensive problem)

---

## Interactive Table Structure

The table provides editable inputs for:

* **Question Type**: MCQ, One Word, Short Answer, Long Answer, Essay
* **Question Count**: Number of questions of this type (e.g. 10)
* **Marks Each**: Points awarded per question (e.g. 1, 2, 5, 15)
* **Total Marks (Calculated)**: `Question Count × Marks Each`

### Example Table Configuration:

| Question Type | Questions Count | Marks Each | Total Marks (Calculated) |
| :--- | :--- | :--- | :--- |
| MCQ | 10 | 1 | 10 |
| One Word | 5 | 1 | 5 |
| Short Answer | 5 | 2 | 10 |
| Long Answer | 2 | 5 | 10 |
| Essay | 1 | 15 | 15 |
| **SUM TOTAL** | **23 Questions** | — | **50 Marks** |

---

## Automatic Calculations & Validation Rules

### 1. Real-time Calculations:
* For each row: `Row Total = Count × Marks Each`
* Total Exam Questions = `Sum of all question counts`
* Calculated Question Marks Total = `Sum of all row total marks`

### 2. Mandatory Validation Rule (PRD Requirement):
**Calculated Question Marks Total MUST EQUAL Exam Total Marks (configured in Step 1)**.

* Example:
  * Exam Total Marks from Step 1 = `50`
  * If Calculated Total = `45` → Show Error: `Question marks total (45) does not equal configured Exam Total Marks (50). Please adjust question counts or marks per question.`
  * If Calculated Total = `50` → Show Success Badge: `Marks distribution perfectly matches Exam Total Marks (50/50).`

---

## Navigation & State Preservation

* **Back (`Step 4 — Question Source Choice`)**: Navigates back to Question Source Choice while retaining all entered values.
* **Save as Draft**: Saves current draft with marks distribution structure.
* **Continue (`Step 6 — Question Bank Selection / Prototype 07`)**: Validates that Calculated Total = Exam Total Marks, saves payload in context state, and advances to Prototype 07.

---

## UI Demo Controls / Presets

Include quick demo toolbar buttons:
1. `Preset: Balanced 50 Marks (Perfect Match)`
2. `Preset: 100 Marks Distribution`
3. `Preset: Trigger Mismatch Error (45/50 Marks)`
4. `Reset Table`

---

## Out of Scope

* PDF upload configuration (Belongs to Prototype 09)
* Individual question picking from question bank (Belongs to Prototype 07)

---

## Acceptance Criteria

1. Table supports all 5 required question types: MCQ, One Word, Short Answer, Long Answer, Essay.
2. User can edit question count and marks each for each question type.
3. Row total and overall question marks total are automatically calculated in real time.
4. System validates that Question Marks Total equals Exam Total Marks (from Step 1).
5. Attempting to continue with a marks mismatch displays a visible validation error.
6. Parameters from Steps 1, 2, 3, and 4 are preserved and displayed in step summary.
7. Step 5 marks distribution payload is saved into global context state.
