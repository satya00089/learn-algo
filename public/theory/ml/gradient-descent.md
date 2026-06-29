# Gradient Descent

## What It Is

Gradient descent is an optimization algorithm. It does not predict labels by itself. Instead, it helps many machine learning models learn their parameters by minimizing a loss function.

## Core Intuition

Imagine standing on a hill in the fog and trying to reach the bottom.

- the gradient tells you which direction points uphill
- moving in the opposite direction takes you downhill

Gradient descent repeats that idea step by step until the loss becomes small enough or stops improving much.

## Update Rule

In plain form, the update looks like this:

```text
new_parameter = old_parameter - learning_rate * gradient
```

Meaning:

- the **gradient** tells you which way increases loss
- the **learning rate** controls how large each step is

## How It Works

1. Start with initial parameter values.
2. Compute the current loss.
3. Compute the gradient of the loss.
4. Move parameters in the opposite direction of the gradient.
5. Repeat until convergence.

## Key Formula or Rule

The standard update step is:

$$
\theta_{new} = \theta_{old} - \eta \, \nabla J(\theta)
$$

Here `J(\theta)` is the loss, `\nabla J(\theta)` is the gradient, and `\eta` is the learning rate.

## Worked Example

Suppose a line-fitting model is making predictions that are consistently too high.

- the gradient points toward reducing the slope or intercept
- gradient descent nudges those values down
- after many updates, the line fits the training points better

You usually do not solve this by hand. The important idea is that repeated small corrections can eventually produce a good model.

## Looking Deeper

Gradient descent is best understood as a balance between:

- the shape of the loss surface
- the size of each update step
- the amount of noise in the gradient estimate

This is why batch, stochastic, and mini-batch versions behave differently. They are all following the same idea, but with different trade-offs between stability, speed, and noise.

## Learning Rate

The learning rate is one of the most important settings.

If it is too small:

- learning is slow
- training may take too long

If it is too large:

- the algorithm may overshoot the minimum
- training may bounce around or diverge

## Common Variants

### Batch Gradient Descent

Uses the full dataset for every update.

### Stochastic Gradient Descent

Uses one example at a time.

### Mini-Batch Gradient Descent

Uses a small batch of examples at a time. This is the most common practical choice.

## Why Feature Scaling Helps

When features are on very different scales, the optimization path can zig-zag and slow down.

Scaling often helps gradient descent converge faster and more smoothly.

## Strengths

- Simple and widely applicable
- Works for very large models and datasets
- Foundation of modern machine learning training

## Limitations

- Needs a differentiable or near-differentiable objective
- Sensitive to learning rate choice
- Can converge slowly on difficult landscapes
- May get stuck in poor regions or plateaus

## Under the Hood

Modern optimization builds on gradient descent with extra techniques such as:

- **momentum**
- **RMSProp**
- **Adam**
- learning-rate schedules

Deeper gradient-descent work also has to consider conditioning, saddle points, and how feature scaling changes the optimization path. In practice, good optimization is often less about the formula itself and more about controlling the training dynamics around it.

## Real-Life Uses

- Linear regression training
- Logistic regression training
- Neural network training
- Many other optimization-based models

## When to Use and Avoid

Use gradient descent when:

- the model is trained by minimizing a loss function
- closed-form solutions are impractical or impossible

Avoid relying on plain gradient descent alone when:

- a simpler exact solution exists and is cheap
- optimization is unstable and needs more advanced techniques

## How to Think About It in Practice

- Think of gradient descent whenever a model learns by minimizing a loss function and an exact closed-form solution is unrealistic.
- In practice, most of the work is not the update formula itself but choosing scales, step sizes, and optimization variants wisely.

## Common Mistakes

- Using a learning rate that is too large or too small for the surface being optimized.
- Skipping feature scaling and then blaming gradient descent for slow or unstable training.

## Compare With

- [Linear Regression](/ml/linear-regression): gradient descent often trains linear models, but linear regression can also be solved directly.
- [Polynomial Regression](/ml/polynomial-regression): both use optimization, but polynomial models can become more sensitive to step size and curvature.

## Key Takeaway

Gradient descent is the engine behind much of machine learning. It improves a model by repeatedly taking small steps that reduce error.

## Try It Live

- [Open this playground](/ml/gradient-descent)
