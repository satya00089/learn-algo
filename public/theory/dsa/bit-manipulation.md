# Bit Manipulation: Efficient Low-Level Operations

## What is Bit Manipulation?

Bit manipulation involves **operating on individual bits** within binary representations of numbers. These operations are **extremely fast** since they work directly with hardware and can solve complex problems with simple bitwise operations.

**Key Concepts:**

- **Bits**: 0s and 1s in binary representation
- **Bitwise operators**: AND, OR, XOR, NOT, shifts
- **Bit masks**: Patterns for manipulating specific bits
- **Two's complement**: How negative numbers are represented

## Bitwise Operators

### Basic Operators

#### AND (&)

- **Truth table**: 1 & 1 = 1, 1 & 0 = 0, 0 & 0 = 0
- **Uses**: Clear bits, check if bits are set
- **Example**: `5 & 3 = 1` (0101 & 0011 = 0001)

#### OR (|)

- **Truth table**: 1 | 1 = 1, 1 | 0 = 1, 0 | 0 = 0
- **Uses**: Set bits, combine flags
- **Example**: `5 | 3 = 7` (0101 | 0011 = 0111)

#### XOR (^)

- **Truth table**: 1 ^ 1 = 0, 1 ^ 0 = 1, 0 ^ 0 = 0
- **Uses**: Toggle bits, swap values, find differences
- **Example**: `5 ^ 3 = 6` (0101 ^ 0011 = 0110)

#### NOT (~)

- **Flips all bits**
- **Uses**: Bit inversion, two's complement
- **Example**: `~5 = -6` (in two's complement)

### Shift Operators

#### Left Shift (<<)

- **Moves bits left, fills with zeros**
- **Equivalent to multiplication by 2^n**
- **Example**: `5 << 1 = 10` (0101 << 1 = 1010)

#### Right Shift (>>)

- **Moves bits right, arithmetic shift**
- **Equivalent to division by 2^n**
- **Example**: `5 >> 1 = 2` (0101 >> 1 = 0010)

#### Unsigned Right Shift (>>>)

- **Moves bits right, fills with zeros**
- **For non-negative numbers only**

## Common Bit Manipulation Techniques

### Check if Bit is Set

```typescript
function isBitSet(num: number, position: number): boolean {
  return (num & (1 << position)) !== 0
}
```

### Set a Bit

```typescript
function setBit(num: number, position: number): number {
  return num | (1 << position)
}
```

### Clear a Bit

```typescript
function clearBit(num: number, position: number): number {
  return num & ~(1 << position)
}
```

### Toggle a Bit

```typescript
function toggleBit(num: number, position: number): number {
  return num ^ (1 << position)
}
```

### Count Set Bits (Hamming Weight)

```typescript
function countBits(num: number): number {
  let count = 0
  while (num) {
    count += num & 1
    num >>= 1
  }
  return count
}

// More efficient version
function countBitsFast(num: number): number {
  let count = 0
  while (num) {
    num &= num - 1 // Clear least significant set bit
    count++
  }
  return count
}
```

## Advanced Bit Manipulation Problems

### Find Single Number

Given array where every element appears twice except one, find the single one.

```typescript
function singleNumber(nums: number[]): number {
  let result = 0
  for (const num of nums) {
    result ^= num // XOR cancels out pairs
  }
  return result
}
```

### Power of Two Check

Check if a number is a power of 2.

```typescript
function isPowerOfTwo(num: number): boolean {
  return num > 0 && (num & (num - 1)) === 0
}
```

### Swap Two Numbers Without Temp Variable

```typescript
function swap(a: number, b: number): [number, number] {
  a = a ^ b
  b = a ^ b // b = (a ^ b) ^ b = a
  a = a ^ b // a = (a ^ b) ^ a = b
  return [a, b]
}
```

### Find Missing Number

Find missing number in array containing 1 to n.

```typescript
function findMissingNumber(nums: number[]): number {
  const n = nums.length + 1
  let xor = 0

  // XOR all numbers from 1 to n
  for (let i = 1; i <= n; i++) {
    xor ^= i
  }

  // XOR with all array elements
  for (const num of nums) {
    xor ^= num
  }

  return xor
}
```

## Bit Manipulation in Real-World Applications

### Compression Algorithms

- **Huffman coding** uses bit manipulation for compression
- **Run-length encoding** packs repeated values
- **Bitmap compression** in images

### Cryptography

- **XOR cipher** for simple encryption
- **Bit permutation** in block ciphers
- **Hash functions** use bitwise operations

### Graphics Programming

- **Color manipulation** (RGB channels)
- **Alpha blending** with bit masks
- **Pixel operations** in image processing

### Network Programming

- **IP address manipulation**
- **Subnet calculations**
- **Port number operations**

### Embedded Systems

- **Register manipulation** in hardware
- **Interrupt flags** setting/clearing
- **GPIO pin control**

### Database Systems

- **Bitmap indexes** for fast queries
- **Bloom filters** using bit arrays
- **Compression** of integer arrays

## Bitwise Tricks and Optimizations

### Fast Multiplication/Division by Powers of 2

```typescript
// Multiply by 8
const result = num << 3

// Divide by 4
const result = num >> 2
```

### Check if Number is Even/Odd

```typescript
function isEven(num: number): boolean {
  return (num & 1) === 0
}

function isOdd(num: number): boolean {
  return (num & 1) === 1
}
```

### Absolute Value Without Branching

```typescript
function abs(num: number): number {
  const mask = num >> 31 // All 1s if negative, all 0s if positive
  return (num ^ mask) - mask
}
```

### Find Next Power of 2

```typescript
function nextPowerOf2(num: number): number {
  num--
  num |= num >> 1
  num |= num >> 2
  num |= num >> 4
  num |= num >> 8
  num |= num >> 16
  return num + 1
}
```

## Bit Manipulation Libraries and Tools

### Built-in Functions

- **JavaScript**: Limited bitwise operators
- **Java**: Rich BitSet class
- **C++**: std::bitset template
- **Python**: Built-in bitwise operators

### Custom Bit Manipulation Classes

- **BitSet**: Dynamic bit arrays
- **BitVector**: Compact boolean arrays
- **BloomFilter**: Probabilistic set membership

## Performance Considerations

### Speed Advantages

- **Hardware level operations** - faster than arithmetic
- **No branching** - avoids pipeline stalls
- **Parallel operations** - multiple bits processed simultaneously

### Memory Efficiency

- **Bit packing** - store multiple flags in single integer
- **Bitmap indexes** - compact data structures
- **Compressed arrays** - reduce memory footprint

### When Bit Manipulation Excels

- **Embedded systems** - limited resources
- **High-performance computing** - speed critical
- **Memory-constrained applications**
- **Cryptographic operations**

## Common Pitfalls

### Signed vs Unsigned Operations

- **JavaScript**: All numbers are signed 64-bit floats
- **Bit shifts**: Can produce negative numbers unexpectedly
- **Type coercion**: Automatic conversion can cause bugs

### Endianness Issues

- **Big-endian vs little-endian** systems
- **Network byte order** considerations
- **Cross-platform compatibility**

### Integer Overflow

- **32-bit vs 64-bit** operations
- **JavaScript number limits** (53-bit mantissa)
- **Safe bit operations**

## When to Use Bit Manipulation

✅ **Use when:**

- Performance is critical
- Memory usage matters
- Working with flags/permissions
- Implementing compression algorithms
- Hardware-level operations needed

❌ **Avoid when:**

- Code readability is more important
- Operations are complex
- Debugging is difficult
- Language has poor bit support

## 💡 Pro Tips

- **Use constants for bit masks** - improves readability
- **Comment bit operations** - explain what each bit represents
- **Test edge cases** - negative numbers, overflow conditions
- **Consider portability** - different languages handle bits differently
- **Profile performance** - bit operations aren't always faster

---

_Bit manipulation offers incredible power and efficiency, but requires careful understanding of binary arithmetic and hardware behavior._
