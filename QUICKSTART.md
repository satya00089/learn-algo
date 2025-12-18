# Quick Start Guide

Welcome to learn-algo.dev! This guide will get you up and running in minutes.

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animations)
- D3.js & Visx (advanced visualizations)

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:3000**

### 3. Open in Browser

Navigate to http://localhost:3000 and you'll see:

- **Home Page**: Overview of DSA, ML, and AI modules
- **ML Module**: Click to see available Machine Learning algorithms
- **Linear Regression**: The first working example!

## 🎮 Try the Linear Regression Playground

1. Go to **http://localhost:3000/ml/linear-regression**
2. You'll see:
   - **Canvas**: Scatter plot with data points and regression line
   - **Controls**: Play, Step, Run, Reset buttons
   - **Parameters**: Adjust learning rate and max iterations
   - **State Display**: See current slope, intercept, cost, and iteration

### Controls Explained

- **▶ Play**: Runs algorithm step-by-step with animation
- **Step**: Execute one gradient descent iteration
- **Run All**: Run to convergence instantly
- **Reset**: Return to initial state
- **Debug Mode**: Enable for detailed state inspection
- **Generate New Data**: Create random dataset

### What You'll See

1. Blue dots are data points
2. Red line is the regression line
3. Watch the line adjust to fit the data
4. See error (cost) decrease over iterations
5. Red dashed lines show prediction errors

## 📁 Project Structure at a Glance

```
src/
├── app/                           # Next.js pages
│   ├── page.tsx                  # Home page
│   ├── ml/                       # ML module routes
│   │   ├── page.tsx             # ML algorithms list
│   │   └── linear-regression/
│   │       └── page.tsx         # Linear regression page
│   ├── dsa/                      # DSA module routes
│   └── ai/                       # AI module routes
│
├── core/                          # Shared systems
│   ├── canvas/                   # Reusable canvas engine
│   │   ├── Canvas.tsx           # Canvas component
│   │   ├── useCanvas.ts         # Canvas hook
│   │   ├── drawGrid.ts          # Grid drawing
│   │   ├── drawAxes.ts          # Axes drawing
│   │   └── types.ts             # Canvas types
│   │
│   └── controls/                 # Reusable UI controls
│       ├── Button.tsx           # Button component
│       ├── Slider.tsx           # Slider component
│       ├── Toggle.tsx           # Toggle component
│       └── ControlGroup.tsx     # Control container
│
└── modules/                       # Feature modules
    ├── ml/                       # Machine Learning
    │   ├── algorithms/           # Pure math functions
    │   │   └── linearRegression.ts
    │   ├── engines/              # Step-based execution
    │   │   └── LinearRegressionEngine.ts
    │   ├── visualizers/          # Canvas rendering
    │   │   └── linearRegressionVisualizer.ts
    │   ├── playground/           # Orchestration
    │   │   └── LinearRegressionPlayground.tsx
    │   ├── hooks/                # React hooks
    │   │   └── useLinearRegressionPlayground.ts
    │   └── types/                # TypeScript types
    │
    ├── dsa/                      # Data Structures & Algorithms
    │   ├── algorithms/
    │   │   └── bubbleSort.ts
    │   ├── engines/
    │   │   └── BubbleSortEngine.ts
    │   ├── visualizers/
    │   │   └── sortingVisualizer.ts
    │   └── types/
    │
    └── ai/                       # Artificial Intelligence
        └── (Coming soon)
```

## 🔧 Available Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🎯 What's Working Now

✅ **Core Systems**

- Canvas engine with hooks
- Reusable UI controls (Button, Slider, Toggle, ControlGroup)
- Module structure (DSA, ML, AI)
- Routing with Next.js App Router

✅ **Linear Regression** (Complete Example)

- Pure algorithm functions (gradient descent, cost calculation)
- Step-based engine with full state management
- Canvas visualizer (points, line, error lines, axes)
- Interactive playground with all controls
- Real-time state display

✅ **Infrastructure**

- TypeScript strict mode
- Tailwind CSS styling
- ESLint & Prettier configuration
- Module READMEs

## 🔜 Coming Soon

The foundation is ready for:

- More ML algorithms (Logistic Regression, K-Means, Neural Networks)
- DSA visualizations (Bubble Sort engine is ready!)
- AI algorithms (A\*, Minimax, Genetic Algorithms)

## 🏗️ Architecture Highlights

### 1. Separation of Concerns

Every algorithm follows the same pattern:

- **Algorithm** (pure functions) → **Engine** (stepable) → **Visualizer** (canvas) → **Playground** (orchestrate)

### 2. Debuggable by Design

All engines implement:

```typescript
interface DebuggableAlgorithm<TState> {
  init(): void
  step(): void // Execute ONE step
  run(): void // Run to completion
  reset(): void
  getState(): TState
}
```

### 3. Reusable Core

- Canvas system works for ANY visualization
- Controls work for ANY algorithm
- No duplication, consistent UX

## 📖 Next Steps

1. **Explore Linear Regression**: http://localhost:3000/ml/linear-regression
2. **Read the Architecture**: See `COPILOT_INSTRUCTIONS.md`
3. **Add More Algorithms**: Follow `DEVELOPMENT.md`
4. **Customize**: Modify parameters, colors, visualizations

## 💡 Tips

- Press **Step** to see gradient descent in slow motion
- Lower the **Learning Rate** to see more iterations
- Click **Generate New Data** for different datasets
- Enable **Debug Mode** for detailed state inspection
- Check the **State Display** panel to understand the algorithm

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

```bash
# Run type check
npm run type-check
```

## 🌟 Philosophy Reminder

> "If an algorithm cannot be understood through interaction alone, the implementation is incorrect."

This platform is about **learning by doing**, not reading documentation.

---

**Happy Learning! 🚀**

For detailed architecture guidelines, see `COPILOT_INSTRUCTIONS.md`
For development patterns, see `DEVELOPMENT.md`
