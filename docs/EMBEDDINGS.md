# Embeddings Generation

The platform supports embedding models to represent text in multidimensional space.

---

## Generating Embeddings

Use `ai.embed` to get vector representations:

```typescript
const result = await ai.embed("LaunchKit is fantastic");
console.log(`Dimensions: ${result.embedding.length}`); // 1536 (OpenAI) or 768 (Gemini)
```

---

## Batch Embeddings Generation

Map arrays of text to generate embeddings in parallel using Promise groups:

```typescript
const texts = ["hello", "world"];
const results = await Promise.all(texts.map(t => ai.embed(t)));
```
