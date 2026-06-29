# Polynomial Regression

## What It Is

Polynomial regression is a way to model **curved relationships** while still using a linear-style regression workflow.

Instead of only learning from `x`, the model also learns from powers of `x` such as:

- `x^2`
- `x^3`
- and so on

## Core Intuition

Plain linear regression fits a straight line.

Polynomial regression creates extra features so the model can fit a curve.

Example:

```text
y = b0 + b1*x + b2*x^2
```

This is no longer a straight line in `x`, but it is still linear in the coefficients `b0`, `b1`, and `b2`.

## How It Works

1. Start with the original features.
2. Create polynomial features such as `x^2`, `x^3`, or interaction terms.
3. Fit a regression model using those expanded features.
4. Use validation to choose the polynomial degree.

## Key Formula or Rule

A polynomial regression model with degree `d` looks like:

$$
\hat{y} = b_0 + b_1x + b_2x^2 + \cdots + b_dx^d
$$

The model is still linear in its coefficients, but it can represent curved relationships through the higher-order terms.

## Worked Example

Suppose study time and exam score follow a pattern where gains are strong at first and then level off.

A straight line may miss that curve.

A polynomial model can capture the bend more naturally than plain linear regression.

## Looking Deeper

Polynomial regression works by **feature expansion**.

That means the original problem is transformed before fitting:

- start with `x`
- add `x^2`, `x^3`, and possibly interaction terms
- run a regression model on the expanded feature set

So the model becomes more expressive without changing the basic regression training idea.

## Choosing the Degree

Low degree:

- may be too simple
- can underfit

High degree:

- may fit the training data too closely
- can overfit and generalize poorly

That is why the degree should be selected with validation, not guesswork alone.

## Why Regularization Matters

Higher-degree models can become unstable.

Regularization helps by discouraging overly large coefficients.

Common choices:

- Ridge
- Lasso

## Strengths

- Can model smooth non-linear relationships
- Still fairly interpretable at small degrees
- Extends a familiar regression workflow

## Limitations

- Can overfit quickly as degree increases
- Sensitive to outliers
- Extrapolation outside the training range can be misleading

## Under the Hood

The advanced challenge is not fitting the polynomial. It is controlling how unstable the model becomes as degree rises.

Important tools include:

- cross-validation for degree selection
- Ridge or Lasso regularization
- careful feature scaling

It is also important to be cautious about extrapolation. A polynomial can look excellent inside the training range and become wildly unrealistic just outside it.

## Real-Life Uses

- Growth curves
- Calibration problems
- Physical or economic relationships with smooth bends
- Educational demos of bias vs variance

## When to Use and Avoid

Use polynomial regression when:

- the relationship is curved but still smooth
- you want something more flexible than a straight line
- the feature count is manageable

Avoid polynomial regression when:

- the pattern is highly irregular
- very high degrees are needed just to fit the data
- interpretability becomes poor

## How to Think About It in Practice

- Think of polynomial regression when the relationship bends but still looks like a smooth extension of linear regression.
- It is most useful when you want a simple curved model before jumping to far more flexible methods.

## Common Mistakes

- Raising the degree too aggressively and overfitting the noise.
- Trusting extrapolated predictions far outside the observed data range.

## Compare With

- [Linear Regression](/ml/linear-regression): polynomial regression extends the same idea with curved basis terms.
- [Gradient Descent](/ml/gradient-descent): polynomial models often depend on optimization stability as degree increases.

## Key Takeaway

Polynomial regression adds curved behavior to a linear regression pipeline by expanding the features. It is useful, but degree choice and overfitting control matter a lot.

## Try It Live

- [Open this playground](/ml/polynomial-regression)
