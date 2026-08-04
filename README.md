# EnSuLugar

Tutor de cocina adaptativo con IA (BYOK). Cada receta es la semilla de una lección.

**Filosofía:** enseñar técnicas, no recetas. Explicar el porqué de cada paso.

**Modelo:** open-core (local gratis con tu LLM / cloud premium a futuro).

## Stack

- TypeScript / Node.js
- SQLite (artefacto generado desde markdown)
- BYOK: Ollama local, OpenAI o Anthropic

## Estado

- 27 técnicas en el grafo de prerrequisitos
- 39 recetas en la base de conocimiento
- Motor de adaptación determinístico (sin LLM)
- Capa pedagógica con LLM (BYOK)
- Pipeline md → SQLite/JSON

## Uso

```bash
npm install
npm run build:content   # genera DB/JSON desde las fichas markdown
npx tsx src/cli.ts      # muestra rutas de aprendizaje
npx tsx src/cli.ts --leccion  # genera una lección con LLM
```

## Licencia

MIT
