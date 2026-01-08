# LEARN ALGO Roadmap

## 🚀 Planned Features

### In-Playground Enhancements

#### 1. Guided Learning Mode
**Location:** Individual algorithm playground pages

- [ ] **Step Explanations**
  - "What does this step mean?" prompts for each operation
  - Contextual explanations during execution
  - Visual highlights showing what's being compared/swapped

- [ ] **Challenge Questions**
  - Interactive questions that pause execution
  - "What will happen next?" predictions
  - Multiple choice or fill-in-the-blank format
  - Immediate feedback on answers

- [ ] **Learning Outcomes Panel**
  - Display clear learning goals at the top of each playground
  - Checkable outcomes: "After this, you'll be able to..."
  - Track progress per algorithm
  - Examples:
    - "Explain how pivot selection affects performance"
    - "Predict worst-case complexity by examining input"
    - "Trace the partitioning process step-by-step"

#### 2. Custom Dataset Features
**Location:** Individual algorithm playground pages

- [ ] **Dataset Input**
  - Manual array input via text field
  - CSV/JSON file upload support
  - Preset datasets (best-case, worst-case, nearly-sorted)

- [ ] **Algorithm Comparison View**
  - Side-by-side execution of 2+ algorithms
  - Synchronized stepping
  - Performance metrics comparison
  - Visual diff of approaches

- [ ] **Scenario Explorer**
  - "Test with sorted data" button
  - "Test with reverse-sorted data" button
  - "Generate worst-case" button
  - Save custom datasets for reuse

#### 3. Interview Tips Integration
**Location:** Individual algorithm playground pages

- [ ] **Interview Insights Tab**
  - "What interviewers look for" section
  - Common gotchas and edge cases
  - Time/space complexity talking points
  - Trade-offs to discuss

- [ ] **Visual Tricks Panel**
  - Key patterns to recognize
  - Mental shortcuts
  - How to spot best/worst cases
  - Edge case checklist

- [ ] **Code Snippets**
  - Common interview variations
  - Bug-prone patterns (e.g., binary search overflow)
  - Optimization techniques

## 📦 Component Library (Created, Ready to Use)

### Available Components

1. **LearningOutcomes.tsx**
   - Location: `src/components/LearningOutcomes.tsx`
   - Interactive checklist with expandable descriptions
   - Progress tracking
   - Ready to integrate into playground sidebars

2. **Learning Outcomes Data**
   - Location: `src/data/learningOutcomes.ts`
   - Pre-written outcomes for 6+ algorithms:
     - QuickSort, BubbleSort, MergeSort
     - Binary Search
     - Linear Regression, KNN
   - Each with 3-5 specific, measurable outcomes

### Integration Guide

To add learning outcomes to a playground:

```tsx
import { LearningOutcomes } from '@/components/LearningOutcomes'
import { quickSortOutcomes } from '@/data/learningOutcomes'

// In your playground component:
<LearningOutcomes 
  algorithmName="QuickSort"
  outcomes={quickSortOutcomes}
/>
```

## 🎯 Implementation Priority

### Phase 1: Learning Outcomes (Highest ROI)
- Integrate `LearningOutcomes` component into top 5 algorithms
- Add outcomes data for remaining algorithms
- Track completion in localStorage

### Phase 2: Dataset Customization
- Add manual array input fields
- Implement preset scenarios (sorted, reverse, random)
- Add "Generate worst-case" buttons

### Phase 3: Guided Explanations
- Add step description text that updates during execution
- Implement pause-on-compare feature
- Add explanatory tooltips

### Phase 4: Challenge Questions
- Design question UI/UX
- Create question bank per algorithm
- Implement answer validation

### Phase 5: Interview Tips
- Create collapsible panel in playground
- Port content from deleted `/interview-tips` page
- Add per-algorithm interview insights

### Phase 6: Comparison View
- Design split-screen layout
- Synchronize stepping across algorithms
- Add performance metrics

## 📝 Notes

- Educational content from deleted pages (`/how-to-learn` and `/interview-tips`) contains valuable material that should be integrated into individual playgrounds
- Focus on in-playground features for better user experience
- Avoid creating separate educational pages; embed learning within the visualization context
- Keep components modular and reusable across different algorithms
