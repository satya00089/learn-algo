/**
 * Test file to verify Linear Regression algorithm correctness
 * Run this to check if the math is working properly
 */

import {
  predict,
  calculateCost,
  calculateSlopeGradient,
  calculateInterceptGradient,
  gradientDescentStep,
  closedFormSolution,
} from '../algorithms/linearRegression'
import type { Point2D, LinearRegressionParams } from '../types'

// Test data: y = 2x + 1 with some noise
const testPoints: Point2D[] = [
  { x: 0, y: 1 },
  { x: 1, y: 3 },
  { x: 2, y: 5 },
  { x: 3, y: 7 },
  { x: 4, y: 9 },
]

console.log('=== Linear Regression Algorithm Tests ===\n')

// Test 1: Predict function
console.log('Test 1: Predict function')
const params: LinearRegressionParams = { slope: 2, intercept: 1 }
console.log(`Params: slope=${params.slope}, intercept=${params.intercept}`)
console.log(`Predict(x=5): ${predict(5, params)} (Expected: 11)`)
console.log(`Predict(x=-2): ${predict(-2, params)} (Expected: -3)\n`)

// Test 2: Cost function
console.log('Test 2: Cost function')
const perfectParams: LinearRegressionParams = { slope: 2, intercept: 1 }
const badParams: LinearRegressionParams = { slope: 0, intercept: 0 }
console.log(`Cost with perfect params: ${calculateCost(testPoints, perfectParams).toFixed(4)}`)
console.log(`Cost with bad params (0,0): ${calculateCost(testPoints, badParams).toFixed(4)}\n`)

// Test 3: Gradients
console.log('Test 3: Gradient calculations')
const initialParams: LinearRegressionParams = { slope: 0, intercept: 0 }
const slopeGrad = calculateSlopeGradient(testPoints, initialParams)
const interceptGrad = calculateInterceptGradient(testPoints, initialParams)
console.log(`Initial params: slope=${initialParams.slope}, intercept=${initialParams.intercept}`)
console.log(`Slope gradient: ${slopeGrad.toFixed(4)}`)
console.log(`Intercept gradient: ${interceptGrad.toFixed(4)}`)
console.log(`(Negative gradients mean we should increase slope/intercept to reduce cost)\n`)

// Test 4: One gradient descent step
console.log('Test 4: One gradient descent step')
const learningRate = 0.01
const afterOneStep = gradientDescentStep(testPoints, initialParams, learningRate)
console.log(`Learning rate: ${learningRate}`)
console.log(
  `After one step: slope=${afterOneStep.slope.toFixed(4)}, intercept=${afterOneStep.intercept.toFixed(4)}`
)
console.log(`Cost after one step: ${calculateCost(testPoints, afterOneStep).toFixed(4)}\n`)

// Test 5: Multiple steps
console.log('Test 5: Multiple gradient descent steps')
let currentParams = { ...initialParams }
console.log(`Starting: slope=${currentParams.slope}, intercept=${currentParams.intercept}`)
for (let i = 0; i < 100; i++) {
  currentParams = gradientDescentStep(testPoints, currentParams, 0.01)
  if (i % 20 === 0) {
    const cost = calculateCost(testPoints, currentParams)
    console.log(
      `  Iteration ${i}: slope=${currentParams.slope.toFixed(4)}, intercept=${currentParams.intercept.toFixed(4)}, cost=${cost.toFixed(4)}`
    )
  }
}
const finalCost = calculateCost(testPoints, currentParams)
console.log(
  `After 100 steps: slope=${currentParams.slope.toFixed(4)}, intercept=${currentParams.intercept.toFixed(4)}, cost=${finalCost.toFixed(4)}\n`
)

// Test 6: Closed-form solution
console.log('Test 6: Closed-form solution (analytical)')
const closedForm = closedFormSolution(testPoints)
const closedFormCost = calculateCost(testPoints, closedForm)
console.log(
  `Closed-form: slope=${closedForm.slope.toFixed(4)}, intercept=${closedForm.intercept.toFixed(4)}`
)
console.log(`Cost: ${closedFormCost.toFixed(4)}`)
console.log(`(Should be very close to true params: slope=2, intercept=1)\n`)

// Test 7: Random data
console.log('Test 7: Test with random noisy data')
const randomPoints: Point2D[] = []
const trueSlope = 2
const trueIntercept = 1
for (let i = 0; i < 20; i++) {
  const x = Math.random() * 20 - 10
  const noise = (Math.random() - 0.5) * 5
  const y = trueSlope * x + trueIntercept + noise
  randomPoints.push({ x, y })
}

const randomClosedForm = closedFormSolution(randomPoints)
console.log(`True params: slope=${trueSlope}, intercept=${trueIntercept}`)
console.log(
  `Estimated (closed-form): slope=${randomClosedForm.slope.toFixed(4)}, intercept=${randomClosedForm.intercept.toFixed(4)}`
)

let randomParams = { slope: 0, intercept: 0 }
for (let i = 0; i < 1000; i++) {
  randomParams = gradientDescentStep(randomPoints, randomParams, 0.01)
}
console.log(
  `Estimated (gradient descent): slope=${randomParams.slope.toFixed(4)}, intercept=${randomParams.intercept.toFixed(4)}`
)

console.log('\n=== All tests completed ===')
console.log('If values look reasonable, the algorithm is working correctly!')
