# Min-Max Scaler

## What It Does

Min-max scaling transforms each feature into a fixed range, usually `0` to `1`.

It rescales values without changing their relative order.

## Why It Is Useful

Some algorithms care a lot about the scale of features.

If one feature ranges from `0` to `1` and another from `0` to `10000`, the larger-scale feature can dominate distance calculations or optimization.

Min-max scaling makes the ranges comparable.

## Formula

For the common `0` to `1` range:

```text
scaled_value = (x - min) / (max - min)
```

Where:

- `x` is the original value
- `min` is the smallest training value for that feature
- `max` is the largest training value for that feature

## Key Formula or Rule

For the common `0` to `1` range:

$$
x' = \frac{x - x_{min}}{x_{max} - x_{min}}
$$

This keeps the ordering of values the same while squeezing them into a shared range.

## Worked Example

Suppose a feature contains:

`[10, 20, 30]`

Here:

- min = `10`
- max = `30`

Scaled values become:

- `10 -> 0.0`
- `20 -> 0.5`
- `30 -> 1.0`

## Looking Deeper

Min-max scaling preserves order and relative spacing, but it does not center the data.

That means it is often useful when:

- bounded inputs are important
- relative ranking matters
- the downstream algorithm cares about scale more than distribution shape

It changes the range, not the underlying ordering of the feature.

## When It Helps

Min-max scaling is often useful for:

- KNN
- neural networks
- gradient-based models when bounded inputs are helpful
- image data such as converting `0..255` pixel values into `0..1`

## Important Limitation: Outliers

Min-max scaling is very sensitive to outliers.

If one extremely large value appears, most other values may get squeezed into a tiny part of the range.

## Training vs Test Data

A very important rule:

- fit the scaler on the training set only
- reuse the same min and max on validation and test data

If you fit on the whole dataset first, you leak information from the future into training.

## Strengths

- Easy to understand
- Keeps values in a fixed range
- Preserves order and relative spacing

## Limitations

- Sensitive to outliers
- Does not center data around zero
- Needs stable min and max values to behave well

## Under the Hood

In production systems, the main concerns include:

- what happens when new data falls outside the original training range
- whether to clip or allow values outside `0..1`
- how often the scaler should be refit when data drifts

It is also common to compare min-max scaling against robust alternatives when the feature distribution is unstable or outlier-heavy.

## Real-Life Uses

- Image preprocessing
- KNN pipelines
- Neural network inputs
- Dashboards that need normalized ranges

## When to Use and Avoid

Use min-max scaling when:

- a bounded range is helpful
- the feature distribution is not dominated by extreme outliers

Avoid min-max scaling when:

- outliers are severe
- you would rather center data around zero, in which case standard scaling may fit better

## How to Think About It in Practice

- Think of min-max scaling when you need features on a shared bounded range, especially for distance-based methods or neural-network inputs.
- If outliers dominate the range, read that as a sign to compare it against more robust preprocessing choices.

## Common Mistakes

- Fitting the scaler on the full dataset before the train/test split, which causes data leakage.
- Using it blindly on outlier-heavy data where a few extreme values compress everything else.

## Compare With

- [Standard Scaler](/ml/standard-scaler): min-max scaling compresses values into a fixed range, while standard scaling centers around zero.
- [PCA](/ml/pca): PCA also changes feature space, but for dimensionality reduction rather than simple rescaling.

## Key Takeaway

Min-max scaling is simple and effective when you want all features on the same bounded scale. Its biggest weakness is sensitivity to extreme values.

## Try It Live

- [Open this playground](/ml/minmax-scaler)
