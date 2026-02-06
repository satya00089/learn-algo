# String Operations: Text Processing and Manipulation

## What are Strings?

Strings are **sequences of characters** used to represent text. In most programming languages, strings are immutable sequences that support various operations for text processing, searching, and manipulation.

**Key Characteristics:**
- **Immutable** - cannot modify in-place (usually)
- **Sequential access** - characters accessed by index
- **Variable length** - can grow/shrink as needed
- **Character encoding** - Unicode, ASCII, UTF-8, etc.

## Basic String Operations

### Creation and Access

```typescript
// String creation
const str1 = "Hello World"
const str2 = 'Hello World'
const str3 = `Hello ${name}`  // Template literals

// Character access
const firstChar = str1[0]        // 'H'
const lastChar = str1[str1.length - 1]  // 'd'

// Substring extraction
const substring = str1.substring(0, 5)  // "Hello"
const slice = str1.slice(6, 11)         // "World"
```

### String Comparison

```typescript
const str1 = "apple"
const str2 = "Apple"
const str3 = "banana"

console.log(str1 === str2)        // false (case sensitive)
console.log(str1 < str3)          // true (lexicographical)
console.log(str1.localeCompare(str2, undefined, { sensitivity: 'base' }))  // 0 (case insensitive)
```

## Advanced String Operations

### Searching and Finding

#### Index-based Search
```typescript
const text = "The quick brown fox jumps over the lazy dog"

console.log(text.indexOf("fox"))        // 16
console.log(text.lastIndexOf("the"))    // 31
console.log(text.includes("quick"))     // true
console.log(text.startsWith("The"))     // true
console.log(text.endsWith("dog"))       // true
```

#### Regular Expression Search
```typescript
const text = "The year is 2024 and the time is 14:30"

// Find all numbers
const numbers = text.match(/\d+/g)  // ["2024", "14", "30"]

// Replace patterns
const formatted = text.replace(/(\d{4})/, "Year $1")  // "The year is Year 2024 and the time is 14:30"

// Test patterns
const hasTime = /\d{2}:\d{2}/.test(text)  // true
```

### Modification Operations

#### Case Conversion
```typescript
const text = "Hello World"

console.log(text.toLowerCase())  // "hello world"
console.log(text.toUpperCase())  // "HELLO WORLD"
```

#### Trimming and Padding
```typescript
const padded = "  hello  "

console.log(padded.trim())        // "hello"
console.log(padded.trimStart())   // "hello  "
console.log(padded.trimEnd())     // "  hello"

console.log("5".padStart(3, "0"))  // "005"
console.log("5".padEnd(3, "0"))    // "500"
```

#### Splitting and Joining
```typescript
const csv = "apple,banana,cherry,grape"

const fruits = csv.split(",")           // ["apple", "banana", "cherry", "grape"]
const joined = fruits.join(" | ")       // "apple | banana | cherry | grape"

const multiline = "line1\nline2\nline3"
const lines = multiline.split("\n")     // ["line1", "line2", "line3"]
```

## String Algorithms

### Pattern Matching

#### Naive String Search
```typescript
function naiveSearch(text: string, pattern: string): number[] {
    const positions: number[] = []

    for (let i = 0; i <= text.length - pattern.length; i++) {
        let found = true
        for (let j = 0; j < pattern.length; j++) {
            if (text[i + j] !== pattern[j]) {
                found = false
                break
            }
        }
        if (found) positions.push(i)
    }

    return positions
}
```

#### KMP Algorithm (Knuth-Morris-Pratt)
More efficient pattern matching with preprocessing.

### String Comparison Algorithms

#### Levenshtein Distance (Edit Distance)
Minimum operations to transform one string into another.

```typescript
function levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
        for (let i = 1; i <= str1.length; i++) {
            const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,      // deletion
                matrix[j - 1][i] + 1,      // insertion
                matrix[j - 1][i - 1] + indicator  // substitution
            )
        }
    }

    return matrix[str2.length][str1.length]
}
```

### Palindrome Checking

#### Simple Approach
```typescript
function isPalindrome(str: string): boolean {
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '')
    return clean === clean.split('').reverse().join('')
}
```

#### Two-Pointer Approach
```typescript
function isPalindromeTwoPointer(str: string): boolean {
    const clean = str.toLowerCase().replace(/[^a-z0-9]/g, '')
    let left = 0, right = clean.length - 1

    while (left < right) {
        if (clean[left] !== clean[right]) return false
        left++
        right--
    }

    return true
}
```

### Anagram Detection

```typescript
function isAnagram(str1: string, str2: string): boolean {
    if (str1.length !== str2.length) return false

    const count = new Map<string, number>()

    for (const char of str1) {
        count.set(char, (count.get(char) || 0) + 1)
    }

    for (const char of str2) {
        const current = count.get(char) || 0
        if (current === 0) return false
        count.set(char, current - 1)
    }

    return true
}
```

## String Encoding and Unicode

### Character Encoding
- **ASCII**: 7-bit, 128 characters
- **UTF-8**: Variable length, backward compatible with ASCII
- **UTF-16**: 16-bit or 32-bit encoding
- **UTF-32**: Fixed 32-bit encoding

### Unicode Handling
```typescript
const emoji = "🚀"
console.log(emoji.length)           // 2 (surrogate pair)
console.log([...emoji].length)      // 1 (correct count)
console.log(emoji.codePointAt(0))   // 128640

// Iterate properly
for (const char of emoji) {
    console.log(char.codePointAt(0))
}
```

## Performance Considerations

### String Concatenation
```typescript
// Inefficient (creates new string each time)
let result = ""
for (let i = 0; i < 1000; i++) {
    result += i.toString()  // O(n²) time
}

// Efficient (use array)
const parts: string[] = []
for (let i = 0; i < 1000; i++) {
    parts.push(i.toString())
}
const result = parts.join("")  // O(n) time
```

### String Immutability
- **JavaScript**: Strings are immutable
- **Operations create new strings**
- **Use arrays for frequent modifications**

### Memory Usage
- **UTF-16 encoding** in JavaScript (2 bytes per character)
- **String interning** for duplicate strings
- **Substring sharing** in some implementations

## Real-World Applications

### Text Processing
- **Search engines** - indexing and searching text
- **Spell checkers** - finding similar words
- **Auto-completion** - prefix matching

### Data Validation
- **Email validation** - regex pattern matching
- **Phone number formatting** - string manipulation
- **Password strength** - complexity checking

### Natural Language Processing
- **Tokenization** - splitting text into words
- **Stemming** - reducing words to root form
- **Sentiment analysis** - text classification

### File Processing
- **CSV parsing** - splitting and processing data
- **Log analysis** - extracting information from logs
- **Configuration files** - parsing key-value pairs

### Web Development
- **URL manipulation** - parsing and building URLs
- **HTML parsing** - extracting data from markup
- **JSON processing** - stringifying and parsing

## Common String Problems

### Longest Common Substring
Find longest string present in both strings.

### String Compression
Compress repeated characters: "aaabbb" → "a3b3"

### Word Break Problem
Check if string can be segmented into dictionary words.

### Rabin-Karp Algorithm
Efficient string matching using hashing.

## String Libraries and Tools

### Built-in Methods
- **JavaScript**: Rich string API
- **Python**: Powerful string methods
- **Java**: String and StringBuilder classes

### Regular Expression Engines
- **PCRE** (Perl Compatible Regular Expressions)
- **RE2** (Google's regex engine)
- **Oniguruma** (Ruby's regex engine)

### Text Processing Libraries
- **Natural**: Natural language processing
- **String.js**: Extended string operations
- **lodash/string**: Utility functions

## When to Use String Operations

✅ **Use when:**
- Text processing needed
- Data validation required
- Search/replace operations
- Parsing structured text
- Natural language processing

❌ **Avoid when:**
- Binary data processing
- Large-scale numerical computations
- Memory-critical applications
- High-performance requirements

## 💡 Pro Tips

- **Use template literals** for string interpolation
- **Cache regex patterns** to avoid recompilation
- **Consider encoding** when working with international text
- **Use appropriate methods** - substring vs slice vs substr
- **Profile performance** - string operations can be expensive
- **Handle edge cases** - empty strings, null values, special characters

---

*Strings are fundamental to programming, appearing in everything from user interfaces to data processing pipelines.*