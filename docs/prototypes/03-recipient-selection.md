# Prototype 03 — Recipient Selection

## Goal

Prototype assigning an exam to students in the online examination creation flow.

This prototype enables teachers to specify who will receive and attend the examination using two independent recipient assignment modes: **Class-wise** and **Student-wise**.

## User

Teacher

## Entry Point

This screen is opened when the teacher completes **Step 1 (Exam Type + Basic Details)** and clicks:

`Continue`

from Prototype 02 — Exam Basic Details, or navigates to Step 2 in the creation workflow.

---

## Assignment Modes

The teacher can toggle between two independent recipient selection modes:

1. **Class-wise Selection**
2. **Student-wise Selection**

---

### 1. Class-wise Selection

Class-wise assignment automatically targets all eligible students enrolled within a specified academic structure hierarchy:

**Hierarchy Cascade:**

`Academic Year` → `Class` → `Division` → `All Eligible Students`

#### Fields & Dropdowns:
* **Academic Year**: e.g., `2025-2026`, `2026-2027`
* **Class**: e.g., `Grade 8`, `Grade 9`, `Grade 10`, `Grade 11`, `Grade 12`
* **Division**: e.g., `Division A`, `Division B`, `Division C`, `All Divisions`

#### Behavior:
* Selecting Academic Year, Class, and Division automatically computes the eligible student population.
* Displays an **Eligible Student Summary Card** showing total student count (e.g. `45 Eligible Students`).
* Provides a **Student Roster Preview** drawer/accordion allowing the teacher to inspect the list of targeted students.

---

### 2. Student-wise Selection

Student-wise assignment allows teachers to search and select individual students across classes and divisions.

#### Features:
* **Real-time Search Bar**: Filter by Student Name, Admission Number, Class, or Division.
* **Filter Controls**: Quick filter pills by Class or Division.
* **Multi-Select Controls**:
  * "Select All Matching"
  * "Deselect All"
  * Individual Student Checkbox Toggles

#### Search Results Requirements:
Each student item in the search results table/list MUST display:
1. **Student Name** (with avatar/initials)
2. **Admission Number** (e.g., `ADM-2026-001`)
3. **Class** (e.g., `Grade 10`)
4. **Division** (e.g., `Division A`)
5. **Selection State** (Checkbox / Selected Badge / Interactive Toggle)

---

## Selected-Recipient Summary

A dedicated live summary panel displays real-time target details:

* **Recipient Count Badge**: Shows total number of selected students (e.g., `45 Students Targeted`).
* **Target Summary Badge**:
  * *Class-wise mode*: `Class Target: 2025-2026 → Grade 10 → Division A (45 Students)`
  * *Student-wise mode*: `Individual Target: 6 Specific Students Selected`
* **Quick Actions**: "Clear Selection", "Preview Target Roster".

---

## Validation Rules

### No Recipients Selected Validation:
* Recipient selection is **mandatory**.
* If the teacher attempts to click `Continue` or `Save as Draft` without selecting any recipients (0 targeted students), show a prominent validation error:
  * Error Banner: `No recipients selected. Please select a class/division or choose individual students before continuing.`
  * Field Error: Highlight selection section in red with alert text.

---

## Navigation & State Preservation

* **Back (`Step 1 — Exam Basic Details`)**: Navigates back to basic details while retaining all entered values.
* **Save as Draft**: Saves the current exam draft with recipient configuration.
* **Continue (`Step 3 — Academic Mapping / Prototype 04`)**: Validates recipient selection, saves payload to global context state, and advances to Prototype 04.

---

## UI Demo Controls / Presets

Include quick demo preset toolbar buttons for testing:
1. `Preset: Class-wise (Grade 10 - Div A)`
2. `Preset: Student-wise (5 Selected Students)`
3. `Preset: Trigger No Recipients Error`
4. `Clear Selection`

---

## Out of Scope

* Subject & Chapter selection (Belongs to Step 3 — Academic Mapping / Prototype 04)
* Question Bank selection
* PDF Upload
* Evaluation & Marking

---

## Acceptance Criteria

1. Teacher can switch between Class-wise and Student-wise selection modes.
2. Class-wise selection supports Academic Year → Class → Division hierarchy and computes total eligible students.
3. Student-wise selection provides real-time search showing student name, admission number, class, division, and selection checkbox.
4. Selected-recipient summary dynamically updates student count and selection breakdown.
5. Attempting to continue with 0 recipients displays visible validation error.
6. Data entered on Step 1 is preserved and displayed in step header/summary.
7. Step 2 recipient selection data is preserved when navigating back/forward.
