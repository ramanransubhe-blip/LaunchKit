# Streaming Outputs

DevLaunchKit includes native stream handler controls to chunk response updates directly to UI elements.

---

## Consumer Example

Iterate through stream chunks using async loops:

```typescript
const stream = await ai.streamText("Write a story");
const reader = stream.getReader();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  console.log(value?.text); // Appends text chunk
}
```
