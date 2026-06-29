# Logistic Regression

## What It Is

Logistic regression is a supervised learning algorithm used for **classification**, especially binary classification.

Despite the word "regression" in its name, it is mainly used to answer yes-or-no style questions such as:

- spam or not spam
- churn or not churn
- fraud or not fraud

## Core Intuition

Instead of predicting any real number, logistic regression predicts a **probability** between `0` and `1`.

It does this by combining:

- a weighted sum of the features
- a sigmoid function that squeezes the result into a probability range

```text
probability = sigmoid(weighted_sum)
```

## From Probability to Class

Once the model outputs a probability, you choose a threshold.

Example with threshold `0.5`:

- probability >= `0.5` -> class 1
- probability < `0.5` -> class 0

## How It Works

1. Compute a weighted sum of the features.
2. Pass that value through the sigmoid function.
3. Interpret the result as a probability.
4. Adjust the weights during training to reduce classification error.

## Key Formula or Rule

Logistic regression turns a linear score into a probability with the sigmoid:

$$
p(y=1 \mid x) = \frac{1}{1 + e^{-z}}
$$

$$
z = b_0 + b_1x_1 + b_2x_2 + \cdots + b_dx_d
$$

That is why the model is still linear in its score, but probabilistic in its output.

## Worked Example

Suppose a churn model predicts:

- probability of churn = `0.82`

With a threshold of `0.5`, the final prediction is:

- churn = yes

If your business wants to be more conservative, it could raise the threshold, for example to `0.7` or `0.8`.

## Looking Deeper

Logistic regression is easiest to understand when you think in terms of **log-odds**.

The model learns a weighted score, then transforms it into a probability with the sigmoid function.

That means:

- the raw score defines the decision boundary
- the sigmoid turns that score into something probabilistic
- threshold choice controls the final class decision

So the model itself and the business decision rule are related, but not identical.

## Why It Is Useful

Logistic regression is a great first classification model because it is:

- simple
- fast
- interpretable
- probability-based

It is often strong enough to be useful in production when the class boundary is not too complex.

## Evaluation Metrics

For classification, common metrics include:

- accuracy
- precision
- recall
- F1-score
- ROC-AUC

Accuracy alone can be misleading when one class is much rarer than the other, so precision and recall often matter more.

## Important Assumptions

Logistic regression works best when:

- the relationship between features and log-odds is fairly simple
- classes are reasonably separable
- multicollinearity is not extreme

## Strengths

- Easy to train and explain
- Produces probabilities, not just labels
- Works well as a baseline model
- Can be regularized to reduce overfitting

## Limitations

- Assumes a relatively simple decision boundary
- Struggles with complex non-linear relationships unless features are engineered
- Sensitive to irrelevant features and outliers

## Under the Hood

In practice, logistic-regression work often focuses on:

- **regularization** to prevent overfitting
- **threshold tuning** for precision/recall trade-offs
- **probability calibration**
- extending the model to multinomial classification

This is why logistic regression is still used in serious systems. Its raw accuracy may not always beat more complex models, but its probabilities, interpretability, and controllability are extremely useful.

## Real-Life Uses

- Spam detection
- Credit risk screening
- Medical diagnosis support
- Customer churn prediction
- Fraud detection

## When to Use and Avoid

Use logistic regression when:

- the output is categorical, especially binary
- interpretability matters
- you want a reliable baseline quickly

Avoid plain logistic regression when:

- the boundary between classes is highly non-linear
- performance depends on complex interactions not captured in the features

## How to Think About It in Practice

- Think of logistic regression as the first serious baseline for classification when you want interpretable weights and probability-like outputs.
- It works especially well when the boundary is not too complex and feature engineering can capture the main signal.

## Common Mistakes

- Treating the raw score as a class label instead of converting it through the sigmoid and threshold.
- Forgetting to scale features or inspect class imbalance when probabilities look weak.

## Compare With

- [Linear Regression](/ml/linear-regression): both are linear models, but logistic regression outputs probabilities for classes.
- [Decision Tree](/ml/decision-tree): trees can capture non-linear splits without needing a sigmoid boundary.

## Key Takeaway

Logistic regression is one of the best first classification algorithms to learn because it turns a weighted score into a probability and makes the decision process easy to understand.

## Try It Live

- [Open this playground](/ml/logistic-regression)
