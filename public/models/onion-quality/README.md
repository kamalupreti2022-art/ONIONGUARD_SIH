# Trained Onion Classification Model Setup Guide

This directory hosts the trained client-side model for **OnionGuard AI** (Smart India Hackathon 2026).

---

## 1. The 8 Model Classes

The model must classify uploaded onion images into exactly these **8 classes**:

1. `red healthy onions(single)`
2. `red rotten onions(single)`
3. `white healthy onions(single)`
4. `white rotten onions(single)`
5. `red healthy onions(bulk)`
6. `red rotten onions(bulk)`
7. `white healthy onions(bulk)`
8. `white rotten onions(bulk)`

---

## 2. Main Result Calculation

The system calculates two primary categories from the model's 8 class probabilities:

- **HEALTHY** = sum of:
  - `red healthy onions(single)`
  - `white healthy onions(single)`
  - `red healthy onions(bulk)`
  - `white healthy onions(bulk)`

- **UNHEALTHY** = sum of:
  - `red rotten onions(single)`
  - `white rotten onions(single)`
  - `red rotten onions(bulk)`
  - `white rotten onions(bulk)`

Both percentages add up to ~100%. Underneath the main result, the application displays the individual 8 classes and their actual probabilities.

---

## 3. How to Provide Your Model

You can provide your model in any of the following ways:

### Option A: Place files in this folder
Place your model files in:
```
public/models/onion-quality/
├── model.json            <-- Model topology definition
├── group1-shard1of1.bin  <-- Weights binary file (or multiple shards)
└── labels.json           <-- The 8 classes listed above
```

### Option B: Paste a hosted URL in `src/utils/tfModelService.ts`
Open `src/utils/tfModelService.ts` and set:
```typescript
export const CUSTOM_MODEL_URL = 'https://your-domain.com/path/to/model.json';
```

### Option C: Paste in Settings in the Web UI
Open the website -> Go to **Settings** -> **Trained Onion Classification Model** -> Paste your model URL or upload model files directly in the browser!
