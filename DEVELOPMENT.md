# Development Guide

This guide provides detailed instructions for developing new algorithms and features for learn-algo.dev.

## 🏗️ Architecture Overview

The platform follows a strict **separation of concerns** architecture:

```
Algorithm Logic → Engine → Visualizer → Playground → Page
    (Pure)      (Stepable)  (Canvas)   (Orchestrate) (Route)
```

## 📐 Core Principles

### 1. Pure Algorithm Functions

Algorithm files must be **completely pure**:

```typescript
// ✅ CORRECT - Pure function
export function bubbleSort(arr: number[]): number[] {
  const array = [...arr] // Don't mutate input
  // ... sorting logic
  return array
}

// ❌ WRONG - Has side effects
export function bubbleSort(arr: number[]) {
  updateUI(arr) // NO!
  drawCanvas(arr) // NO!
  return arr
}
```

**Rules:**
- ✅ Accept input → Return output
- ✅ No side effects
- ✅ No UI imports
- ✅ No Canvas/DOM access
- ✅ Fully testable
- ✅ No React hooks

### 2. Step-Based Engines

Engines provide **debuggable, step-by-step** execution:

```typescript
export class AlgorithmEngine implements DebuggableAlgorithm<State> {
  private state: State
  private config: Config

  constructor(config: Config) {
    this.config = config
    this.state = this.initializeState()
  }

  init(): void {
    this.state = this.initializeState()
  }

  step(): void {
    // Perform ONE step of the algorithm
    // Update internal state
    // Check for completion
  }

  run(): void {
    // Run to completion
    while (!this.state.isComplete) {
      this.step()
    }
  }

  reset(): void {
    this.init()
  }

  getState(): State {
    // Return immutable copy of state
    return { ...this.state }
  }
}
```

**Rules:**
- ✅ Implements DebuggableAlgorithm interface
- ✅ step() performs exactly one iteration
- ✅ Maintains complete internal state
- ✅ getState() returns immutable copy
- ✅ No direct UI manipulation

### 3. Pure Visualizers

Visualizers **only draw** - never compute:

```typescript
// ✅ CORRECT - Pure drawing function
export function drawArray(
  ctx: CanvasRenderingContext2D,
  elements: Element[],
  config: VisualizerConfig
): void {
  ctx.save()
  
  elements.forEach((el, index) => {
    const x = calculateX(index, config)
    const y = calculateY(el.value, config)
    
    ctx.fillStyle = getColor(el.state)
    ctx.fillRect(x, y, width, height)
  })
  
  ctx.restore()
}

// ❌ WRONG - Contains algorithm logic
export function drawArray(ctx, elements) {
  // Sorting in visualizer? NO!
  elements.sort()
  
  // Modifying state? NO!
  elements[0].state = 'sorted'
  
  // Draw...
}
```

**Rules:**
- ✅ Receives state as input only
- ✅ Never mutates state
- ✅ No algorithm logic
- ✅ Pure drawing functions
- ✅ Use ctx.save() and ctx.restore()

### 4. Playground Orchestration

Playgrounds **coordinate** everything:

```typescript
export function AlgorithmPlayground() {
  // State management
  const { config, updateConfig } = usePlaygroundConfig()
  const engineRef = useRef<Engine | null>(null)
  const [engineState, setEngineState] = useState<State | null>(null)

  // Canvas setup
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!engineState) return
    
    // Call visualizer functions
    drawElements(ctx, engineState.elements, visualConfig)
    drawLegend(ctx, legendConfig)
  }, [engineState])

  const { canvasRef, redraw } = useCanvas({ config, draw })

  // Control handlers
  const handleStep = () => {
    engineRef.current?.step()
    setEngineState(engineRef.current?.getState() || null)
  }

  const handleRun = () => {
    engineRef.current?.run()
    setEngineState(engineRef.current?.getState() || null)
  }

  return (
    <div>
      <Canvas canvasRef={canvasRef} config={canvasConfig} />
      <ControlPanel
        onStep={handleStep}
        onRun={handleRun}
        // ...
      />
    </div>
  )
}
```

**Rules:**
- ✅ Uses core canvas system
- ✅ Uses core controls
- ✅ Manages engine lifecycle
- ✅ Coordinates visualization
- ✅ Handles user interactions

## 📝 Step-by-Step: Adding a New Algorithm

### Example: Adding Quick Sort to DSA Module

#### Step 1: Create Algorithm File

```typescript
// src/modules/dsa/algorithms/quickSort.ts

/**
 * Pure Quick Sort implementation
 * Partitions array around pivot
 */
export function partition(
  arr: number[],
  low: number,
  high: number
): { array: number[]; pivotIndex: number } {
  const array = [...arr]
  const pivot = array[high]
  let i = low - 1

  for (let j = low; j < high; j++) {
    if (array[j] < pivot) {
      i++
      ;[array[i], array[j]] = [array[j], array[i]]
    }
  }
  
  ;[array[i + 1], array[high]] = [array[high], array[i + 1]]
  return { array, pivotIndex: i + 1 }
}

export function quickSort(arr: number[]): number[] {
  // Recursive implementation
  // Returns sorted array
}
```

#### Step 2: Create Engine

```typescript
// src/modules/dsa/engines/QuickSortEngine.ts

export interface QuickSortState {
  array: ArrayElement[]
  stack: { low: number; high: number }[]
  currentPivot: number | null
  comparisons: number
  swaps: number
  isSorted: boolean
}

export class QuickSortEngine implements DebuggableAlgorithm<QuickSortState> {
  private state: QuickSortState
  
  constructor(array: number[]) {
    this.state = this.initializeState(array)
  }

  init(): void { /* ... */ }
  step(): void { /* ... */ }
  run(): void { /* ... */ }
  reset(): void { /* ... */ }
  getState(): QuickSortState { /* ... */ }
}
```

#### Step 3: Create Visualizer

```typescript
// src/modules/dsa/visualizers/quickSortVisualizer.ts

export function drawQuickSortArray(
  ctx: CanvasRenderingContext2D,
  elements: ArrayElement[],
  currentPivot: number | null,
  config: VisualizerConfig
): void {
  // Draw bars
  // Highlight pivot differently
  // Show comparisons
}
```

#### Step 4: Create Playground

```typescript
// src/modules/dsa/playground/QuickSortPlayground.tsx

export function QuickSortPlayground() {
  // Setup engine
  // Setup canvas
  // Setup controls
  // Return JSX
}
```

#### Step 5: Add Route

```typescript
// src/app/dsa/quick-sort/page.tsx

import { QuickSortPlayground } from '@/modules/dsa/playground/QuickSortPlayground'

export default function QuickSortPage() {
  return <QuickSortPlayground />
}
```

#### Step 6: Update Module Page

Add to algorithm list in `src/app/dsa/page.tsx`

## 🎨 Using Core Systems

### Canvas System

```typescript
import { Canvas, useCanvas } from '@/core/canvas'

const draw = useCallback((ctx: CanvasRenderingContext2D) => {
  // Your drawing code
}, [dependencies])

const { canvasRef, redraw } = useCanvas({
  config: { width: 800, height: 600, padding: { ... } },
  draw,
  animate: false // true for continuous animation
})

return <Canvas canvasRef={canvasRef} config={config} />
```

### Control Components

```typescript
import { Button, Slider, Toggle, ControlGroup } from '@/core/controls'

<ControlGroup title="Parameters">
  <Slider
    label="Speed"
    value={speed}
    min={1}
    max={100}
    onChange={setSpeed}
  />
  
  <Toggle
    label="Show Labels"
    checked={showLabels}
    onChange={setShowLabels}
  />
  
  <Button onClick={handleReset}>Reset</Button>
</ControlGroup>
```

## 🧪 Testing Guidelines

### Testing Pure Algorithms

```typescript
import { bubbleSort } from './bubbleSort'

describe('bubbleSort', () => {
  it('sorts array in ascending order', () => {
    const input = [3, 1, 4, 1, 5, 9, 2, 6]
    const result = bubbleSort(input)
    expect(result).toEqual([1, 1, 2, 3, 4, 5, 6, 9])
  })

  it('does not mutate input', () => {
    const input = [3, 1, 4]
    const copy = [...input]
    bubbleSort(input)
    expect(input).toEqual(copy)
  })
})
```

### Testing Engines

```typescript
import { BubbleSortEngine } from './BubbleSortEngine'

describe('BubbleSortEngine', () => {
  it('steps through algorithm correctly', () => {
    const engine = new BubbleSortEngine([3, 1, 2])
    
    engine.step()
    const state1 = engine.getState()
    expect(state1.comparisons).toBe(1)
    
    engine.run()
    const finalState = engine.getState()
    expect(finalState.isSorted).toBe(true)
  })
})
```

## 🚫 Common Mistakes to Avoid

### ❌ Mixing Concerns

```typescript
// WRONG - Algorithm with UI
export function sort(arr: number[]) {
  updateProgressBar(50) // NO!
  return arr.sort()
}

// WRONG - Visualizer with logic
export function drawArray(ctx, arr) {
  arr.sort() // NO! Visualizers don't compute
  ctx.fillRect(...)
}
```

### ❌ Mutating State

```typescript
// WRONG - Mutating input
export function process(arr: number[]) {
  arr[0] = 999 // NO! Don't mutate
  return arr
}

// CORRECT - Immutable
export function process(arr: number[]) {
  const copy = [...arr]
  copy[0] = 999
  return copy
}
```

### ❌ Side Effects in Algorithms

```typescript
// WRONG
let globalState = []

export function sort(arr: number[]) {
  globalState = arr // NO! Side effect
  return arr.sort()
}

// CORRECT
export function sort(arr: number[]): number[] {
  return [...arr].sort()
}
```

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤔 Questions?

Refer to:
1. `COPILOT_INSTRUCTIONS.md` for architecture rules
2. `src/modules/ml/` for complete Linear Regression example
3. Existing implementations for patterns

---

**Remember: If you mix algorithm logic, UI, and visualization — you're doing it wrong! 🚫**
