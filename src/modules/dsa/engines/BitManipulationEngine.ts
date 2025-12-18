export interface HistoryStep {
  iteration: number
  description: string
  timestamp: number
}

export type BitOperation =
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'NOT'
  | 'LEFT_SHIFT'
  | 'RIGHT_SHIFT'
  | 'SET_BIT'
  | 'CLEAR_BIT'
  | 'TOGGLE_BIT'
  | 'CHECK_BIT'
  | 'COUNT_SET_BITS'
  | 'IS_POWER_OF_TWO'
  | 'FIND_ODD_OCCURRING'

export type BitPhase =
  | 'idle'
  | 'displaying'
  | 'operating'
  | 'comparing'
  | 'result'
  | 'complete'

export interface BitManipulationState {
  num1: number
  num2: number
  result: number
  num1Binary: string
  num2Binary: string
  resultBinary: string
  operation: BitOperation | null
  phase: BitPhase
  currentBitIndex: number
  message: string
  history: HistoryStep[]
  isOperationComplete: boolean
  bitPosition?: number
}

/**
 * Bit Manipulation Engine
 * Handles various bitwise operations with step-by-step visualization
 */
export class BitManipulationEngine {
  private state: BitManipulationState
  private iterationCount: number

  constructor() {
    this.state = {
      num1: 0,
      num2: 0,
      result: 0,
      num1Binary: '00000000',
      num2Binary: '00000000',
      resultBinary: '00000000',
      operation: null,
      phase: 'idle',
      currentBitIndex: -1,
      message: 'Ready',
      history: [],
      isOperationComplete: true,
    }
    this.iterationCount = 0
  }

  private toBinary(num: number, bits: number = 8): string {
    return (num >>> 0).toString(2).padStart(bits, '0').slice(-bits)
  }

  private addHistory(description: string): void {
    this.iterationCount++
    this.state.history.push({
      iteration: this.iterationCount,
      description,
      timestamp: Date.now(),
    })
  }

  // Bitwise AND
  startAND(num1: number, num2: number): void {
    this.state.num1 = num1
    this.state.num2 = num2
    this.state.num1Binary = this.toBinary(num1)
    this.state.num2Binary = this.toBinary(num2)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'AND'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7
    this.state.message = `Starting AND operation: ${num1} & ${num2}`
    this.state.isOperationComplete = false
    this.addHistory(`AND: ${num1} (${this.state.num1Binary}) & ${num2} (${this.state.num2Binary})`)
  }

  // Bitwise OR
  startOR(num1: number, num2: number): void {
    this.state.num1 = num1
    this.state.num2 = num2
    this.state.num1Binary = this.toBinary(num1)
    this.state.num2Binary = this.toBinary(num2)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'OR'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7
    this.state.message = `Starting OR operation: ${num1} | ${num2}`
    this.state.isOperationComplete = false
    this.addHistory(`OR: ${num1} (${this.state.num1Binary}) | ${num2} (${this.state.num2Binary})`)
  }

  // Bitwise XOR
  startXOR(num1: number, num2: number): void {
    this.state.num1 = num1
    this.state.num2 = num2
    this.state.num1Binary = this.toBinary(num1)
    this.state.num2Binary = this.toBinary(num2)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'XOR'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7
    this.state.message = `Starting XOR operation: ${num1} ^ ${num2}`
    this.state.isOperationComplete = false
    this.addHistory(`XOR: ${num1} (${this.state.num1Binary}) ^ ${num2} (${this.state.num2Binary})`)
  }

  // Bitwise NOT
  startNOT(num: number): void {
    this.state.num1 = num
    this.state.num1Binary = this.toBinary(num)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'NOT'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7
    this.state.message = `Starting NOT operation: ~${num}`
    this.state.isOperationComplete = false
    this.addHistory(`NOT: ~${num} (${this.state.num1Binary})`)
  }

  // Left Shift
  startLeftShift(num: number, positions: number): void {
    this.state.num1 = num
    this.state.num2 = positions
    this.state.num1Binary = this.toBinary(num)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'LEFT_SHIFT'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 0
    this.state.message = `Starting Left Shift: ${num} << ${positions}`
    this.state.isOperationComplete = false
    this.addHistory(`LEFT SHIFT: ${num} (${this.state.num1Binary}) << ${positions}`)
  }

  // Right Shift
  startRightShift(num: number, positions: number): void {
    this.state.num1 = num
    this.state.num2 = positions
    this.state.num1Binary = this.toBinary(num)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'RIGHT_SHIFT'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7
    this.state.message = `Starting Right Shift: ${num} >> ${positions}`
    this.state.isOperationComplete = false
    this.addHistory(`RIGHT SHIFT: ${num} (${this.state.num1Binary}) >> ${positions}`)
  }

  // Set Bit
  startSetBit(num: number, position: number): void {
    this.state.num1 = num
    this.state.bitPosition = position
    this.state.num1Binary = this.toBinary(num)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'SET_BIT'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7 - position
    this.state.message = `Setting bit at position ${position}`
    this.state.isOperationComplete = false
    this.addHistory(`SET BIT: Set bit ${position} of ${num} (${this.state.num1Binary})`)
  }

  // Clear Bit
  startClearBit(num: number, position: number): void {
    this.state.num1 = num
    this.state.bitPosition = position
    this.state.num1Binary = this.toBinary(num)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'CLEAR_BIT'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7 - position
    this.state.message = `Clearing bit at position ${position}`
    this.state.isOperationComplete = false
    this.addHistory(`CLEAR BIT: Clear bit ${position} of ${num} (${this.state.num1Binary})`)
  }

  // Toggle Bit
  startToggleBit(num: number, position: number): void {
    this.state.num1 = num
    this.state.bitPosition = position
    this.state.num1Binary = this.toBinary(num)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'TOGGLE_BIT'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7 - position
    this.state.message = `Toggling bit at position ${position}`
    this.state.isOperationComplete = false
    this.addHistory(`TOGGLE BIT: Toggle bit ${position} of ${num} (${this.state.num1Binary})`)
  }

  // Check Bit
  startCheckBit(num: number, position: number): void {
    this.state.num1 = num
    this.state.bitPosition = position
    this.state.num1Binary = this.toBinary(num)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'CHECK_BIT'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7 - position
    this.state.message = `Checking bit at position ${position}`
    this.state.isOperationComplete = false
    this.addHistory(`CHECK BIT: Check bit ${position} of ${num} (${this.state.num1Binary})`)
  }

  // Count Set Bits
  startCountSetBits(num: number): void {
    this.state.num1 = num
    this.state.num1Binary = this.toBinary(num)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'COUNT_SET_BITS'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = 7
    this.state.message = `Counting set bits (1s) in ${num}`
    this.state.isOperationComplete = false
    this.addHistory(`COUNT SET BITS: Count 1s in ${num} (${this.state.num1Binary})`)
  }

  // Check if Power of Two
  startIsPowerOfTwo(num: number): void {
    this.state.num1 = num
    this.state.num1Binary = this.toBinary(num)
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.operation = 'IS_POWER_OF_TWO'
    this.state.phase = 'displaying'
    this.state.currentBitIndex = -1
    this.state.message = `Checking if ${num} is power of 2`
    this.state.isOperationComplete = false
    this.addHistory(`IS POWER OF 2: Check ${num} (${this.state.num1Binary})`)
  }

  step(): void {
    if (this.state.isOperationComplete) return

    switch (this.state.operation) {
      case 'AND':
      case 'OR':
      case 'XOR':
        this.stepBitwiseOperation()
        break
      case 'NOT':
        this.stepNOT()
        break
      case 'LEFT_SHIFT':
        this.stepLeftShift()
        break
      case 'RIGHT_SHIFT':
        this.stepRightShift()
        break
      case 'SET_BIT':
        this.stepSetBit()
        break
      case 'CLEAR_BIT':
        this.stepClearBit()
        break
      case 'TOGGLE_BIT':
        this.stepToggleBit()
        break
      case 'CHECK_BIT':
        this.stepCheckBit()
        break
      case 'COUNT_SET_BITS':
        this.stepCountSetBits()
        break
      case 'IS_POWER_OF_TWO':
        this.stepIsPowerOfTwo()
        break
    }
  }

  private stepBitwiseOperation(): void {
    const { phase, currentBitIndex, num1, num2, operation } = this.state

    if (phase === 'displaying') {
      this.state.phase = 'operating'
      this.state.message = `Processing bit ${7 - currentBitIndex}`
      return
    }

    if (phase === 'operating') {
      const bit1 = (num1 >> (7 - currentBitIndex)) & 1
      const bit2 = (num2 >> (7 - currentBitIndex)) & 1
      let resultBit = 0

      if (operation === 'AND') {
        resultBit = bit1 & bit2
      } else if (operation === 'OR') {
        resultBit = bit1 | bit2
      } else if (operation === 'XOR') {
        resultBit = bit1 ^ bit2
      }

      const resultArray = this.state.resultBinary.split('')
      resultArray[currentBitIndex] = resultBit.toString()
      this.state.resultBinary = resultArray.join('')

      this.addHistory(
        `Bit ${7 - currentBitIndex}: ${bit1} ${operation} ${bit2} = ${resultBit}`
      )

      if (currentBitIndex === 0) {
        this.state.result = Number.parseInt(this.state.resultBinary, 2)
        this.state.phase = 'result'
        this.state.message = `Result: ${this.state.result} (${this.state.resultBinary})`
        this.addHistory(`Final result: ${this.state.result}`)
      } else {
        this.state.currentBitIndex--
        this.state.phase = 'displaying'
      }
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepNOT(): void {
    const { phase, currentBitIndex, num1 } = this.state

    if (phase === 'displaying') {
      this.state.phase = 'operating'
      this.state.message = `Inverting bit ${7 - currentBitIndex}`
      return
    }

    if (phase === 'operating') {
      const bit = (num1 >> (7 - currentBitIndex)) & 1
      const resultBit = bit === 1 ? 0 : 1

      const resultArray = this.state.resultBinary.split('')
      resultArray[currentBitIndex] = resultBit.toString()
      this.state.resultBinary = resultArray.join('')

      this.addHistory(`Bit ${7 - currentBitIndex}: ~${bit} = ${resultBit}`)

      if (currentBitIndex === 0) {
        this.state.result = Number.parseInt(this.state.resultBinary, 2)
        this.state.phase = 'result'
        this.state.message = `Result: ${this.state.result} (${this.state.resultBinary})`
        this.addHistory(`Final result: ${this.state.result}`)
      } else {
        this.state.currentBitIndex--
        this.state.phase = 'displaying'
      }
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepLeftShift(): void {
    const { phase, num1, num2 } = this.state

    if (phase === 'displaying') {
      this.state.result = num1 << num2
      this.state.resultBinary = this.toBinary(this.state.result)
      this.state.phase = 'result'
      this.state.message = `Shifted left by ${num2} positions: ${this.state.result}`
      this.addHistory(`Result: ${num1} << ${num2} = ${this.state.result} (${this.state.resultBinary})`)
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepRightShift(): void {
    const { phase, num1, num2 } = this.state

    if (phase === 'displaying') {
      this.state.result = num1 >> num2
      this.state.resultBinary = this.toBinary(this.state.result)
      this.state.phase = 'result'
      this.state.message = `Shifted right by ${num2} positions: ${this.state.result}`
      this.addHistory(`Result: ${num1} >> ${num2} = ${this.state.result} (${this.state.resultBinary})`)
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepSetBit(): void {
    const { phase, num1, bitPosition } = this.state

    if (phase === 'displaying') {
      this.state.result = num1 | (1 << (bitPosition || 0))
      this.state.resultBinary = this.toBinary(this.state.result)
      this.state.phase = 'result'
      this.state.message = `Bit ${bitPosition} set to 1: ${this.state.result}`
      this.addHistory(`Result: ${this.state.result} (${this.state.resultBinary})`)
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepClearBit(): void {
    const { phase, num1, bitPosition } = this.state

    if (phase === 'displaying') {
      this.state.result = num1 & ~(1 << (bitPosition || 0))
      this.state.resultBinary = this.toBinary(this.state.result)
      this.state.phase = 'result'
      this.state.message = `Bit ${bitPosition} cleared to 0: ${this.state.result}`
      this.addHistory(`Result: ${this.state.result} (${this.state.resultBinary})`)
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepToggleBit(): void {
    const { phase, num1, bitPosition } = this.state

    if (phase === 'displaying') {
      this.state.result = num1 ^ (1 << (bitPosition || 0))
      this.state.resultBinary = this.toBinary(this.state.result)
      this.state.phase = 'result'
      this.state.message = `Bit ${bitPosition} toggled: ${this.state.result}`
      this.addHistory(`Result: ${this.state.result} (${this.state.resultBinary})`)
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepCheckBit(): void {
    const { phase, num1, bitPosition } = this.state

    if (phase === 'displaying') {
      this.state.result = (num1 >> (bitPosition || 0)) & 1
      this.state.phase = 'result'
      this.state.message = `Bit ${bitPosition} is ${this.state.result}`
      this.addHistory(`Bit ${bitPosition} = ${this.state.result}`)
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepCountSetBits(): void {
    const { phase, currentBitIndex, num1 } = this.state

    if (phase === 'displaying') {
      this.state.phase = 'operating'
      return
    }

    if (phase === 'operating') {
      const bit = (num1 >> (7 - currentBitIndex)) & 1
      if (bit === 1) {
        this.state.result++
        this.addHistory(`Bit ${7 - currentBitIndex} is 1, count = ${this.state.result}`)
      }

      if (currentBitIndex === 0) {
        this.state.phase = 'result'
        this.state.message = `Total set bits: ${this.state.result}`
        this.addHistory(`Final count: ${this.state.result}`)
      } else {
        this.state.currentBitIndex--
      }
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  private stepIsPowerOfTwo(): void {
    const { phase, num1 } = this.state

    if (phase === 'displaying') {
      // A number is power of 2 if num & (num-1) == 0
      const isPower = num1 > 0 && (num1 & (num1 - 1)) === 0
      this.state.result = isPower ? 1 : 0
      this.state.phase = 'result'
      this.state.message = `${num1} is ${isPower ? '' : 'NOT '}a power of 2`
      this.addHistory(
        `${num1} & ${num1 - 1} = ${num1 & (num1 - 1)}, Result: ${isPower ? 'Yes' : 'No'}`
      )
      return
    }

    if (phase === 'result') {
      this.state.phase = 'complete'
      this.state.isOperationComplete = true
    }
  }

  run(): void {
    while (!this.state.isOperationComplete) {
      this.step()
    }
  }

  reset(): void {
    this.state.phase = 'idle'
    this.state.currentBitIndex = -1
    this.state.result = 0
    this.state.resultBinary = '00000000'
    this.state.message = 'Reset'
    this.state.isOperationComplete = true
  }

  getState(): BitManipulationState {
    return { ...this.state }
  }
}
