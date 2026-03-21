# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Steel tube pricing calculator — a single-page React app that computes costs, charges, and per-unit breakdowns for steel tubing based on dimensions, weight formulas, and margin.

## Commands

```bash
npm run dev          # Start Vite dev server (HMR)
npm run build        # Type-check (tsc -b) + production build → dist/
npm run preview      # Preview production build
npm run lint         # ESLint (flat config, typescript-eslint)
npm run format       # Prettier write
npm run format:check # Prettier check
```

## Architecture

**Stack**: React 19 + TypeScript + Vite 6 + Tailwind CSS 3.4 + react-number-format

All calculator logic lives in `src/App.tsx` — a single component with 14 useState hooks and cascading useEffect chains that auto-recalculate derived values when inputs change. There is no routing, no external state management, and no backend.

**Calculation flow**:
1. User inputs: Outside Diameter, Length, Pieces, Cost/lb, External Costs, Margin %
2. Weight formula: `(OD² × 2.67 / 12) × Length × Pieces`
3. Total Cost = weight-based cost + external costs
4. Total Charge = Total Cost / (1 - Margin%)
5. Breakdown metrics (per inch, per piece, per pound) derived from totals

Margin can be driven forward (user sets margin → price calculated) or backward (user edits a per-unit price → margin recalculated). Backward edits are debounced at 1000ms with a loading spinner overlay.

**Components**:
- `NumberInput` — regex-validated numeric input with optional `noDecimals` prop; auto-selects on focus
- `Loader` — SVG spinner shown during debounced recalculations

**Styling**: Tailwind utilities for layout (`grid-cols-1 lg:grid-cols-3`), custom CSS classes (`.input-material`, `.btn-submit`) in `App.css` for input/button styling.

**TypeScript config**: Project references pattern — `tsconfig.json` delegates to `tsconfig.app.json` (src) and `tsconfig.node.json` (vite config). Strict mode enabled.
