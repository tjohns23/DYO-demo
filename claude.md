# DYO (Done Is Better Than Perfect) 🎯

## Project Vision & Philosophy

**Core Principle:** "Supportive but Firm"—the app acts as a warm coach that enforces strict boundaries to move users from "thinking" to "done".

**Target User:** Productivity platform designed for "Perfectionist" creators who stall in research loops, analysis paralysis, and scope creep.

**The Intervention:** The app identifies creative "Stall Patterns" and assigns time-locked "Missions".

**Strict Immutability:** Once a mission is accepted, the scope, timebox, and constraints cannot be edited, paused, or cancelled.

---

## Technical Stack

| Component | Technology |
|-----------|-----------|
| **Framework** | Next.js (Webpack/WASM) |
| **Styling** | Tailwind CSS v4 + Shadcn/UI |
| **Backend/Database** | Supabase (PostgreSQL) with Row Level Security (RLS) |
| **Authentication** | Magic Link flow (first login) + optional password |

---

## System Architecture

The system is divided into three core service layers:

### 1. Assessment Engine
- 20-question quiz on a 5-point scale
- Calculates "Dimensional Scores" (Perfectionism, Avoidance, Overthinking, Scope Creep)
- Assigns primary Archetype to user

### 2. Pattern Detection
- Keyword matching engine
- Scans user work descriptions
- Identifies stall types:
  - "Perfectionism Loop"
  - "Momentum Loss"
  - (Additional patterns TBD)

### 3. Mission Engine
- Combines user's archetype, detected pattern, and time constraints
- Generates immutable mission proposals

---

## Design System (MVP v1.0)

### Color Palette

| Color | Hex | Purpose |
|-------|-----|---------|
| **Primary Brand (Burgundy)** | #6B2C3E | Buttons, timers, locked elements |
| **Secondary (Deep Pink)** | #D4598F | Highlights, patterns, celebrations |
| **Base (Warm Cream)** | #FAF7F2 | Backgrounds |

### Typography
- **Primary Font Family:** Inter

### Visual Language
- 2px burgundy borders indicate immutable/locked states
- Lock icons indicate immutable/locked states

---

## Data Models & Logic

*To be documented...*

---

## Development Notes

Note that the quiz is taken before a user ever creates their profile. 
They first take the quiz then receive a magic link. Their account must be created
once they click the link.

