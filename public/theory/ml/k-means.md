# Understanding K-Means Clustering

## What is K-Means?

K-Means is an unsupervised machine learning algorithm that partitions data into **k** distinct clusters based on similarity. Each observation belongs to the cluster with the nearest mean (centroid).

## How It Works

1. **Initialize**: Choose k random centroids
2. **Assign**: Assign each point to nearest centroid
3. **Update**: Recalculate centroids as mean of points
4. **Repeat**: Until convergence or max iterations

## Key Concepts

- **Centroid**: Center point of a cluster
- **Within-cluster sum of squares (WCSS)**: Measure of cluster tightness
- **Elbow method**: Technique to find optimal k

## Applications

- Customer segmentation
- Image compression
- Anomaly detection
- Document clustering