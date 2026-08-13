# Neural Network Playground

## What It Is

A neural network (here, a **multi-layer perceptron**, or MLP) is a supervised learning model made of stacked layers of simple units ("neurons"). Each neuron computes a weighted sum of its inputs, adds a bias, and passes the result through a non-linear **activation function**.

Stacking layers lets the network learn decision boundaries that a single linear model — like logistic regression — cannot represent, such as the XOR pattern or a spiral.

## Core Intuition

Think of each hidden layer as re-shaping the data so the next layer's job gets easier:

```text
input (x, y) -> hidden layer(s) -> output neuron -> probability
```

Without a non-linear activation function between layers, stacking layers would collapse into a single linear transformation — no more expressive than logistic regression. The activation function is what gives depth its power.

## How It Works

1. **Forward pass** — compute each neuron's weighted sum and activation, layer by layer, until reaching the output neuron.
2. The output neuron uses a **sigmoid** activation, so its value is a probability in `[0, 1]`, just like logistic regression.
3. **Backpropagation** — compare the prediction to the true label, then propagate the error backward through the network, layer by layer, computing how much each weight contributed to the error.
4. **Gradient descent** — nudge every weight and bias slightly in the direction that reduces the error, repeat.

## Key Formula or Rule

Forward pass for one layer:

$$
z^{(l)} = W^{(l)} a^{(l-1)} + b^{(l)}, \qquad a^{(l)} = g\left(z^{(l)}\right)
$$

where $g$ is the layer's activation function (ReLU, tanh, sigmoid, or linear for hidden layers; always sigmoid for the output).

The output layer uses the same binary cross-entropy loss as logistic regression:

$$
\mathcal{L} = -\frac{1}{m}\sum_{i=1}^{m}\Big[y_i \log(\hat{y}_i) + (1-y_i)\log(1-\hat{y}_i)\Big]
$$

Because the output is sigmoid and the loss is cross-entropy, the error signal at the output neuron simplifies to exactly the same expression logistic regression uses:

$$
\delta^{(L)} = \hat{y} - y
$$

Backpropagation then pushes this error backward through each layer using the chain rule:

$$
\delta^{(l)} = \left(W^{(l+1)\top} \delta^{(l+1)}\right) \odot g'\left(z^{(l)}\right)
$$

## Worked Example

Suppose a 2-input, 1-hidden-neuron (ReLU), 1-output (sigmoid) network sees the point `(1, 1)` with true label `1`:

1. Hidden neuron: `z = w1*1 + w2*1 + b`. If `z > 0`, ReLU passes it through unchanged; otherwise it outputs `0`.
2. Output neuron: takes the hidden activation, computes `z_out`, applies sigmoid to get a probability, say `0.3`.
3. Error: `0.3 - 1 = -0.7`. This error flows backward, updating the output weight first, then (scaled by the ReLU derivative) the hidden layer's weights.

## Activation Functions

- **ReLU** — `max(0, z)`. Fast to compute, doesn't saturate for positive inputs, the default choice for hidden layers in practice. Uses **He initialization** here to keep signal variance stable.
- **Tanh** — squashes to `(-1, 1)`, zero-centered, smoother gradients than sigmoid. TensorFlow Playground's own default.
- **Sigmoid** — squashes to `(0, 1)`, can saturate (near-zero gradients) far from zero.
- **Linear** — no non-linearity at all; stacking only linear layers is mathematically equivalent to a single linear layer.

Non-ReLU hidden layers (and the always-sigmoid output layer) use **Xavier/Glorot initialization**.

## Regularization

- **L2** (`+ (λ/2)·Σw²` to the loss) shrinks all weights smoothly toward zero — the classic choice for smoothing an overly jagged decision boundary.
- **L1** (`+ λ·Σ|w|` to the loss) pushes some weights all the way to zero, effectively pruning connections.

Both are applied to the gradient during backpropagation, not to biases.

## Why Depth and Non-Linearity Matter

Logistic regression can only draw a straight decision line (or a curve, with hand-engineered polynomial features). A neural network with at least one non-linear hidden layer can approximate much more complex boundaries automatically — this is why it can solve **XOR**, where no single straight line separates the two classes, and why it can wrap a boundary around a **spiral**.

## Strengths

- Learns non-linear decision boundaries without manual feature engineering
- Depth lets it compose simple patterns into complex ones
- Flexible: works for classification, regression, and beyond (this playground focuses on binary classification)

## Limitations

- More hyperparameters to tune (layers, neurons, activation, learning rate, regularization)
- Harder to interpret than a linear model's weights
- Can overfit small datasets without regularization
- Training can get stuck in poor local minima or plateau, especially with saturating activations like sigmoid

## Compare With

- [Logistic Regression](/ml/logistic-regression): a neural network with zero hidden layers and a sigmoid output *is* logistic regression — this playground's output neuron reuses the exact same math.
- [Gradient Descent](/ml/gradient-descent): the same optimization idea that trains this network, just with a deeper, non-linear model.

## Key Takeaway

A neural network is what you get when you stack logistic-regression-like units with non-linear activations in between — depth and non-linearity are what let it learn decision boundaries a single linear model cannot.

## Try It Live

- [Open this playground](/ml/neural-network-playground)
