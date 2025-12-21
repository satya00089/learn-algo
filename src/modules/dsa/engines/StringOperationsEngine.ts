export interface HistoryStep {
  iteration: number
  description: string
  timestamp: number
}

export type StringOperation =
  | 'REVERSE'
  | 'PALINDROME'
  | 'ANAGRAM'
  | 'SUBSTRING_SEARCH'
  | 'CHAR_FREQUENCY'
  | 'REMOVE_DUPLICATES'

export type StringPhase = 'idle' | 'processing' | 'comparing' | 'result' | 'complete'

export interface StringChar {
  char: string
  index: number
  state: 'default' | 'comparing' | 'matched' | 'processed'
}

export interface StringOperationsState {
  str1: string
  str2: string
  str1Chars: StringChar[]
  str2Chars: StringChar[]
  result: string
  operation: StringOperation | null
  phase: StringPhase
  currentIndex: number
  message: string
  history: HistoryStep[]
  isOperationComplete: boolean
  charFrequency?: Map<string, number>
}

/**
 * String Operations Engine
 * Handles various string manipulation operations
 */
export class StringOperationsEngine {
  private readonly state: StringOperationsState
  private iterationCount: number

  constructor() {
    this.state = {
      str1: '',
      str2: '',
      str1Chars: [],
      str2Chars: [],
      result: '',
      operation: null,
      phase: 'idle',
      currentIndex: 0,
      message: 'Ready',
      history: [],
      isOperationComplete: true,
    }
    this.iterationCount = 0
  }

  private stringToChars(str: string): StringChar[] {
    return str.split('').map((char, index) => ({
      char,
      index,
      state: 'default' as const,
    }))
  }

  private addHistory(description: string): void {
    this.iterationCount++
    this.state.history.push({
      iteration: this.iterationCount,
      description,
      timestamp: Date.now(),
    })
  }

  // Reverse String
  startReverse(str: string): void {
    this.state.str1 = str
    this.state.str1Chars = this.stringToChars(str)
    this.state.result = ''
    this.state.operation = 'REVERSE'
    this.state.phase = 'processing'
    this.state.currentIndex = str.length - 1
    this.state.message = `Reversing string: "${str}"`
    this.state.isOperationComplete = false
    this.addHistory(`REVERSE: "${str}"`)
  }

  // Check Palindrome
  startPalindrome(str: string): void {
    this.state.str1 = str
    this.state.str1Chars = this.stringToChars(str)
    this.state.result = ''
    this.state.operation = 'PALINDROME'
    this.state.phase = 'processing'
    this.state.currentIndex = 0
    this.state.message = `Checking if "${str}" is palindrome`
    this.state.isOperationComplete = false
    this.addHistory(`PALINDROME CHECK: "${str}"`)
  }

  // Check Anagram
  startAnagram(str1: string, str2: string): void {
    this.state.str1 = str1
    this.state.str2 = str2
    this.state.str1Chars = this.stringToChars(str1)
    this.state.str2Chars = this.stringToChars(str2)
    this.state.result = ''
    this.state.operation = 'ANAGRAM'
    this.state.phase = 'processing'
    this.state.currentIndex = 0
    this.state.message = `Checking if "${str1}" and "${str2}" are anagrams`
    this.state.isOperationComplete = false
    this.addHistory(`ANAGRAM CHECK: "${str1}" vs "${str2}"`)
  }

  // Substring Search
  startSubstringSearch(text: string, pattern: string): void {
    this.state.str1 = text
    this.state.str2 = pattern
    this.state.str1Chars = this.stringToChars(text)
    this.state.str2Chars = this.stringToChars(pattern)
    this.state.result = ''
    this.state.operation = 'SUBSTRING_SEARCH'
    this.state.phase = 'processing'
    this.state.currentIndex = 0
    this.state.message = `Searching for "${pattern}" in "${text}"`
    this.state.isOperationComplete = false
    this.addHistory(`SUBSTRING SEARCH: Find "${pattern}" in "${text}"`)
  }

  // Character Frequency
  startCharFrequency(str: string): void {
    this.state.str1 = str
    this.state.str1Chars = this.stringToChars(str)
    this.state.result = ''
    this.state.charFrequency = new Map()
    this.state.operation = 'CHAR_FREQUENCY'
    this.state.phase = 'processing'
    this.state.currentIndex = 0
    this.state.message = `Counting character frequency in "${str}"`
    this.state.isOperationComplete = false
    this.addHistory(`CHAR FREQUENCY: "${str}"`)
  }

  // Remove Duplicates
  startRemoveDuplicates(str: string): void {
    this.state.str1 = str
    this.state.str1Chars = this.stringToChars(str)
    this.state.result = ''
    this.state.operation = 'REMOVE_DUPLICATES'
    this.state.phase = 'processing'
    this.state.currentIndex = 0
    this.state.message = `Removing duplicates from "${str}"`
    this.state.isOperationComplete = false
    this.addHistory(`REMOVE DUPLICATES: "${str}"`)
  }

  step(): void {
    if (this.state.isOperationComplete) return

    switch (this.state.operation) {
      case 'REVERSE':
        this.stepReverse()
        break
      case 'PALINDROME':
        this.stepPalindrome()
        break
      case 'ANAGRAM':
        this.stepAnagram()
        break
      case 'SUBSTRING_SEARCH':
        this.stepSubstringSearch()
        break
      case 'CHAR_FREQUENCY':
        this.stepCharFrequency()
        break
      case 'REMOVE_DUPLICATES':
        this.stepRemoveDuplicates()
        break
    }
  }

  private stepReverse(): void {
    const { currentIndex, str1 } = this.state

    if (currentIndex >= 0) {
      this.state.str1Chars[currentIndex].state = 'processed'
      this.state.result += str1[currentIndex]
      this.addHistory(`Add '${str1[currentIndex]}' to result: "${this.state.result}"`)
      this.state.currentIndex--
    } else {
      this.state.phase = 'result'
      this.state.message = `Reversed: "${this.state.result}"`
      this.state.isOperationComplete = true
      this.addHistory(`Final result: "${this.state.result}"`)
    }
  }

  private stepPalindrome(): void {
    const { currentIndex, str1 } = this.state
    const endIndex = str1.length - 1 - currentIndex

    if (currentIndex >= endIndex) {
      this.state.phase = 'result'
      this.state.result = 'YES'
      this.state.message = `"${str1}" is a palindrome!`
      this.state.isOperationComplete = true
      this.addHistory(`Result: Palindrome`)
      return
    }

    this.state.str1Chars[currentIndex].state = 'comparing'
    this.state.str1Chars[endIndex].state = 'comparing'

    if (str1[currentIndex].toLowerCase() !== str1[endIndex].toLowerCase()) {
      this.state.phase = 'result'
      this.state.result = 'NO'
      this.state.message = `"${str1}" is NOT a palindrome`
      this.state.isOperationComplete = true
      this.addHistory(`Mismatch at ${currentIndex} and ${endIndex}: NOT palindrome`)
      return
    }

    this.addHistory(`Match: '${str1[currentIndex]}' == '${str1[endIndex]}'`)
    this.state.str1Chars[currentIndex].state = 'matched'
    this.state.str1Chars[endIndex].state = 'matched'
    this.state.currentIndex++
  }

  private stepAnagram(): void {
    const { str1, str2, phase } = this.state

    if (phase === 'processing') {
      if (str1.length !== str2.length) {
        this.state.phase = 'result'
        this.state.result = 'NO'
        this.state.message = 'Different lengths - NOT anagrams'
        this.state.isOperationComplete = true
        this.addHistory('Different lengths: NOT anagrams')
        return
      }

      const sorted1 = str1.toLowerCase().split('').sort().join('')
      const sorted2 = str2.toLowerCase().split('').sort().join('')

      this.state.phase = 'result'
      this.state.result = sorted1 === sorted2 ? 'YES' : 'NO'
      this.state.message = sorted1 === sorted2 ? 'Are anagrams!' : 'NOT anagrams'
      this.state.isOperationComplete = true
      this.addHistory(`Sorted: "${sorted1}" vs "${sorted2}" - Result: ${this.state.result}`)
    }
  }

  private stepSubstringSearch(): void {
    const { str1, str2, currentIndex } = this.state

    if (currentIndex > str1.length - str2.length) {
      this.state.phase = 'result'
      this.state.result = 'NOT FOUND'
      this.state.message = `Pattern "${str2}" not found`
      this.state.isOperationComplete = true
      this.addHistory('Pattern not found')
      return
    }

    const substring = str1.substring(currentIndex, currentIndex + str2.length)
    this.state.str1Chars.forEach((char, idx) => {
      if (idx >= currentIndex && idx < currentIndex + str2.length) {
        char.state = 'comparing'
      } else {
        char.state = 'default'
      }
    })

    if (substring === str2) {
      this.state.phase = 'result'
      this.state.result = `FOUND at index ${currentIndex}`
      this.state.message = `Pattern found at index ${currentIndex}`
      this.state.isOperationComplete = true
      this.state.str1Chars.forEach((char, idx) => {
        if (idx >= currentIndex && idx < currentIndex + str2.length) {
          char.state = 'matched'
        }
      })
      this.addHistory(`Pattern found at index ${currentIndex}`)
      return
    }

    this.addHistory(`Checking at index ${currentIndex}: "${substring}" ≠ "${str2}"`)
    this.state.currentIndex++
  }

  private stepCharFrequency(): void {
    const { str1, currentIndex } = this.state

    if (currentIndex < str1.length) {
      const char = str1[currentIndex]
      const freq = (this.state.charFrequency?.get(char) || 0) + 1
      this.state.charFrequency?.set(char, freq)
      this.state.str1Chars[currentIndex].state = 'processed'
      this.addHistory(`'${char}' count: ${freq}`)
      this.state.currentIndex++
    } else {
      this.state.phase = 'result'
      const freqStr = Array.from(this.state.charFrequency?.entries() || [])
        .map(([char, count]) => `${char}:${count}`)
        .join(', ')
      this.state.result = freqStr
      this.state.message = `Frequency: ${freqStr}`
      this.state.isOperationComplete = true
      this.addHistory(`Final frequencies: ${freqStr}`)
    }
  }

  private stepRemoveDuplicates(): void {
    const { str1, currentIndex } = this.state

    if (currentIndex < str1.length) {
      const char = str1[currentIndex]
      if (!this.state.result.includes(char)) {
        this.state.result += char
        this.state.str1Chars[currentIndex].state = 'matched'
        this.addHistory(`Add '${char}' - not duplicate`)
      } else {
        this.state.str1Chars[currentIndex].state = 'comparing'
        this.addHistory(`Skip '${char}' - duplicate`)
      }
      this.state.currentIndex++
    } else {
      this.state.phase = 'result'
      this.state.message = `Result: "${this.state.result}"`
      this.state.isOperationComplete = true
      this.addHistory(`Final: "${this.state.result}"`)
    }
  }

  run(): void {
    while (!this.state.isOperationComplete) {
      this.step()
    }
  }

  reset(): void {
    this.state.phase = 'idle'
    this.state.currentIndex = 0
    this.state.result = ''
    this.state.message = 'Reset'
    this.state.isOperationComplete = true
  }

  getState(): StringOperationsState {
    return { ...this.state, charFrequency: new Map(this.state.charFrequency) }
  }
}
