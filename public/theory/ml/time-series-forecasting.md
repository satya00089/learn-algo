# Time-Series Forecasting

Time-series forecasting is about predicting future values from observations that arrive in time order.
Unlike ordinary tabular regression, **order matters**: what happened recently, what happened last season,
and whether the series is trending all influence what we should expect next.

## The Learning Flow

This playground is designed as a layered workflow:

1. **Preprocess the signal**
2. **Inspect trend and seasonality**
3. **Compare forecast models on a holdout window**

That mirrors how a practical forecaster works. Before trusting a model, we first check whether the
input signal is clean enough to model.

## Stage 1: Preprocessing

Time-series data often contains missing values and abnormal spikes.

- **Interpolation** fills missing observations by borrowing structure from nearby values.
- **Forward fill** is useful when the latest known value is a reasonable approximation.
- **Outlier clipping** limits extreme spikes so one unusual observation does not dominate smoothing.

These decisions change the downstream forecast, so the playground recomputes everything immediately
when you change them.

## Stage 2: Pattern Reading

### Trend

Trend is the slow, long-term direction of the series.
We approximate it with a **centered rolling average**.

- Larger windows create smoother trend lines.
- Smaller windows react faster, but they can confuse trend with short-term noise.

### Seasonality

Seasonality is a repeating pattern at a fixed interval.

- Monthly business data often has a yearly seasonal period of `12`.
- Daily visitor data often has a weekly seasonal period of `7`.

The seasonal panel in this playground is an intuition builder:
it estimates what each seasonal slot usually contributes after the trend is removed.

### Residual

Residuals are what remain after subtracting trend and seasonality from the observed series.
If the residual view still shows strong structure, the selected model may be missing something.

## Stage 3: Forecast Models

The models progress from simple to more expressive.

### Mean

Forecasts every future point as the historical average.
This is a useful baseline because it exposes whether a more complex model is actually learning anything.

### Naive

Repeats the most recent observation.
This is surprisingly hard to beat when a series changes slowly.

### Seasonal Naive

Repeats the observation from the matching seasonal position.
For monthly data, that means using the same month from the previous year.

### Moving Average

Forecasts from the recent rolling window.
It smooths noise, but repeated multi-step forecasting tends to flatten the future path.

### Simple Exponential Smoothing

Maintains a single smoothed level.
Recent points matter more than old ones, controlled by **alpha**.

### Holt Linear

Extends exponential smoothing with an additive trend term.
It is a better fit when the level is changing steadily over time.

### Holt-Winters Additive

Adds an explicit seasonal component on top of level and trend.
This is often the strongest model in this v1 playground when the series has visible recurring structure.

## Metrics

The holdout comparison uses three common forecast metrics:

- **MAE**: average absolute error
- **RMSE**: square-root of average squared error, which penalizes large misses more heavily
- **MAPE**: percentage error relative to the actual values

MAPE is often the easiest metric to explain to stakeholders, but it becomes unstable when actual values
are near zero.

## Confidence Bands

The confidence bands in this playground are **approximate**, not a formal probabilistic interval from a
full statistical model. They are meant to communicate uncertainty growth as the forecast horizon extends,
not to replace rigorous interval estimation.
