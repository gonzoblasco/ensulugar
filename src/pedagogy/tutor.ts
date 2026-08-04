/**
 * EnSuLugar — Generador de lecciones (capa pedagógica)
 *
 * Toma una técnica + receta vehículo + perfil del usuario y genera una
 * lección adaptada usando el LLM configurado (BYOK).
 * Ahora con cache, evaluaciones y variaciones dinámicas.
 */
import type { Dificultad, PasoRuta, PerfilUsuario, Receta } from "../types.js";
import { LLMClient } from "./llm.js";
import { getLeccionFromCache, saveLeccionToCache } from "./cache.js";

const SYSTEM_PROMPT = `Sos EnSuLugar, un tutor de cocina personal. Tu tono es directo, cálido, sin vueltas. Enseñás técnicas, no recetas. Explicás el porqué de cada paso.

Reglas:
- Usá lenguaje simple, sin jerga técnica innecesaria.
- Explicá el mecanismo de cada paso, no solo "hacé X".
- Anticipá errores comunes.
- La lección debe durar 2-3 minutos de lectura.
- Si el alumno es principiante (nivel 1-2), sé más detallado y paciente.
- Si es intermedio (nivel 3-4), podés ser más conciso y asumir conceptos básicos.
- Si es avanzado (nivel 5), enfocate en los detalles finos y variaciones.
- **IMPORTANTE:** Adaptá el contenido al historial real del alumno. Si ya domina técnicas relacionadas, no las expliques desde cero — mencioná la conexión y enfocáte en lo nuevo.`;

function promptLeccion(
  tecnica: { id: string; nombre: string; descripcion: string },
  receta: Receta,
  perfil: PerfilUsuario,
): string {
  const pasosTexto = receta.pasos
    .map(
      (p) =>
        `${p.orden}. ${p.instruccion}${p.nota ? `\n   > ${p.nota}` : ""}`,
    )
    .join("\n\n");

  const ingredientesTexto = receta.ingredientes
    .map((i) => `- ${i.cantidad} ${i.nombre}`)
    .join("\n");

  // Construir contexto del historial del alumno
  const tecnicasDominadasStr = perfil.tecnicasDominadas.length > 0
    ? perfil.tecnicasDominadas.join(', ')
    : 'ninguna (es principiante absoluto)';
  
  const recetasCompletadasCount = perfil.recetasCompletadas.length;
  
  // Determinar si hay técnicas relacionadas ya dominadas
  const tieneBaseRelacionada = perfil.tecnicasDominadas.some(t => 
    tecnica.id.includes(t) || t.includes(tecnica.id.split('-')[0])
  );

  let adaptacionContexto = '';
  if (tieneBaseRelacionada) {
    adaptacionContexto = `El alumno YA DOMINA técnicas relacionadas (${tecnicasDominadasStr}). No expliques la técnica actual desde cero — mencioná qué tiene en común con lo que ya sabe y enfocáte en las diferencias específicas.`;
  } else if (recetasCompletadasCount === 0) {
    adaptacionContexto = `El alumno es PRINCIPIANTE ABSOLUTO (${recetasCompletadasCount} recetas completadas, ninguna técnica dominada). Explicá TODO desde los fundamentos, asumí que nunca cocinó nada.`;
  } else if (recetasCompletadasCount < 5) {
    adaptacionContexto = `El alumno está EMPEZANDO (${recetasCompletadasCount} recetas completadas, técnicas dominadas: ${tecnicasDominadasStr}). Podés asumir conceptos muy básicos pero explicá con detalle los mecanismos.`;
  } else {
    adaptacionContexto = `El alumno tiene EXPERIENCIA (${recetasCompletadasCount} recetas completadas, técnicas dominadas: ${tecnicasDominadasStr}). Sé más conciso, enfocáte en los matices y variaciones de esta técnica.`;
  }

  return `Técnica a enseñar: ${tecnica.nombre}
Descripción: ${tecnica.descripcion}
Nivel objetivo del alumno: ${perfil.nivel} (${perfil.nivel <= 2 ? "principiante" : perfil.nivel <= 4 ? "intermedio" : "avanzado"})
Receta vehículo: ${receta.titulo}

${adaptacionContexto}

Material de la receta:
- Ingredientes:
${ingredientesTexto}

- Pasos:
${pasosTexto}

Generá una lección de 3 partes:
1. QUÉ ES: explicá qué es esta técnica, por qué importa, y cómo se relaciona con la receta que vamos a usar. **Si el alumno ya sabe algo relacionado, mencioná esa conexión explícitamente** (ej: "Ya sabés hacer vinagreta, que es una emulsión líquida; la mayonesa es similar pero con yema como emulsionante y mucho más aceite").
2. CÓMO SE HACE: guiá el paso a paso, explicando el mecanismo de cada paso (no solo "hacé X", sino "por qué X funciona"). **Adaptá el nivel de detalle al historial del alumno**.
3. ERRORES COMUNES: anticipá los 2-3 errores más frecuentes de esta técnica y cómo evitarlos. **Si el alumno es principiante absoluto, enfocáte en errores básicos; si tiene experiencia, mencioná errores más sutiles**.`;
}

function promptEvaluacion(
  tecnica: { id: string; nombre: string },
  nivel: Dificultad,
): string {
  return `Generá 2 preguntas de opción múltiple para verificar comprensión de la técnica "${tecnica.nombre}" para un alumno de nivel ${nivel}.

Cada pregunta debe tener:
- Pregunta clara y concreta
- 4 opciones (1 correcta, 3 distractores plausibles)
- Explicación de por qué la correcta es correcta
- Los distractores deben reflejar errores comunes reales

Formato JSON:
{
  "preguntas": [
    {
      "pregunta": "...",
      "opciones": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correcta": 0,
      "explicacion": "..."
    }
  ]
}`;
}

function promptVariaciones(
  tecnica: { id: string; nombre: string; descripcion: string },
  receta: Receta,
  perfil: PerfilUsuario,
): string {
  return `El alumno completó la técnica "${tecnica.nombre}" con la receta "${receta.titulo}".

Perfil del alumno:
- Nivel: ${perfil.nivel}
- Técnicas dominadas: ${perfil.tecnicasDominadas.join(', ')}
- Recetas completadas: ${perfil.recetasCompletadas.length}

Generá 3 variaciones de dificultad progresiva para practicar esta técnica:
1. Variación básica (mismo nivel, ingrediente distinto o pequeño cambio)
2. Variación intermedia (técnica relacionada, un paso más complejo)
3. Variación avanzada (técnica derivada, requiere prerrequisitos adicionales)

Para cada variación, indicá:
- Nombre de la receta sugerida
- Qué cambia respecto a la original
- Qué nuevo desafío presenta
- Nivel de dificultad estimado (1-5)

Formato JSON:
{
  "variaciones": [
    {
      "nombre": "...",
      "cambio": "...",
      "desafio": "...",
      "nivel": 2
    }
  ]
}`;
}

export interface LeccionGenerada {
  tecnica: string;
  receta: string;
  contenido: string;
  evaluacion?: {
    preguntas: Array<{
      pregunta: string;
      opciones: string[];
      correcta: number;
      explicacion: string;
    }>;
  };
  variaciones?: {
    variaciones: Array<{
      nombre: string;
      cambio: string;
      desafio: string;
      nivel: number;
    }>;
  };
  fueCacheada?: boolean;
}

/**
 * Genera una lección para una técnica usando el LLM configurado.
 * Usa cache si existe,否则 genera nueva.
 */
export async function generarLeccion(
  pasoRuta: PasoRuta,
  receta: Receta,
  perfil: PerfilUsuario,
  llm?: LLMClient,
  forzarRegeneracion: boolean = false,
): Promise<LeccionGenerada> {
  const client = llm ?? new LLMClient();
  
  // Intentar obtener de cache
  if (!forzarRegeneracion) {
    const cacheada = getLeccionFromCache(
      receta.id,
      perfil.nivel,
      perfil.tecnicasDominadas
    );
    
    if (cacheada) {
      return {
        tecnica: pasoRuta.nombre,
        receta: receta.titulo,
        contenido: cacheada.contenido,
        evaluacion: cacheada.evaluacion ? JSON.parse(cacheada.evaluacion) : undefined,
        variaciones: cacheada.variaciones ? JSON.parse(cacheada.variaciones) : undefined,
        fueCacheada: true,
      };
    }
  }
  
  // Generar lección principal
  const prompt = promptLeccion(
    { id: pasoRuta.tecnicaId, nombre: pasoRuta.nombre, descripcion: "" },
    receta,
    perfil,
  );
  
  const contenido = await client.generate(prompt, SYSTEM_PROMPT);
  
  // Generar evaluación (en paralelo para ahorrar tiempo)
  const evaluacionPromise = client.generate(
    promptEvaluacion(
      { id: pasoRuta.tecnicaId, nombre: pasoRuta.nombre },
      perfil.nivel
    ),
    "Sos un tutor de cocina que crea preguntas de evaluación claras y relevantes. Respondé SOLO con JSON válido."
  ).then(json => {
    try {
      return JSON.parse(json);
    } catch {
      return undefined;
    }
  });
  
  // Generar variaciones (solo si el usuario tiene experiencia)
  const variacionesPromise = perfil.recetasCompletadas.length >= 3
    ? client.generate(
        promptVariaciones(
          { id: pasoRuta.tecnicaId, nombre: pasoRuta.nombre, descripcion: "" },
          receta,
          perfil
        ),
        "Sos un chef instructor que sugiere variaciones desafiantes pero alcanzables. Respondé SOLO con JSON válido."
      ).then(json => {
        try {
          return JSON.parse(json);
        } catch {
          return undefined;
        }
      })
    : Promise.resolve(undefined);
  
  const [evaluacion, variaciones] = await Promise.all([evaluacionPromise, variacionesPromise]);
  
  // Guardar en cache
  saveLeccionToCache(
    receta.id,
    perfil.nivel,
    perfil.tecnicasDominadas,
    contenido,
    evaluacion,
    variaciones
  );
  
  return {
    tecnica: pasoRuta.nombre,
    receta: receta.titulo,
    contenido,
    evaluacion,
    variaciones,
    fueCacheada: false,
  };
}
