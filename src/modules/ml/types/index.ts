// Machine Learning types

export interface Point2D {
  x: number
  y: number
}

export interface DataPoint extends Point2D {
  label?: number
}

export interface LinearRegressionParams {
  slope: number
  intercept: number
}

export interface GradientDescentStep {
  iteration: number
  slope: number
  intercept: number
  cost: number
  gradientSlope: number
  gradientIntercept: number
}
