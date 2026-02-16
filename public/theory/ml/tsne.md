# t-SNE (t-Distributed Stochastic Neighbor Embedding)

**t-SNE** is a powerful non-linear dimensionality reduction technique primarily used for **data visualization**. It excels at revealing local structure and natural clusters in high-dimensional data by mapping it to 2D or 3D space while preserving neighborhood relationships.

## How t-SNE Works

t-SNE operates through a two-step probability distribution mapping:

### Step 1: High-Dimensional Affinities

For each pair of points in the original high-dimensional space, compute similarity using a Gaussian kernel:

$$
p_{j|i} = \frac{\exp(-||x_i - x_j||^2 / 2\sigma_i^2)}{\sum_{k \neq i} \exp(-||x_i - x_k||^2 / 2\sigma_i^2)}
$$

The variance $\sigma_i$ is chosen such that the perplexity (effective number of neighbors) matches a user-specified value (typically 30).

### Step 2: Low-Dimensional Affinities

In the low-dimensional space (2D or 3D), use Student's t-distribution with 1 degree of freedom:

$$
q_{ij} = \frac{(1 + ||y_i - y_j||^2)^{-1}}{\sum_{k \neq l} (1 + ||y_k - y_l||^2)^{-1}}
$$

The heavy-tailed t-distribution helps prevent crowding in the center of the visualization.

### Step 3: Optimization

Minimize the **Kullback-Leibler (KL) divergence** between P and Q:

$$
C = KL(P||Q) = \sum_i \sum_j p_{ij} \log \frac{p_{ij}}{q_{ij}}
$$

This is done using gradient descent with momentum:

$$
\frac{\partial C}{\partial y_i} = 4 \sum_j (p_{ij} - q_{ij})(y_i - y_j)(1 + ||y_i - y_j||^2)^{-1}
$$

## Key Parameters

### Perplexity (5-50)

- **Balance** between preserving local vs. global structure
- **Low perplexity**: focuses on very local patterns (small clusters)
- **High perplexity**: considers broader neighborhoods (global structure)
- Recommended: 5-50, start with 30

### Learning Rate (10-1000)

- **Step size** for gradient descent
- **Too low**: slow convergence, may get stuck
- **Too high**: unstable, chaotic movement
- Recommended: 100-1000, start with 200

### Early Exaggeration

- **Multiplier** applied to P values in first ~250 iterations (typically 4×)
- Helps **separate clusters** early by increasing attraction between similar points
- Creates more **compact, well-separated** clusters in the final embedding

## Implementation Stages

### 1. Initialization (Iteration 0)

- Points randomly initialized in low-dimensional space with very small random values
- Prevents artificial structure from initialization

### 2. Early Exaggeration (Iterations 1-250)

- P values multiplied by 4 to strengthen cluster formation
- Large gradients help points rapidly move toward their neighborhoods
- Momentum starts low (0.5) to allow aggressive initial movement

### 3. Main Optimization (Iterations 251-1000)

- Remove exaggeration, use actual P values
- Increase momentum (0.8) for smoother convergence
- Adaptive learning rates (gains) help individual points escape poor local minima

### 4. Convergence

- Cost (KL divergence) decreases and stabilizes
- Points settle into final positions
- Local neighborhoods preserved, clusters visible

## Why Student's t-Distribution?

The **Student's t-distribution** (vs. Gaussian) in low dimensions solves two critical problems:

1. **Crowding problem**: In high dimensions, there's exponentially more volume far from the center. A Gaussian would force all points toward the center in 2D/3D.

2. **Heavy tails**: The t-distribution with 1 degree of freedom has much heavier tails than a Gaussian, allowing **dissimilar points** to spread out while keeping **similar points** close.

## Applications

### Biology & Medicine

- Single-cell RNA sequencing (scRNA-seq) visualization
- Protein structure clustering
- Drug discovery compound space exploration

### Natural Language Processing

- Word embedding visualization (Word2Vec, GloVe)
- Document clustering
- Semantic similarity analysis

### Computer Vision

- Image feature space visualization
- Facial recognition systems
- Transfer learning visualization

### Recommender Systems

- User preference clustering
- Product similarity mapping
- Content-based filtering

## Limitations

1. **Computational Complexity**: O(n²) for exact computation, O(n log n) with approximations
2. **Non-deterministic**: Different runs produce different results (random initialization)
3. **No Inverse Transform**: Cannot map new points into existing embedding
4. **Parameter Sensitive**: Results vary significantly with perplexity and learning rate
5. **Interpretability**: Distances between clusters have limited meaning (only local structure preserved)

## Best Practices

### Choosing Perplexity

- **Small datasets** (< 500 points): try 5-15
- **Medium datasets** (500-5000): try 20-50
- **Large datasets** (> 5000): try 30-100
- Run multiple times with different perplexities

### Interpreting Results

- **Cluster separation** is meaningful
- **Within-cluster structure** is meaningful
- **Distance between clusters** may not be meaningful
- **Cluster size** doesn't indicate importance

### Avoiding Pitfalls

- Don't over-interpret global structure
- Check results are stable across multiple runs
- Validate clusters with domain knowledge
- Consider using UMAP for alternative perspectives

## Comparison with Other Methods

### PCA (Principal Component Analysis)

- **Linear** dimensionality reduction
- **Preserves global structure** (variance explained)
- Fast, deterministic
- Not good for complex, non-linear manifolds

### UMAP (Uniform Manifold Approximation and Projection)

- Faster than t-SNE
- Better preserves **global structure**
- Can embed new points
- Similar visualization quality

### Autoencoders

- Neural network-based
- Can learn **inverse transform**
- More complex to train
- Can handle very large datasets

## Mathematical Properties

### Symmetrization

The conditional probabilities are symmetrized:

$$
p_{ij} = \frac{p_{j|i} + p_{i|j}}{2n}
$$

This ensures the cost function is symmetric and helps gradient computation.

### Gradient Computation

The gradient has two key components:

1. **Attractive forces**: pull similar points together (p_ij > q_ij)
2. **Repulsive forces**: push dissimilar points apart (p_ij < q_ij)

The $(1 + ||y_i - y_j||^2)^{-1}$ term gives the repulsive force a **long-range** effect.

## Advanced Techniques

### Barnes-Hut Approximation

- Reduces complexity from O(n²) to O(n log n)
- Uses space-partitioning trees to approximate repulsive forces
- Enables t-SNE on datasets with millions of points

### Multicore t-SNE

- Parallelizes pairwise distance and gradient computations
- Significant speedup on multi-core systems

### Parametric t-SNE

- Learns a neural network to map high-dimensional → low-dimensional
- Allows embedding of new points
- Useful for out-of-sample prediction

## Real-World Example: Single-Cell RNA-seq

In genomics, researchers use t-SNE to visualize thousands of cells, each measured across 20,000+ genes:

1. **Input**: Gene expression matrix (cells × genes)
2. **Preprocessing**: Log normalization, PCA to reduce to ~50 dimensions
3. **t-SNE**: Map to 2D with perplexity=30
4. **Result**: Cells cluster by cell type, revealing distinct populations

This has revolutionized our understanding of tissue composition and cellular heterogeneity.

## Conclusion

t-SNE is an invaluable tool for **exploring and visualizing** high-dimensional data. While it has limitations (computational cost, non-determinism, local focus), its ability to reveal natural clusters makes it indispensable in fields from biology to NLP. Understanding its parameters and interpreting results carefully unlocks its full potential.

# Tab: Python

```python
import numpy as np
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt

# Generate sample high-dimensional data
np.random.seed(42)
X = np.random.randn(500, 100)  # 500 samples, 100 dimensions

# Create clusters in high-dimensional space
X[:100] += [5, 5] + [0] * 98   # Cluster 1
X[100:200] += [-5, -5] + [0] * 98  # Cluster 2
X[200:300] += [5, -5] + [0] * 98  # Cluster 3
X[300:400] += [-5, 5] + [0] * 98  # Cluster 4

# Apply t-SNE
tsne = TSNE(
    n_components=2,
    perplexity=30,
    learning_rate=200,
    n_iter=1000,
    random_state=42
)

X_embedded = tsne.fit_transform(X)

# Visualize
plt.figure(figsize=(10, 8))
colors = ['red'] * 100 + ['blue'] * 100 + ['green'] * 100 + ['orange'] * 100 + ['purple'] * 100
plt.scatter(X_embedded[:, 0], X_embedded[:, 1], c=colors, alpha=0.6, s=50)
plt.title('t-SNE Visualization of High-Dimensional Clusters')
plt.xlabel('t-SNE Component 1')
plt.ylabel('t-SNE Component 2')
plt.show()

# Check cost (KL divergence)
print(f"Final KL divergence: {tsne.kl_divergence_:.4f}")
```

# Tab: JavaScript

```javascript
// Using ml-tsne library for t-SNE in JavaScript
import { TSNE } from 'ml-tsne'

// Sample high-dimensional data (100 samples, 50 dimensions)
const data = Array.from({ length: 100 }, () => Array.from({ length: 50 }, () => Math.random() * 10))

// Create t-SNE instance
const model = new TSNE({
  dim: 2, // Output dimensions
  perplexity: 30, // Balance local vs global
  learningRate: 200, // Gradient descent step size
  nIter: 1000, // Maximum iterations
  metric: 'euclidean', // Distance metric
})

// Compute embedding
model.init({
  data: data,
  type: 'dense',
})

// Run optimization
for (let i = 0; i < 1000; i++) {
  model.step()

  // Log progress every 250 iterations
  if (i % 250 === 0) {
    const cost = model.cost()
    console.log(`Iteration ${i}, Cost: ${cost.toFixed(4)}`)
  }
}

// Get final embedding
const embedding = model.getOutputScaled()

console.log('Final 2D embedding:', embedding)

// Visualize using D3.js or Canvas
function visualize(embedding) {
  const canvas = document.getElementById('tsne-canvas')
  const ctx = canvas.getContext('2d')

  // Find bounds
  let xMin = Infinity,
    xMax = -Infinity
  let yMin = Infinity,
    yMax = -Infinity

  embedding.forEach(([x, y]) => {
    xMin = Math.min(xMin, x)
    xMax = Math.max(xMax, x)
    yMin = Math.min(yMin, y)
    yMax = Math.max(yMax, y)
  })

  // Draw points
  embedding.forEach(([x, y]) => {
    const px = ((x - xMin) / (xMax - xMin)) * canvas.width
    const py = ((y - yMin) / (yMax - yMin)) * canvas.height

    ctx.beginPath()
    ctx.arc(px, py, 5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(59, 130, 246, 0.6)'
    ctx.fill()
  })
}

visualize(embedding)
```

# Tab: R

```r
library(Rtsne)
library(ggplot2)

# Generate sample data with clusters
set.seed(42)
n_samples <- 500
n_features <- 100

# Create high-dimensional data
X <- matrix(rnorm(n_samples * n_features), nrow = n_samples)

# Add cluster structure
X[1:100, 1:2] <- X[1:100, 1:2] + 5    # Cluster 1
X[101:200, 1:2] <- X[101:200, 1:2] - 5  # Cluster 2
X[201:300, 1:2] <- X[201:300, 1:2] + c(5, -5)  # Cluster 3
X[301:400, 1:2] <- X[301:400, 1:2] + c(-5, 5)  # Cluster 4

# Create labels for coloring
labels <- factor(c(rep("Cluster 1", 100),
                   rep("Cluster 2", 100),
                   rep("Cluster 3", 100),
                   rep("Cluster 4", 100),
                   rep("Noise", 100)))

# Run t-SNE
tsne_result <- Rtsne(
  X,
  dims = 2,                # Output dimensions
  perplexity = 30,         # Perplexity parameter
  max_iter = 1000,         # Maximum iterations
  theta = 0.5,             # Barnes-Hut approximation parameter
  check_duplicates = FALSE
)

# Create data frame for plotting
df <- data.frame(
  x = tsne_result$Y[, 1],
  y = tsne_result$Y[, 2],
  cluster = labels
)

# Visualize with ggplot2
ggplot(df, aes(x = x, y = y, color = cluster)) +
  geom_point(alpha = 0.6, size = 3) +
  labs(
    title = "t-SNE Visualization of High-Dimensional Clusters",
    x = "t-SNE Dimension 1",
    y = "t-SNE Dimension 2",
    color = "Cluster"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(hjust = 0.5, size = 16, face = "bold"),
    legend.position = "right"
  )

# Print final KL divergence
cat(sprintf("Final KL divergence: %.4f\n", tail(tsne_result$costs, 1)))

# Try different perplexities to compare
perplexities <- c(5, 15, 30, 50)
results_list <- list()

for (perp in perplexities) {
  tsne_temp <- Rtsne(X, perplexity = perp, max_iter = 500)
  results_list[[as.character(perp)]] <- data.frame(
    x = tsne_temp$Y[, 1],
    y = tsne_temp$Y[, 2],
    cluster = labels,
    perplexity = paste("Perplexity =", perp)
  )
}

# Combine results
df_combined <- do.call(rbind, results_list)

# Plot comparison
ggplot(df_combined, aes(x = x, y = y, color = cluster)) +
  geom_point(alpha = 0.5, size = 2) +
  facet_wrap(~ perplexity, scales = "free") +
  labs(title = "t-SNE with Different Perplexity Values") +
  theme_minimal()
```

# Tab: C++

```cpp
#include <vector>
#include <random>
#include <cmath>
#include <algorithm>
#include <iostream>

class TSNE {
private:
    int n_samples;
    int n_features;
    int n_components;
    double perplexity;
    double learning_rate;
    int max_iter;
    double momentum;
    double early_exaggeration;

    std::vector<std::vector<double>> X;  // Input data
    std::vector<std::vector<double>> Y;  // Output embedding
    std::vector<std::vector<double>> P;  // High-dim affinities
    std::vector<std::vector<double>> dY; // Gradient
    std::vector<std::vector<double>> uY; // Momentum velocity
    std::vector<std::vector<double>> gains; // Adaptive learning rates

public:
    TSNE(int n_comp = 2, double perp = 30.0, double lr = 200.0,
         int max_it = 1000, double mom = 0.8, double early_ex = 4.0)
        : n_components(n_comp), perplexity(perp), learning_rate(lr),
          max_iter(max_it), momentum(mom), early_exaggeration(early_ex) {}

    // Compute pairwise Euclidean distances
    std::vector<std::vector<double>> computeDistances(
        const std::vector<std::vector<double>>& data
    ) {
        int n = data.size();
        std::vector<std::vector<double>> distances(n, std::vector<double>(n, 0.0));

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                double dist = 0.0;
                for (size_t d = 0; d < data[i].size(); d++) {
                    double diff = data[i][d] - data[j][d];
                    dist += diff * diff;
                }
                distances[i][j] = distances[j][i] = dist;
            }
        }
        return distances;
    }

    // Compute high-dimensional affinities with perplexity
    void computeAffinities(const std::vector<std::vector<double>>& distances) {
        int n = distances.size();
        P.assign(n, std::vector<double>(n, 0.0));

        double target_entropy = log(perplexity);

        for (int i = 0; i < n; i++) {
            // Binary search for appropriate sigma
            double beta = 1.0;
            double min_beta = -INFINITY;
            double max_beta = INFINITY;

            for (int iter = 0; iter < 50; iter++) {
                // Compute P_j|i with current beta
                std::vector<double> P_row(n, 0.0);
                double sum_P = 0.0;

                for (int j = 0; j < n; j++) {
                    if (i != j) {
                        P_row[j] = exp(-distances[i][j] * beta);
                        sum_P += P_row[j];
                    }
                }

                // Normalize
                for (int j = 0; j < n; j++) {
                    P_row[j] /= sum_P;
                }

                // Compute entropy
                double H = 0.0;
                for (int j = 0; j < n; j++) {
                    if (i != j && P_row[j] > 1e-12) {
                        H -= P_row[j] * log(P_row[j]);
                    }
                }

                // Adjust beta
                double H_diff = H - target_entropy;
                if (fabs(H_diff) < 1e-5) break;

                if (H_diff > 0) {
                    min_beta = beta;
                    beta = (max_beta == INFINITY) ? beta * 2 : (beta + max_beta) / 2;
                } else {
                    max_beta = beta;
                    beta = (min_beta == -INFINITY) ? beta / 2 : (beta + min_beta) / 2;
                }
            }
        }

        // Symmetrize
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                P[i][j] = P[j][i] = (P[i][j] + P[j][i]) / (2.0 * n);
            }
        }
    }

    // Initialize embedding randomly
    void initializeEmbedding(int n) {
        std::random_device rd;
        std::mt19937 gen(rd());
        std::normal_distribution<> dist(0.0, 1e-4);

        Y.assign(n, std::vector<double>(n_components, 0.0));
        dY.assign(n, std::vector<double>(n_components, 0.0));
        uY.assign(n, std::vector<double>(n_components, 0.0));
        gains.assign(n, std::vector<double>(n_components, 1.0));

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n_components; j++) {
                Y[i][j] = dist(gen);
            }
        }
    }

    // Single optimization step
    double step(int iter) {
        int n = Y.size();
        double exaggeration = (iter < 250) ? early_exaggeration : 1.0;
        double mom = (iter < 250) ? 0.5 : momentum;

        // Compute Q (low-dimensional affinities)
        std::vector<std::vector<double>> Q(n, std::vector<double>(n, 0.0));
        double sum_Q = 0.0;

        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                double d = 0.0;
                for (int k = 0; k < n_components; k++) {
                    double diff = Y[i][k] - Y[j][k];
                    d += diff * diff;
                }
                double q = 1.0 / (1.0 + d);
                Q[i][j] = Q[j][i] = q;
                sum_Q += 2.0 * q;
            }
        }

        // Normalize Q
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                Q[i][j] = std::max(Q[i][j] / sum_Q, 1e-12);
            }
        }

        // Compute gradient
        for (int i = 0; i < n; i++) {
            for (int k = 0; k < n_components; k++) {
                dY[i][k] = 0.0;
                for (int j = 0; j < n; j++) {
                    if (i != j) {
                        double pq = P[i][j] * exaggeration - Q[i][j];
                        double d = 0.0;
                        for (int d_idx = 0; d_idx < n_components; d_idx++) {
                            double diff = Y[i][d_idx] - Y[j][d_idx];
                            d += diff * diff;
                        }
                        double mult = pq / (1.0 + d);
                        dY[i][k] += 4.0 * mult * (Y[i][k] - Y[j][k]);
                    }
                }
            }
        }

        // Update embedding with momentum and adaptive learning rates
        for (int i = 0; i < n; i++) {
            for (int k = 0; k < n_components; k++) {
                // Adaptive gains
                if ((dY[i][k] > 0) != (uY[i][k] > 0)) {
                    gains[i][k] += 0.2;
                } else {
                    gains[i][k] *= 0.8;
                }
                gains[i][k] = std::max(gains[i][k], 0.01);

                // Update with momentum
                uY[i][k] = mom * uY[i][k] - learning_rate * gains[i][k] * dY[i][k];
                Y[i][k] += uY[i][k];
            }
        }

        // Zero-mean embedding


        for (int k = 0; k < n_components; k++) {
            double mean = 0.0;
            for (int i = 0; i < n; i++) {
                mean += Y[i][k];
            }
            mean /= n;
            for (int i = 0; i < n; i++) {
                Y[i][k] -= mean;
            }
        }

        // Compute KL divergence (cost)
        double cost = 0.0;
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (i != j && P[i][j] > 1e-12) {
                    cost += P[i][j] * log(P[i][j] / Q[i][j]);
                }
            }
        }

        return cost;
    }

    // Fit the model
    std::vector<std::vector<double>> fit_transform(
        const std::vector<std::vector<double>>& data
    ) {
        n_samples = data.size();
        n_features = data[0].size();
        X = data;

        // Compute distances and affinities
        auto distances = computeDistances(X);
        computeAffinities(distances);

        // Initialize embedding
        initializeEmbedding(n_samples);

        // Optimize
        for (int iter = 0; iter < max_iter; iter++) {
            double cost = step(iter);

            if (iter % 250 == 0) {
                std::cout << "Iteration " << iter << ", Cost: " << cost << std::endl;
            }
        }

        return Y;
    }
};

// Example usage
int main() {
    // Generate sample data
    std::vector<std::vector<double>> data;
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<> dist(0.0, 1.0);

    // Create 4 clusters
    for (int cluster = 0; cluster < 4; cluster++) {
        for (int i = 0; i < 50; i++) {
            std::vector<double> point(100);
            for (int j = 0; j < 100; j++) {
                point[j] = dist(gen);
            }
            // Add cluster offset
            point[0] += cluster * 5.0;
            point[1] += (cluster % 2) * 5.0;
            data.push_back(point);
        }
    }

    // Run t-SNE
    TSNE tsne(2, 30.0, 200.0, 1000);
    auto embedding = tsne.fit_transform(data);

    // Print results
    std::cout << "\nFinal 2D embedding (first 10 points):\n";
    for (int i = 0; i < std::min(10, (int)embedding.size()); i++) {
        std::cout << "Point " << i << ": ("
                  << embedding[i][0] << ", "
                  << embedding[i][1] << ")\n";
    }

    return 0;
}
```
