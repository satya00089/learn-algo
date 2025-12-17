## learn-algo.dev

---

## 1. Product Vision

Build **learn-algo.dev**, an interactive learning platform for:

* **DSA (Data Structures & Algorithms)**
* **ML (Machine Learning)**
* **AI**

Users must learn algorithms by **playing, stepping, debugging, and visualizing**, not by reading static content.

> If an algorithm cannot be understood through interaction alone, the implementation is incorrect.

---

## 2. Core Principles (NON-NEGOTIABLE)

1. **Frontend-first**
2. **Algorithms run in-browser by default**
3. **Step-by-step debug mode for users**
4. **Strict separation of concerns**
5. **Reusable components everywhere**
6. **Type-safe, readable, teachable code**

---

## 3. Tech Stack (MANDATORY)

### Frontend

* **Next.js (App Router)**
* **TypeScript (strict mode ON)**
* **Tailwind CSS**
* **shadcn/ui** (layout & controls only)
* **Framer Motion** (animations)

### Visualization

* **HTML Canvas** → primary playground rendering
* **D3.js / Visx** → trees, graphs, structured visuals
* **SVG** → simple/static diagrams

### State Management

* **Zustand**
* ❌ No Redux
* ❌ No prop drilling

---

## 4. Algorithm Execution Policy (VERY IMPORTANT)

### ✅ DEFAULT (REQUIRED)

* All algorithms **must run in-browser**
* Implemented in **TypeScript**
* Designed for:

  * real-time updates
  * step-by-step execution
  * user debugging

### ⚠️ OPTIONAL (ADVANCED ONLY)

* **FastAPI** may be used ONLY for:

  * large datasets
  * benchmarking against sklearn
  * non-debug “compare mode”

❌ FastAPI must **never** be used for:

* debug mode
* step execution
* core learning playgrounds

---

## 5. Project Module Structure (STRICT)

Top-level modules:

```
src/modules/
 ├─ dsa/
 ├─ ml/
 └─ ai/
```

Each module MUST follow the same internal structure.

---

## 6. Module Internal Structure (MANDATORY)

```
module-name/
 ├─ pages/            # Route-level components
 ├─ algorithms/       # Pure algorithm logic
 ├─ engines/          # Step-based algorithm engines
 ├─ visualizers/      # Canvas / SVG rendering logic
 ├─ interactions/     # Mouse, drag, keyboard handling
 ├─ playground/       # Orchestration layer
 ├─ controls/         # UI controls (sliders, toggles)
 ├─ hooks/            # Reusable hooks
 ├─ types/            # TypeScript types
 └─ README.md         # Concept explanation
```

---

## 7. Algorithm Design Rules (CRITICAL)

### Algorithms MUST:

* Be **pure**
* Contain **no UI imports**
* Contain **no Canvas / DOM access**
* Be **fully testable**
* Accept input → return output

### ❌ Forbidden

* React hooks in algorithm files
* Side effects
* Hidden state

---

## 8. Step-Based Debug Engine (REQUIRED)

Every algorithm that supports learning MUST be implemented as a **step-based engine**.

### Required Interface

```ts
interface DebuggableAlgorithm<TState> {
  init(): void
  step(): void
  run(): void
  reset(): void
  getState(): TState
}
```

### Purpose

* Enable user debugging
* Enable pause / resume
* Enable visual stepping
* Enable internal state inspection

---

## 9. Example: Linear Regression Engine

```ts
class LinearRegressionEngine
  implements DebuggableAlgorithm<LinearRegressionState> {

  init() {}
  step() {}
  run() {}
  reset() {}
  getState() {}
}
```

The UI must be able to:

* Call `step()` manually
* Animate after each step
* Display intermediate values

---

## 10. Visualization Rules

Visualization layers MUST:

* Receive **algorithm output only**
* Never mutate algorithm state
* Never contain business logic
* Only draw based on provided state

### Example

```ts
drawPoints(ctx, points)
drawRegressionLine(ctx, slope, intercept)
drawErrorLines(ctx, points, slope, intercept)
```

---

## 11. Canvas System (GLOBAL & REUSABLE)

Create a shared Canvas Engine:

```
src/core/canvas/
 ├─ Canvas.tsx
 ├─ useCanvas.ts
 ├─ drawGrid.ts
 ├─ drawAxes.ts
 └─ types.ts
```

All playgrounds must reuse this system.

---

## 12. Playground Architecture (STANDARD)

Each playground must follow:

```
Playground
 ├─ usePlaygroundState()
 ├─ useAlgorithmEngine()
 ├─ useDebugController()
 ├─ CanvasRenderer
 └─ ControlsPanel
```

---

## 13. Debug Mode (USER-VISIBLE FEATURE)

Every playground must expose:

```
[ Run ] [ Step ] [ Pause ] [ Reset ]
[ Debug Mode Toggle ]
```

### Debug Mode Enables:

* Step-by-step execution
* Highlight active computations
* Inspect intermediate values
* Visualize internal changes

---

## 14. Reusable Core UI Components

```
src/core/controls/
 ├─ Slider.tsx
 ├─ Toggle.tsx
 ├─ Button.tsx
 ├─ ControlGroup.tsx
```

No algorithm-specific UI logic inside these components.

---

## 15. Performance Rules

* Use `requestAnimationFrame` for canvas redraw
* Debounce heavy computations
* Use **Web Workers** for O(n²)+ algorithms
* Avoid unnecessary React re-renders

---

## 16. Code Quality Standards

* TypeScript strict mode
* ESLint + Prettier
* Descriptive function names
* No magic numbers
* Inline comments explaining *why*, not *what*
* Each algorithm has a README explanation

---

## 17. What NOT to Do

❌ No server-side execution for learning
❌ No monolithic components
❌ No UI logic inside algorithms
❌ No Redux
❌ No Canvas logic inside React render

---

## 18. Long-Term (DO NOT IMPLEMENT YET)

* URL-based playground sharing
* Community experiments
* WASM numerical kernels
* Saved learning paths

---

## 19. Final Guiding Rule

> **If Copilot generates code that mixes algorithm logic, UI, and visualization — it is wrong and must be refactored.**

