# learn-algo.dev

An interactive learning platform for Data Structures & Algorithms, Machine Learning, and AI.

> **If an algorithm cannot be understood through interaction alone, the implementation is incorrect.**

## 🎯 Vision

learn-algo.dev is built on the principle that algorithms should be learned through **playing, stepping, debugging, and visualizing** — not by reading static content.

## ✨ Features

- **Interactive Playgrounds**: Run algorithms step-by-step or in full
- **Debug Mode**: Pause, step through, and inspect internal state
- **Visual Feedback**: Real-time canvas-based visualizations
- **Type-Safe**: Built with TypeScript in strict mode
- **Modular Architecture**: Clean separation of concerns

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── ml/                # Machine Learning routes
│   ├── dsa/               # DSA routes
│   └── ai/                # AI routes
├── core/                  # Shared core systems
│   ├── canvas/            # Reusable canvas engine
│   └── controls/          # Reusable UI controls
└── modules/               # Feature modules
    ├── ml/                # Machine Learning
    │   ├── algorithms/    # Pure algorithm logic
    │   ├── engines/       # Step-based engines
    │   ├── visualizers/   # Canvas rendering
    │   ├── playground/    # Orchestration
    │   ├── hooks/         # React hooks
    │   └── types/         # TypeScript types
    ├── dsa/               # Data Structures & Algorithms
    └── ai/                # Artificial Intelligence
```

## 🏗️ Architecture Principles

### 1. Strict Separation of Concerns

- **Algorithms**: Pure functions, no UI, no side effects
- **Engines**: Step-based execution, implements DebuggableAlgorithm
- **Visualizers**: Only draw based on provided state
- **Playgrounds**: Orchestrate engine + visualizer + controls

### 2. DebuggableAlgorithm Interface

Every learning algorithm implements:

```typescript
interface DebuggableAlgorithm<TState> {
  init(): void
  step(): void
  run(): void
  reset(): void
  getState(): TState
}
```

### 3. Frontend-First

- All algorithms run in-browser by default
- Implemented in TypeScript
- Real-time updates with step-by-step execution

## 🎨 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Visualization**: HTML Canvas, D3.js, SVG
- **Animation**: Framer Motion

## 📚 Available Algorithms

### Machine Learning

- ✅ **Linear Regression**: Gradient descent visualization
- 🔜 Logistic Regression
- 🔜 K-Means Clustering
- 🔜 Neural Networks

### Data Structures & Algorithms

- 🔜 Bubble Sort
- 🔜 Quick Sort
- 🔜 Binary Search Tree
- 🔜 Graph Algorithms

### Artificial Intelligence

- 🔜 A* Pathfinding
- 🔜 Minimax Algorithm
- 🔜 Genetic Algorithms

## 🎮 How to Use

1. **Choose a Module**: Select DSA, ML, or AI from the home page
2. **Pick an Algorithm**: Browse available algorithms
3. **Interact**: Use controls to play, pause, step, or reset
4. **Debug**: Enable debug mode to inspect internal state
5. **Learn**: Understand by seeing, not just reading

## 🛠️ Development

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

### Adding New Algorithms

1. Create pure algorithm functions in `algorithms/`
2. Build step-based engine in `engines/`
3. Create visualizer in `visualizers/`
4. Build playground component in `playground/`
5. Add route in `app/`

See `COPILOT_INSTRUCTIONS.md` for detailed guidelines.

## 📖 Documentation

- [Copilot Instructions](COPILOT_INSTRUCTIONS.md) - Detailed architecture guidelines
- [Linear Regression Example](src/modules/ml/README.md) - Complete implementation guide

## 🤝 Contributing

Contributions are welcome! Please follow the architecture principles outlined in `COPILOT_INSTRUCTIONS.md`.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🌟 Philosophy

> **"If Copilot generates code that mixes algorithm logic, UI, and visualization — it is wrong and must be refactored."**

This project prioritizes:
- Clean architecture
- Teachable code
- Interactive learning
- Visual understanding

---

**Built with ❤️ for learners who prefer playing over reading**