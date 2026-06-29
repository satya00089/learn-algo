# Bit Manipulation

## What It Is

Bit manipulation means working directly with the binary representation of numbers.

Instead of thinking only in decimal values like `13` or `42`, you also think about the individual bits that store those values.

Example:

- `13` in binary is `1101`

## Why It Matters

Bit-level operations can be:

- very fast
- memory efficient
- useful in low-level systems, optimization, and interview problems

They are also a great way to understand how computers store and process data.

## Core Operators

| Operator | Meaning | Common Use |
| --- | --- | --- |
| `&` | AND | check whether a bit is set |
| `|` | OR | set a bit |
| `^` | XOR | toggle a bit or cancel matching bits |
| `~` | NOT | flip all bits |
| `<<` | left shift | multiply by powers of two in many cases |
| `>>` | right shift | divide by powers of two in many cases |

## Key Formula or Rule

Most bit tricks start with a mask for bit position `k`:

$$
mask = 1 \ll k
$$

Then the most common operations become:

- check bit: `x & mask`
- set bit: `x | mask`
- toggle bit: `x ^ mask`
- clear bit: `x & ~mask`

The mask isolates one position, and the operator decides what to do with that position.

## Worked Example

Suppose:

- number = `13` -> binary `1101`
- mask = `4` -> binary `0100`

Check whether the third bit is set:

```text
1101
0100
---- AND
0100
```

The result is not zero, so that bit is set.

## Looking Deeper

Bit manipulation becomes much more useful once you understand **masks** and **two's complement**.

- a mask lets you focus on selected bit positions
- two's complement explains how negative integers are stored in most systems

This matters because many bit tricks depend on machine representation, not just arithmetic intuition.

## Common Patterns

### Check if a Bit Is Set

```text
(number & mask) != 0
```

### Set a Bit

```text
number | mask
```

### Clear a Bit

```text
number & ~mask
```

### Toggle a Bit

```text
number ^ mask
```

### Check Odd or Even

```text
number & 1
```

If the last bit is `1`, the number is odd.

### Check Power of Two

A positive power of two has exactly one set bit.

```text
n > 0 and (n & (n - 1)) == 0
```

## Advantages

- Often faster than heavier arithmetic or data-structure operations
- Very compact for flags and state tracking
- Common in systems programming, graphics, and networking

## Limitations

- Harder to read than plain arithmetic
- Easy to get wrong if you do not track bit positions carefully
- Language details such as signed shifts can be confusing

## Real-Life Uses

- Permission flags such as read, write, execute
- Network protocols and packet headers
- Graphics and color channels
- Compression and encryption logic
- Fast state encoding in algorithm problems

## When to Use and Avoid

Use bit manipulation when:

- the problem is naturally about flags or binary state
- speed and compactness matter
- you need low-level control

Avoid it when:

- it makes simple logic harder to understand
- a clearer data structure would communicate intent better

## Under the Hood

Bit-level techniques appear in:

- **bitsets** for compact membership tracking
- **popcount** style operations that count set bits efficiently
- **subset enumeration** in combinatorial problems
- hardware-aware code that packs many boolean states into a single word

The bigger lesson is that bit manipulation is powerful when it matches the problem naturally. Used at the wrong time, it creates code that is clever but hard to maintain.

## How to Think About It in Practice

- Reach for bit manipulation when the problem naturally talks about flags, subsets, parity, powers of two, or compact state encoding.
- If the binary view does not simplify the idea, clearer arithmetic or data-structure logic is usually the better choice.

## Common Mistakes

- Mixing up decimal and binary thinking
- Forgetting that bit positions are zero-based in many explanations
- Using shifts without thinking about signed numbers
- Writing clever one-liners that future readers cannot maintain

## Compare With

- [Array Operations](/dsa/array-operations): arrays focus on element access, while bit tricks compress work into binary representations.
- [Strings](/dsa/strings): both deal with low-level representation details, but strings add encoding and text rules.

## Key Takeaway

Bit manipulation is powerful because it works at the level the machine actually uses. It is most useful when the problem naturally maps to bits, masks, or compact state.

## Try It Live

- [Open this playground](/dsa/bit-manipulation)
