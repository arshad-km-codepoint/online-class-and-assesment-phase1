# Prototype 04 — Subject & Chapter Mapping

## Goal

Prototype academic mapping for an exam separately from recipient selection.

This step links the examination to the academic subject structure and specific chapters covered by the exam.

## User

Teacher

## Entry Point

This screen is opened when the teacher completes **Step 2 (Recipient Selection / Prototype 03)** and clicks:

`Continue`

from Prototype 03 — Recipient Selection, or navigates to Step 3 in the creation workflow.

---

## Required Academic Fields

The teacher configures academic context fields:

* **Academic Year**: e.g., `2025-2026`, `2026-2027` (Inherited from Step 2 or customizable)
* **Class**: e.g., `Grade 10`, `Grade 12` (Inherited from Step 2 or customizable)
* **Division**: e.g., `Division A`, `All Divisions` (Inherited from Step 2 or customizable)
* **Subject**: Subject dropdown selector (e.g., `Mathematics`, `Physics`, `Chemistry`, `English`, `Computer Science`)
* **Chapter Selector**: Dynamic, subject-driven chapter list with multi-selection modes.

---

## Chapter Selector Requirements

When a Subject is selected, the chapter list dynamically updates with chapters belonging to that subject.

The Chapter Selector MUST support:

1. **Single Selection**: Select any single chapter.
2. **Multiple Selection**: Select multiple specific chapters using checkboxes.
3. **Select All**: Quick "Select All Chapters" toggle / button.

### Subject-Driven Example Mock Data:

* **Mathematics**:
  * Ch 1: Quadratic Equations & Polynomials
  * Ch 2: Arithmetic Progressions
  * Ch 3: Coordinate Geometry & Lines
  * Ch 4: Trigonometry & Applications
  * Ch 5: Statistics & Probability
* **Physics**:
  * Ch 1: Electricity & Magnetism
  * Ch 2: Light Reflection & Wave Optics
  * Ch 3: Quantum Physics & Atomic Structure
  * Ch 4: Thermodynamics & Kinetics
* **Chemistry**:
  * Ch 1: Chemical Reactions & Equations
  * Ch 2: Periodic Classification of Elements
  * Ch 3: Carbon Compounds & Bonding
  * Ch 4: Acids, Bases & Salts
* **English**:
  * Ch 1: Prose — The Lost Child & A Letter to God
  * Ch 2: Poetry — The Road Not Taken & Dust of Snow
  * Ch 3: Grammar — Tenses, Direct/Indirect & Clauses
* **Computer Science**:
  * Ch 1: Python Data Structures & Lists
  * Ch 2: Object-Oriented Programming (OOP)
  * Ch 3: SQL & Relational Database Queries

---

## Selected Chapters Summary

Displays an interactive summary card of selected academic scope:
* Selected Subject badge.
* Selected Chapters list with badges/pills.
* Count indicator (e.g., `3 of 5 Chapters Selected`).

---

## Validation Rules

* **Subject Validation**: Subject selection is mandatory.
* **Chapter Validation**: At least one chapter must be selected.
* Attempting to continue with no subject or 0 chapters selected displays a high-contrast validation banner and field error message.

---

## Navigation & State Preservation

* **Back (`Step 2 — Recipient Selection`)**: Returns to Step 2 while preserving recipient and basic details state.
* **Save as Draft**: Saves full exam draft payload to context state.
* **Continue (`Step 4 — Question Source / Prototype 05`)**: Validates selections, stores payload in context, and advances to Prototype 05 placeholder view.

---

## UI Demo Controls / Presets

Include quick demo preset buttons for testing:
1. `Preset: Math (Single Chapter)`
2. `Preset: Physics (Multiple Chapters)`
3. `Preset: Chemistry (Select All Chapters)`
4. `Preset: Trigger Validation Errors`
5. `Clear Mapping`

---

## Out of Scope

* Question Source selection (Belongs to Step 4 — Prototype 05)
* Question Bank search
* PDF upload
* Evaluation & Marking

---

## Acceptance Criteria

1. Academic Year, Class, Division, Subject, and Chapter selector are displayed cleanly.
2. Changing Subject dynamically updates available chapters.
3. Chapter selector supports single selection, multiple selection, and "Select All".
4. Selected chapters summary updates in real time.
5. Missing subject or 0 chapters triggers visible validation errors.
6. Data entered on Step 1 and Step 2 is preserved and summarized in step header.
7. Step 3 academic mapping data is preserved across back/forward navigation.
