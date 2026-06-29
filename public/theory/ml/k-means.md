# K-Means Clustering

## What It Is

K-means is an **unsupervised learning** algorithm that groups similar data points into `k` clusters. Each cluster is represented by a center point called a **centroid**.

## What Problem It Solves

Sometimes you have data but no labels. You still want to discover natural groups.

K-means helps answer questions like:

- Which customers behave similarly?
- Which points in this dataset form separate groups?
- Can I compress or summarize this data with a few representative centers?

## Core Intuition

Imagine placing `k` magnets on a table full of metal dots.

- each dot moves toward the nearest magnet
- then each magnet moves to the center of the dots assigned to it
- repeat until the assignments stop changing much

That is the basic idea behind k-means.

## How It Works

1. Choose the number of clusters, `k`.
2. Initialize `k` centroids.
3. Assign every point to its nearest centroid.
4. Recompute each centroid as the average of its assigned points.
5. Repeat assignment and update until the centroids stabilize or a maximum number of iterations is reached.

## Key Formula or Rule

K-means tries to minimize the total squared distance to cluster centers:

$$
\min \sum_{i=1}^{n} \|x_i - \mu_{c(i)}\|^2
$$

That is why the algorithm prefers compact, centroid-centered clusters.

## Worked Example

Suppose points on a line are:

`[1, 2, 3, 10, 11, 12]`

Choose `k = 2`.

Start with centroids at `2` and `11`.

Assignment step:

- points `1, 2, 3` go to centroid `2`
- points `10, 11, 12` go to centroid `11`

Update step:

- new left centroid = average of `1, 2, 3` = `2`
- new right centroid = average of `10, 11, 12` = `11`

The clusters are already stable, so the algorithm stops.

## Looking Deeper

K-means is really optimizing a geometric objective: make each cluster as tight as possible around its centroid.

That is why three things matter so much:

- the distance metric
- feature scaling
- centroid initialization

If the geometry of the feature space is misleading, the clusters will be misleading too.

## Choosing `k`

K-means requires you to choose the number of clusters in advance.

Common approaches:

- **Domain knowledge**: you already know how many groups make sense
- **Elbow method**: look for the point where adding more clusters stops helping a lot
- **Experimentation**: compare results at several values of `k`

## Key Concept: Inertia

K-means tries to reduce the total distance between points and their assigned centroid.

That objective is often called:

- inertia
- within-cluster sum of squares
- WCSS

Lower inertia usually means tighter clusters, but making `k` larger also lowers inertia, so low inertia alone does not mean the clustering is best.

## Strengths

- Simple and fast
- Works well on compact, well-separated clusters
- Easy to explain and visualize
- Scales well to larger datasets

## Limitations

- You must choose `k` first
- Sensitive to initial centroid placement
- Sensitive to outliers
- Assumes roughly round, similarly sized clusters
- Struggles with clusters of unusual shapes

## Practical Tips

- Scale features when dimensions have very different ranges
- Use **k-means++** initialization to choose better starting centroids
- Run the algorithm multiple times because different starts can produce different results

## Under the Hood

In practice, k-means work often focuses on efficiency and initialization quality.

Important ideas include:

- **k-means++** for smarter starting centroids
- **mini-batch k-means** for larger datasets
- understanding that the decision regions are effectively Voronoi-style nearest-centroid regions

This is also why k-means struggles with elongated or varying-density clusters. Its geometry strongly favors round, centroid-centered groupings.

## Real-Life Uses

- Customer segmentation
- Image compression
- Document grouping
- Market basket analysis
- Basic anomaly investigation

## When to Use and Avoid

Use k-means when:

- you expect compact clusters
- speed matters
- the dataset is mostly numeric

Avoid k-means when:

- clusters have irregular shapes
- outliers are common
- you do not want to guess `k` up front

## How to Think About It in Practice

- Think of k-means when the data is numeric, the groups are expected to be compact, and you can make a reasonable guess for `k`.
- If cluster shape or outliers matter more than speed, treat that as a signal to compare it against DBSCAN or hierarchical methods.

## Common Mistakes

- Forgetting that you must choose `k` before clustering starts.
- Running it on unscaled features or with poor centroid initialization and expecting stable clusters.

## Compare With

- [DBSCAN](/ml/dbscan): DBSCAN discovers dense regions automatically, while k-means partitions the space into `k` groups.
- [Hierarchical Clustering](/ml/hierarchical-clustering): hierarchical methods build a cluster tree instead of assigning all points at once.

## Key Takeaway

K-means is a strong first clustering algorithm because it is simple, fast, and intuitive. Its main weakness is that it works best only when the real cluster shape matches its assumptions.

## Try It Live

- [Open this playground](/ml/k-means)
