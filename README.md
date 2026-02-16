# Learn-Algo

An interactive web platform for learning Data Structures & Algorithms, Machine Learning, and AI through cutting-edge 3D visualizations and hands-on playgrounds. Built with React, TypeScript, Next.js, and Three.js for immersive learning experiences. Perfect for students, developers, and interview preparation to explore algorithms visually and intuitively. 🚀

## Features

- 📊 **Interactive DSA Playgrounds**: Visualize sorting algorithms, binary trees, stacks, queues, recursion, and more with step-by-step explanations
- 🤖 **Advanced ML Visualizations**: Explore 3D PCA, clustering algorithms (K-Means, DBSCAN, GMM, Hierarchical), regression models, gradient descent optimization, anomaly detection, ensemble methods
- 🎲 **Probability Theory**: Interactive demonstrations of chance events, expected value, and variance with real-time convergence
- 📈 **Feature Engineering**: Standard Scaler, MinMax Scaler with before/after visualizations
- 📚 **Theory Modals**: In-depth explanations with mathematical formulas and concepts
- 💻 **Multi-Language Code Examples**: Python, JavaScript, Java, and more with syntax highlighting
- 🌙 **Dark Mode Support**: Seamless experience in light and dark themes with theme-aware visualizations
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- ⚡ **Real-time Feedback**: See algorithms in action with interactive step-by-step visualizations
- 🎯 **3D Interactive Scenes**: Rotate, zoom, and explore algorithms in three dimensions

## Tech Stack

- **Frontend**: React 18, TypeScript, Next.js 16
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **Styling**: Tailwind CSS
- **Code Highlighting**: Shiki
- **Charts/Visualization**: Custom Canvas implementations with interactive controls
- **State Management**: React Hooks, Context API
- **Build Tool**: Next.js with Turbopack
- **PWA Support**: Service Workers for offline capability

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/learn-algo.git
cd learn-algo
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
learn-algo/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── dsa/            # DSA playground pages
│   │   ├── ml/             # ML playground pages
│   │   └── ai/             # AI playground pages
│   ├── modules/
│   │   ├── dsa/            # DSA algorithms and engines
│   │   ├── ml/             # ML algorithms and engines
│   │   └── ai/             # AI algorithms and engines
│   └── components/         # Shared UI components
├── public/                 # Static assets and icons
└── README.md
```

## Available Playgrounds

**Array Operations**: Append, insert, delete, search, update with complexity analysis

- **Sorting Algorithms**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, Heap Sort with step-by-step visualization
- **Binary Search**: Efficient searching in sorted arrays with divide and conquer
- **Binary Search Trees**: Insertion, deletion, traversal (inorder, preorder, postorder)
- **Stack (LIFO)**: Push, pop, peek operations with visual stack representation
- **Queue (FIFO)**: Enqueue, dequeue, peek with circular queue visualization
- **String Operations**: Reverse, palindrome check, anagram detection, substring search
- **Bit Manipulation**: Bitwise AND, OR, XOR, shifts, and bit tricks
- **Recursion**: Factorial, Fibonacci, Tower of Hanoi with call stack visualization

### Machine Learning

#### Probability & Statistics Fundamentals

- **Chance Events**: Coin flips and dice rolls demonstrating probability convergence
- **Expectation (E[X])**: Expected value with fair and biased distributions
- **Variance**: Statistical spread measurement with card drawing simulations

#### Dimensionality Reduction

- **PCA (Principal Component Analysis)**: Interactive 3D visualization with component vectors, explained variance, and data transformation

#### Clustering Algorithms

- **K-Means Clustering**: Centroid-based clustering with elbow method
- **DBSCAN**: Density-based clustering for arbitrary shapes
- **GMM (Gaussian Mixture Models)**: Probabilistic clustering with EM algorithm
- **Hierarchical Clustering**: Agglomerative clustering with dendrograms

#### Regression Models

- **Linear Regression**: Simple and multiple linear regression with gradient descent
- **Polynomial Regression**: Non-linear relationships with feature transformation
- **Logistic Regression**: Binary classification with sigmoid function

#### Optimization & Preprocessing

- **Gradient Descent**: 3D visualization of optimization landscape with learning rate and momentum
- **Standard Scaler**: Z-score standardization for feature scaling
- **MinMax Scaler**: Range normalization [0,1] for bounded features

#### Other Algorithms

- **K-Nearest Neighbors (KNN)**: Distance-based classification and regression
- **Decision Trees**: Tree-based classification with split visualization
- **Anomaly Detection**: Outlier detection techniques
- **Ensemble Models**: Bagging, boosting, and model combination strategies
- **Regularization**: L1 (Lasso) and L2 (Ridge) regularization techniquesion
- Logistic Regression
- K-Nearest Neighbors
- K-Means Clustering

### Artificial Intelligence

- A\* Pathfinding (Coming Soon)
- Minimax Algorithm (Coming Soon)
- Genetic Algorithms (Coming Soon)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [`LICENSE`](LICENSE) file for details.

## Acknowledgments

- Built with ❤️ for the algorithm learning community
- Inspired by the need for interactive algorithm education

---

**Happy Learning!** 🎓

Explore algorithms one visualization at a time. If you find this project helpful, please give it a ⭐!
