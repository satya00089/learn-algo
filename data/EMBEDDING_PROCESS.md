## Generic CSV Embedding Process

This repo now supports a generic config-driven CSV embedding workflow.

### Files

- template config: `data/dataset-embedding.template.json`
- current countries config: `data/countries.embed.json`
- script entrypoint: `pnpm run embed:dataset -- <config-file>`

### What the script does

1. reads a CSV file
2. builds a text profile from the columns you choose
3. sends those profiles to the OpenAI embeddings API
4. writes a new CSV with all original columns plus fresh `emb_0 ... emb_n`

### Requirements

- `OPENAI_API_KEY` in `.env`

Optional env overrides:

- `COUNTRIES_EMBEDDING_MODEL`
- `COUNTRIES_EMBEDDING_DIMENSIONS`
- `COUNTRIES_EMBEDDING_BATCH_SIZE`

### Create a new dataset config

1. Copy `data/dataset-embedding.template.json`
2. Rename it, for example `data/books.embed.json`
3. Update:
   - `input`
   - `output`
   - `titleColumn`
   - `titleLabel`
   - `textColumns`
   - `listColumns`
   - `excludedColumns`

### Run it

```bash
pnpm run embed:dataset -- data/books.embed.json
```

### Existing countries run

```bash
pnpm run embed:countries-dataset
```

### Notes

- `textColumns` controls what semantic information goes into the embedding
- `listColumns` is for columns like tags, languages, borders, genres
- `excludedColumns` is useful for images, URLs, regexes, and noisy metadata
- if your CSV already has old `emb_*` columns, they are replaced automatically
