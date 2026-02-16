# Theory Content System

This system provides a unified way to display algorithm theory across all playgrounds.

## Architecture

- **TheoryModal Component**: Reusable modal component in `src/components/TheoryModal.tsx`
- **Theory Files**: Markdown files stored in `public/theory/` directory
- **Integration**: Each algorithm playground imports and uses the TheoryModal

## Usage

### 1. Create Theory File

Create a `.md` file in `public/theory/` with the algorithm name:

```
public/theory/algorithm-name.md
```

### 2. Use TheoryModal in Component

```tsx
import { TheoryModal } from '@/components/TheoryModal'

// In your component state
const [showTheory, setShowTheory] = useState(false)

// In your JSX
<TheoryModal
  isOpen={showTheory}
  onClose={() => setShowTheory(false)}
  theoryFile="/theory/algorithm-name.md"
  title="Understanding Algorithm Name"
/>
```

### 3. Add Theory Button

Use the same Button component as the theme toggle:

```tsx
<Button
  onClick={() => setShowTheory(true)}
  variant="outline"
  size="sm"
  className="flex items-center gap-2"
>
  <FaBookOpen size={14} />
  Theory
</Button>
```

## Markdown Features

The TheoryModal supports basic markdown:

- `# Headers`
- `## Subheaders`
- `### Sub-subheaders`
- `- Lists`
- `**Bold text**`
- Empty lines for spacing

## File Structure

```
public/theory/
├── pca.md
├── k-means.md
├── linear-regression.md
└── ...
```

## Tabbed Content Features

The theory system supports interactive code tabs for showing different implementations:

### Code Tabs

Display multiple code implementations with syntax highlighting:

```bash
# Tab: npm
npm install algorithm-package

# Tab: yarn
yarn add algorithm-package

# Tab: pnpm
pnpm add algorithm-package

# Tab: bun
bun add algorithm-package
```

Or show different implementation approaches:

```python
# Tab: From Scratch
import numpy as np
def pca_from_scratch(X, n_components=2):
    # Standardize and compute PCA from first principles
    return X_pca, components, explained_var

# Tab: Using scikit-learn
from sklearn.decomposition import PCA
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_std)
print(f"Variance explained: {pca.explained_variance_ratio_}")
```

### Regular Theory Content

Theory explanations remain as standard markdown with headers, paragraphs, lists, and tables.

## Benefits

- **Separation of Concerns**: Content separate from code
- **Reusability**: Same component across all algorithms
- **Maintainability**: Easy to update theory content
- **Consistency**: Unified UI/UX across playgrounds
