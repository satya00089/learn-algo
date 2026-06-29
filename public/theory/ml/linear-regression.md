# Linear Regression

## What It Is

Linear regression is a supervised learning algorithm used to predict a **continuous numeric value**.

Examples:

- house price
- sales amount
- temperature
- delivery time

## Core Intuition

Linear regression fits a line, or in higher dimensions a plane, that best captures the relationship between input features and the target value.

For one feature, the model looks like:

```text
y = mx + b
```

Where:

- `x` is the input
- `y` is the predicted output
- `m` is the slope
- `b` is the intercept

## How It Works

1. Start with training examples that have both features and target values.
2. Choose model parameters, the coefficients.
3. Measure how far predictions are from the real values.
4. Adjust the coefficients to reduce that error.
5. Use the fitted line to predict new values.

## Key Formula or Rule

A linear regression model predicts:

$$
\hat{y} = b_0 + b_1x_1 + b_2x_2 + \cdots + b_dx_d
$$

A common training objective is mean squared error:

$$
MSE = \frac{1}{n} \sum_{i=1}^{n} (y_i - \hat{y}_i)^2
$$

The model chooses coefficients that make that average squared error as small as possible.

## Worked Example

Suppose we want to predict apartment rent from floor area.

Training data might suggest:

- larger apartments usually cost more
- smaller apartments usually cost less

After fitting a line, the model may learn something like:

```text
predicted_rent = 500 + 2.5 * area
```

For an area of `400`:

```text
predicted_rent = 500 + 2.5 * 400 = 1500
```

## Looking Deeper

Linear regression is not just about drawing a line. It is really about estimating how much each feature changes the prediction while holding the others fixed.

That is why the coefficients matter:

- positive coefficients push the prediction up
- negative coefficients pull it down
- the intercept is the baseline prediction

In multiple regression, this becomes a full weighted combination of features rather than a single slope.

## How Error Is Measured

A common loss function is **mean squared error**, or MSE.

Idea:

- compute each prediction error
- square it so large mistakes count more
- average across all examples

The model tries to make that value as small as possible.

## Important Assumptions

Linear regression works best when:

- the relationship is roughly linear
- extreme outliers are limited
- features are not highly redundant with each other
- errors behave reasonably consistently

It can still be useful when these assumptions are not perfect, but results become less reliable.

## Evaluation Metrics

Common metrics include:

- MAE
- MSE
- RMSE
- R-squared

These help answer two questions:

- how large are the mistakes?
- how much variation does the model explain?

## Strengths

- Easy to understand and explain
- Fast to train
- Strong baseline for many regression problems
- Coefficients are often interpretable

## Limitations

- Can only model straight-line relationships unless features are engineered
- Sensitive to outliers
- May underfit complex patterns

## Under the Hood

In practice, linear regression work often focuses on diagnostics rather than just fitting.

Important issues include:

- **multicollinearity**, where features overlap too much
- **heteroscedasticity**, where error spread changes across the range
- choosing between a closed-form solution and gradient-based optimization
- adding regularization such as Ridge or Lasso

This is why linear regression remains valuable even in deeper workflows. It is both a predictive model and a diagnostic tool for understanding structure in numeric data.

## Real-Life Uses

- Price prediction
- Revenue forecasting
- Trend estimation
- Simple business analytics models

## When to Use and Avoid

Use linear regression when:

- the target is numeric
- interpretability matters
- the relationship is fairly simple

Avoid plain linear regression when:

- the pattern is strongly non-linear
- outliers dominate the dataset
- interactions matter but are not represented in the features

## How to Think About It in Practice

- Think of linear regression as the first baseline for a numeric target when interpretability matters.
- Even when you expect the final model to be more complex, linear regression is often the cleanest place to start reasoning about the data.

## Common Mistakes

- Assuming the relationship is truly linear just because the line fits the sample.
- Ignoring outliers or correlated features that can distort interpretation.

## Compare With

- [Logistic Regression](/ml/logistic-regression): linear regression predicts continuous values, while logistic regression predicts class probabilities.
- [Polynomial Regression](/ml/polynomial-regression): polynomial regression keeps the same fitting idea but allows curved relationships.

## Key Takeaway

Linear regression is often the best first regression model to try. It is simple, interpretable, and surprisingly useful when the underlying relationship is close to linear.

## Try It Live

- [Open this playground](/ml/linear-regression)
