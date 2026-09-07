# Design System & UI Pattern Guide

This document contains the complete design patterns, color tokens, typography scale, component blueprints, and styling conventions extracted from the project. Use this guide to initialize and maintain visual consistency across any new application.

---

## 1. Overview & Core Philosophy

- **Theme Style**: Clean, modern enterprise dashboard ("EduDrive" aesthetic) with warm orange accents, high-contrast neutral surfaces, and accessible status tokens.
- **Color Temperature**: Warm primary with clean slate neutrals.
- **Design Tokens**: Standard CSS custom properties defined in `:root` and overridden in `[data-theme='dark']`.
- **Icon Library**: `lucide-vue-next` (or `lucide-react`).
- **Typography**: Inter (`font-family: 'Inter', sans-serif;`).
- **Border Radius Standard**:
  - `rounded-2xl` (16px) — Card containers, modals, slide-overs.
  - `rounded-xl` (12px) — Form inputs, primary buttons, menu links, stat icon boxes.
  - `rounded-lg` (8px) — Action buttons, small tags, pagination items.
  - `rounded-full` (9999px) — Status badges, avatars, notification counters.

---

## 2. Color System & CSS Variables

Add this directly into your global CSS (e.g. `src/style.css`):

```css
@import "tailwindcss";

:root {
  /* ================= Brand & Primary ================= */
  --primary: #f39223;               /* Warm Orange / Amber */
  --primary-light: #ffedd5;         /* Orange 100 tint */
  --primary-hover: #ea580c;         /* Orange 600 */

  /* ================= Neutrals & Backgrounds ================= */
  --bg-sidebar: #ffffff;
  --bg-main: #fcfcfc;
  --bg-main-light: #f8f7f5;
  --bg-card: #ffffff;

  /* ================= Text Colors ================= */
  --text-primary: #111827;          /* Slate 900 */
  --text-secondary: #6b7280;        /* Slate 500 */
  --text-muted: #9ca3af;            /* Slate 400 */

  /* ================= Borders & Navigation ================= */
  --border-color: #e5e7eb;          /* Slate 200 */
  --sidebar-active: #ffedd5;        /* Active item background */
  --sidebar-active-text: #f39223;   /* Active item text */

  /* ================= Status Tokens (5-Part System) ================= */
  /* Success */
  --status-success-bg: #ecfdf3;
  --status-success-border: #bbf7d0;
  --status-success-text: #166534;
  --status-success-icon: #15803d;
  --status-success-icon-bg: #dcfce7;

  /* Warning / Notice */
  --status-warning-bg: #fff7ed;
  --status-warning-border: #fed7aa;
  --status-warning-text: #c2410c;
  --status-warning-icon: #b45309;
  --status-warning-icon-bg: #ffedd5;

  /* Error / Destructive */
  --status-error-bg: #fef2f2;
  --status-error-border: #fecaca;
  --status-error-text: #b91c1c;
  --status-error-icon: #dc2626;
  --status-error-icon-bg: #fee2e2;
}

[data-theme='dark'] {
  /* ================= Dark Mode Brand ================= */
  --primary: #f39223;
  --primary-light: #2d1a0b;
  --primary-hover: #fb923c;

  /* ================= Dark Mode Neutrals ================= */
  --bg-sidebar: #111827;            /* Gray 900 */
  --bg-main: #030712;               /* Gray 950 */
  --bg-main-light: #030712;
  --bg-card: #1f2937;               /* Gray 800 */

  /* ================= Dark Mode Text ================= */
  --text-primary: #f9fafb;          /* Gray 50 */
  --text-secondary: #d1d5db;        /* Gray 300 */
  --text-muted: #9ca3af;            /* Gray 400 */

  /* ================= Dark Mode Borders & Navigation ================= */
  --border-color: #374151;          /* Gray 700 */
  --sidebar-active: #2d1a0b;
  --sidebar-active-text: #f39223;

  /* ================= Dark Mode Status Tokens ================= */
  --status-success-bg: #0f2318;
  --status-success-border: #1f5136;
  --status-success-text: #7ad39a;
  --status-success-icon: #4ade80;
  --status-success-icon-bg: #163322;

  --status-warning-bg: #2a1d0f;
  --status-warning-border: #5b3a16;
  --status-warning-text: #f8b770;
  --status-warning-icon: #f59e0b;
  --status-warning-icon-bg: #3b2711;

  --status-error-bg: #2f1414;
  --status-error-border: #5f2323;
  --status-error-text: #f7a8a8;
  --status-error-icon: #f87171;
  --status-error-icon-bg: #3b1919;
}

body {
  background-color: var(--bg-main);
  color: var(--text-primary);
  font-family: 'Inter', sans-serif;
}

/* Bi-directional (LTR & RTL) placeholder & input alignment */
input[type='text'],
input[type='search'],
input[type='email'],
input[type='tel'],
input[type='password'],
textarea {
  text-align: start;
}
```

---

## 3. Typography Scale & Hierarchy

| Semantic Level | Tailwind Classes | Sample Usage |
| :--- | :--- | :--- |
| **Page Title (H1)** | `text-2xl font-bold text-[var(--text-primary)]` | Top of page / breadcrumb header |
| **Hero Metric (H1 Extra)** | `text-xl sm:text-2xl font-black text-[var(--text-primary)]` | Dashboard greeting / Stat numbers |
| **Section Title (H2)** | `text-lg font-bold sm:text-xl text-[var(--text-primary)]` | Major card section header |
| **Card Subheading (H3)**| `text-base font-bold text-[var(--text-primary)]` | Table card titles, modal titles |
| **Section Eyebrow** | `text-[10px]` or `text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]` | Form section headings, overlines |
| **Field Labels** | `text-xs font-medium tracking-wide text-[var(--text-secondary)]` | Form field labels |
| **Table Column Header**| `text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]` | `<th>` table headers |
| **Body Standard** | `text-sm text-[var(--text-primary)]` | Table cells, dialog contents |
| **Caption / Subtext** | `text-xs text-[var(--text-secondary)]` | Under labels, timestamps, metadata |

---

## 4. Layout Architecture Pattern

### Shell Blueprint
- **Sidebar**: Fixed width `w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]` on desktop; slide-over drawer `w-72 max-w-[85vw]` with overlay `bg-black/40` on mobile.
- **Main Container**: `flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg-main-light)]`.
- **Header**: Sticky height `h-16 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)] px-4 sm:px-6`.
- **Content Area**: `flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8`.

---

## 5. UI Component Snippets (Ready to Use)

### A. Buttons

```html
<!-- Primary CTA Button -->
<button
  type="button"
  class="inline-flex items-center gap-2 rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 text-sm font-semibold transition-colors shadow-sm focus:outline-none focus:ring-4 focus:ring-orange-200 cursor-pointer"
>
  <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 5v14M5 12h14"/>
  </svg>
  Add Record
</button>

<!-- Secondary / Outlined Button -->
<button
  type="button"
  class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-main)] transition cursor-pointer"
>
  Refresh
</button>

<!-- Ghost / Cancel Button -->
<button
  type="button"
  class="rounded-xl px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-black/5 transition cursor-pointer"
>
  Cancel
</button>

<!-- Table Action Icon Button -->
<button
  type="button"
  class="inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--primary)] hover:text-[var(--primary-hover)] hover:bg-[var(--primary-light)] transition-colors cursor-pointer"
  aria-label="View details"
>
  <Eye class="w-[18px] h-[18px]" />
</button>

<!-- Destructive Button -->
<button
  type="button"
  class="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-semibold transition-colors cursor-pointer"
>
  Delete Record
</button>
```

---

### B. Form Inputs & Section Dividers

```html
<!-- Form Section Header with Accent Bar -->
<div class="mb-5 flex items-center gap-2">
  <span class="h-px w-4 bg-[var(--primary)]" />
  <h2 class="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
    Account Information
  </h2>
</div>

<!-- Standard Input Field -->
<div class="space-y-1.5">
  <label for="username" class="text-xs font-medium tracking-wide text-[var(--text-secondary)]">
    Full Name <span class="text-red-500 font-semibold">*</span>
  </label>
  <input
    id="username"
    type="text"
    placeholder="e.g. Jane Doe"
    class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 placeholder:text-[var(--text-muted)]"
  />
  <p class="text-xs text-red-400">Name is required.</p>
</div>
```

---

### C. Stat & KPI Cards

```html
<div class="bg-[var(--bg-card)] p-4 sm:p-5 lg:p-6 rounded-2xl shadow-sm border border-[var(--border-color)] flex items-center gap-3 sm:gap-4 transition-transform hover:translate-y-[-2px] hover:shadow-md">
  <div class="p-3 sm:p-4 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shrink-0">
    <!-- Icon w-5 h-5 or w-6 h-6 -->
    <svg viewBox="0 0 24 24" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" stroke-width="2">
      <rect width="18" height="18" x="3" y="3" rx="2"/>
    </svg>
  </div>
  <div class="min-w-0">
    <p class="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
      Active Students
    </p>
    <p class="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1 break-words">
      1,420
    </p>
  </div>
</div>
```

---

### D. Status Badges (Pills)

```html
<!-- Success / Active Badge -->
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#ecfdf3] text-[#166534] border border-[#bbf7d0]">
  Active
</span>

<!-- Warning / In Transit Badge -->
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#fff7ed] text-[#c2410c] border border-[#fed7aa]">
  In Transit
</span>

<!-- Destructive / Inactive Badge -->
<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]">
  Inactive
</span>

<!-- Neutral Tag -->
<span class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
  12 Vehicles
</span>
```

---

### E. Data Table & Header Filter Bar

```html
<div class="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-sm">
  <!-- Top Filter Toolbar -->
  <div class="grid grid-cols-1 gap-3 border-b border-[var(--border-color)] px-4 py-4 sm:px-6 lg:grid-cols-4">
    <!-- Search Bar with Leading Icon -->
    <div class="relative lg:col-span-2">
      <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Search records..."
        class="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] py-2 pl-9 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
    </div>
  </div>

  <!-- Table Body -->
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-[var(--border-color)]">
      <thead class="bg-[var(--bg-main)]">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Title
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Status
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
            Actions
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-[var(--border-color)] bg-[var(--bg-card)]">
        <tr class="hover:bg-[var(--bg-main)] transition-colors">
          <td class="px-6 py-4 text-sm font-semibold text-[var(--text-primary)]">
            Campus Route A
          </td>
          <td class="px-6 py-4">
            <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[#ecfdf3] text-[#166534]">
              Active
            </span>
          </td>
          <td class="px-6 py-4 text-right">
            <button class="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--primary)] hover:bg-[var(--primary-light)]">
              <Eye class="w-4 h-4" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

### F. Page Wrapper (`Wrapper.vue`) Pattern

```html
<div class="w-full flex flex-col gap-5">
  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-sm">
    <a href="/" class="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
      Dashboard
    </a>
    <span class="text-[var(--text-muted)] select-none">›</span>
    <span class="font-semibold text-[var(--primary)]" aria-current="page">
      Vehicles
    </span>
  </nav>

  <!-- Page Header Row -->
  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
    <div class="flex items-start gap-3">
      <!-- Back Button -->
      <button
        type="button"
        class="mt-1 flex h-8 w-8 items-center justify-center rounded-md border-2 border-[var(--border-color)] text-[var(--primary)] transition-colors duration-200 hover:border-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_14%,var(--bg-card))]"
        aria-label="Go back"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div>
        <h1 class="text-2xl font-bold text-[var(--text-primary)]">
          Vehicles
        </h1>
        <p class="text-sm mt-0.5 text-[var(--text-secondary)]">
          Manage your fleet buses and GPS tracking devices
        </p>
      </div>
    </div>

    <!-- Header Action Slot -->
    <div class="flex flex-wrap items-center gap-2 sm:justify-end">
      <!-- Primary and secondary buttons go here -->
    </div>
  </div>

  <!-- Content Slot -->
  <div>...</div>
</div>
```

---

### G. Modal Dialog Pattern

```html
<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-4"
  role="dialog"
  aria-modal="true"
>
  <div class="w-full max-w-xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-xl flex flex-col overflow-hidden">
    <!-- Modal Header -->
    <div class="p-6 pb-4 border-b border-[var(--border-color)] flex items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-[var(--text-primary)]">Modal Title</h2>
        <p class="mt-1 text-sm text-[var(--text-secondary)]">Brief explanation or instruction.</p>
      </div>
      <button
        type="button"
        class="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-main)] cursor-pointer"
      >
        <span class="sr-only">Close</span>
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m18 6-12 12M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Modal Body -->
    <div class="overflow-y-auto p-6 space-y-4">
      <!-- Modal form / details content -->
    </div>

    <!-- Modal Footer -->
    <div class="p-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-end gap-3">
      <button
        type="button"
        class="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-main)] cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        class="rounded-xl bg-orange-400 hover:bg-orange-500 text-white px-5 py-2 text-sm font-semibold shadow-sm cursor-pointer"
      >
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

## 6. Recommended Starter `package.json`

For quick setup when initializing your new project:

```json
{
  "name": "new-admin-web-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vueuse/core": "^14.0.0",
    "axios": "^1.7.0",
    "dayjs": "^1.11.0",
    "lucide-vue-next": "^0.574.0",
    "pinia": "^3.0.0",
    "vue": "^3.5.0",
    "vue-i18n": "^11.0.0",
    "vue-router": "^4.0.0",
    "vue3-toastify": "^0.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.2.0",
    "@vitejs/plugin-vue": "^6.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.5.0",
    "postcss-rtlcss": "^5.7.0",
    "tailwindcss": "^4.2.0",
    "typescript": "^5.9.0",
    "vite": "^7.3.0",
    "vue-tsc": "^3.2.0"
  }
}
```
