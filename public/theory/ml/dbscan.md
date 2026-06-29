# DBSCAN

## What It Is

DBSCAN stands for **Density-Based Spatial Clustering of Applications with Noise**. It is an unsupervised clustering algorithm that groups together points in dense regions and labels isolated points as noise.

## What Problem It Solves

Unlike k-means, DBSCAN does not force every point into a cluster and does not require you to choose the number of clusters in advance.

That makes it useful when:

- clusters may have irregular shapes
- outliers matter
- the number of groups is unknown

## Core Intuition

If many points are packed closely together, they probably belong to the same cluster.

If a point is too isolated, it may be noise.

## Key Parameters

### `eps`

The neighborhood radius.

It answers:

- how close points must be to count as neighbors

### `min_samples`

The minimum number of nearby points needed to treat a point as part of a dense region.

## Point Types

### Core Point

A point with enough neighbors inside the `eps` radius.

### Border Point

A point that is close to a core point but does not have enough neighbors on its own.

### Noise Point

A point that does not belong to any dense region.

## How It Works

1. Pick an unvisited point.
2. Count how many neighbors it has within `eps`.
3. If it has enough neighbors, start or expand a cluster.
4. Keep adding points that are density-connected.
5. If a point is too isolated, mark it as noise, at least for now.

## Key Formula or Rule

DBSCAN is built around the `eps`-neighborhood:

$$
N_{\varepsilon}(x) = \{ y : dist(x,y) \le \varepsilon \}
$$

A point is treated as a core point when:

$$
|N_{\varepsilon}(x)| \ge minSamples
$$

That pair of rules is what turns distance into density.

## Worked Example

Imagine points forming two dense clouds with a few scattered points far away.

DBSCAN will usually:

- detect the two dense clouds as clusters
- leave the scattered points as noise

This is where DBSCAN often beats k-means, which would try to force all points into clusters.

## Looking Deeper

DBSCAN is built around **density reachability**.

That means a cluster is not just a group of nearby points. It is a group where dense neighborhoods connect to each other through core points.

This is why DBSCAN can discover curved or irregular clusters that centroid-based methods usually miss.

## Strengths

- Finds clusters with non-round shapes
- Can detect outliers naturally
- Does not require choosing the number of clusters first

## Limitations

- Choosing `eps` well can be tricky
- Performance drops when data has very different densities
- High-dimensional distance behavior can make clustering harder

## Under the Hood

The biggest advanced limitation of DBSCAN is varying density.

If one cluster is very dense and another is much looser, one fixed `eps` value may fit one cluster but fail on the other.

That is why more advanced density-based methods such as:

- **OPTICS**
- **HDBSCAN**

are often preferred when the dataset has more complicated density structure.

## Real-Life Uses

- Spatial and geographic clustering
- Anomaly detection
- Customer behavior grouping with outliers
- Image or sensor pattern discovery

## When to Use and Avoid

Use DBSCAN when:

- clusters may have arbitrary shapes
- you care about separating noise from structure
- you do not know the number of clusters in advance

Avoid DBSCAN when:

- densities vary a lot across clusters
- distance becomes unreliable in very high dimensions
- parameter tuning is difficult for the dataset

## How to Think About It in Practice

- Think of DBSCAN when cluster shape matters and you want the algorithm to treat isolated points as noise instead of forcing them into groups.
- It is especially attractive when you do not know the number of clusters in advance.

## Common Mistakes

- Choosing `eps` before scaling the data, which can make distance-based density checks misleading.
- Expecting every point to be assigned to a cluster; DBSCAN can label some points as noise.

## Compare With

- [K-Means Clustering](/ml/k-means): DBSCAN finds dense regions without a fixed cluster count, while k-means needs `k` up front.
- [Hierarchical Clustering](/ml/hierarchical-clustering): both can reveal structure without spherical clusters, but they organize it differently.

## Key Takeaway

DBSCAN groups dense regions instead of chasing centroids. Its biggest advantage is that it can find irregular clusters and leave isolated points alone.

## Try It Live

- [Open this playground](/ml/dbscan)
