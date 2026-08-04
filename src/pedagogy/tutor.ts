/**
 * EnSuLugar — Generador de lecciones (capa pedagógica)
 *
 * Toma una técnica + receta vehículo + perfil del usuario y genera una
 * lección adaptada usando el LLM configurado (BYOK).
 */
import type { Dificultad, PasoRuta, PerfilUsuario, Receta } from "../types.js";
import { LLMClient } from "./llm.js";

const SYSTEM_PROMPT = `Sos EnSuLugar, un tutor de cocina personal. Tu tono es directo, cálido, sin vueltas. Enseñás técnicas, no recetas. Explicás el porqué de cada paso.

Reglas:
- Usá lenguaje simple, sin jerga técnica innecesaria.
- Explicá el mecanismo de cada paso, no solo "hacé X".
- Anticipá errores comunes.
- La lección debe durar 2-3 minutos de lectura.
- Si el alumno es principiante (nivel 1-2), sé más detallado y paciente.
- Si es intermedio (nivel 3-4), podés ser más conciso y asumir conceptos básicos.
- Si es avanzado (nivel 5), enfocate en los detalles finos y variaciones.`;

function promptLeccion(
  tecnica: { id: string; nombre: string; descripcion: string },
  receta: Receta,
  nivel: Dificultad,
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

  return `Técnica a enseñar: ${tecnica.nombre}
Descripción: ${tecnica.descripcion}
Nivel del alumno: ${nivel} (${nivel <= 2 ? "principiante" : nivel <= 4 ? "intermedio" : "avanzado"})
Receta vehículo: ${receta.titulo}

Material de la receta:
- Ingredientes:
${ingredientesTexto}

- Pasos:
${pasosTexto}

Generá una lección de 3 partes:
1. QUÉ ES: explicá qué es esta técnica, por qué importa, y cómo se relaciona con la receta que vamos a usar.
2. CÓMO SE HACE: guiá el paso a paso, explicando el mecanismo de cada paso (no solo "hacé X", sino "por qué X funciona").
3. ERRORES COMUNES: anticipá los 2-3 errores más frecuentes de esta técnica y cómo evitarlos.`;
}

export interface LeccionGenerada {
  tecnica: string;
  receta: string;
  contenido: string;
}

/**
 * Genera una lección para una técnica usando el LLM configurado.
 */
export async function generarLeccion(
  pasoRuta: PasoRuta,
  receta: Receta,
  perfil: PerfilUsuario,
  llm?: LLMClient,
): Promise<LeccionGenerada> {
  const client = llm ?? new LLMClient();
  const prompt = promptLeccion(
    { id: pasoRuta.tecnicaId, nombre: pasoRuta.nombre, descripcion: "" },
    receta,
    perfil.nivel,
  );

  const contenido = await client.generate(prompt, SYSTEM_PROMPT);

  return {
    tecnica: pasoRuta.nombre,
    receta: receta.titulo,
    contenido,
  };
}
