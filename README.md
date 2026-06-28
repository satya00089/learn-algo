# Learn-Algo

Learn-Algo is an interactive web app for exploring data structures, algorithms, machine learning, and AI through hands-on playgrounds and visual explanations. It is built with Next.js, React, TypeScript, Three.js, and Tailwind CSS.

## What You Can Explore

- DSA playgrounds for sorting, searching, trees, stacks, queues, strings, recursion, and bit manipulation
- ML playgrounds for probability, statistics, PCA, t-SNE, clustering, regression, scaling, anomaly detection, and ensemble methods
- AI playgrounds, including a Minimax demo
- Theory modals with conceptual and mathematical explanations
- Responsive layouts that work on desktop and mobile
- Dark mode support and theme-aware visualizations
- Syntax-highlighted code examples
- PWA support for installable, offline-friendly usage

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Three.js
- React Three Fiber and React Three Drei
- Tailwind CSS
- Shiki for syntax highlighting
- Zustand for state management
- Framer Motion for motion and transitions

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm start` - run the production server
- `npm run lint` - run Next.js linting
- `npm run format` - format the codebase with Prettier
- `npm run type-check` - run the TypeScript compiler without emitting files
- `npm run generate:og` - generate Open Graph images

## Project Structure

```text
learn-algo/
├── src/
│   ├── app/         Next.js app router pages
│   ├── components/  Shared UI and structured data components
│   ├── core/        Core UI primitives and utilities
│   ├── hooks/       Shared React hooks
│   ├── modules/     DSA, ML, and AI engines, hooks, playgrounds, and visualizers
│   └── ...
├── public/          Static assets
├── scripts/         Build and asset generation scripts
├── data/            Local data files
└── README.md
```

## Highlights

### DSA

- Array operations
- Bubble sort, selection sort, insertion sort, merge sort, quick sort, heap sort
- Binary search
- Binary search tree
- Stack
- Queue
- String operations
- Bit manipulation
- Recursion

### ML

- Chance events
- Expectation and variance
- PCA
- t-SNE
- K-Means
- DBSCAN
- Gaussian mixture models
- Hierarchical clustering
- Linear regression
- Polynomial regression
- Logistic regression
- Gradient descent
- Standard scaler
- MinMax scaler
- KNN
- Decision trees
- Anomaly detection
- Ensemble models

### AI

- Minimax

## Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a pull request

## License

Licensed under the MIT License. See [`LICENSE`](LICENSE) for details.
