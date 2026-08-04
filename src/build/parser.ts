/**
 * EnSuLugar — Parser de fichas markdown (fuente de verdad)
 *
 * Convierte las fichas de `fichas/*.md` en objetos Receta tipados.
 *
 * Formato esperado de una ficha:
 *   # 🥚 Fichas de Huevos
 *   ---
 *   ## Huevo Frito Perfecto
 *   **Dificultad:** ★★★☆☆ | **Tiempo:** 5 min | **Porciones:** 1
 *   > descripción corta
 *   ### Ingredientes
 *   | Cantidad | Ingrediente |
 *   |---|---|
 *   | 1 | Huevo fresco |
 *   ### Pasos
 *   1. **Instrucción** — detalle
 *      > nota pedagógica
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Dificultad, Ingrediente, Paso, Receta } from "../types.js";

/** Mapa de categoría por archivo de ficha. */
const CATEGORIA_POR_ARCHIVO: Record<string, string> = {
  "huevos.md": "huevos",
  "pasta.md": "pasta",
  "salsas.md": "salsas",
  "carnes.md": "carnes",
  "vegetales-y-masas.md": "vegetales",
};

/** Convierte "★★★☆☆" (n estrellas) a dificultad 1-5. */
function estrellasADificultad(texto: string): Dificultad {
  const match = texto.match(/★+/);
  const n = match ? match[0].length : 1;
  return Math.min(5, Math.max(1, n)) as Dificultad;
}

/** Extrae minutos de "45 min" o "3-4 min". */
function minutosDeTexto(texto: string): number {
  const match = texto.match(/(\d+)/);
  return match ? parseInt(match[0], 10) : 0;
}

/** Parsea la línea de metadatos. */
function parseMetadata(linea: string) {
  const dif = linea.match(/\*\*Dificultad:\*\*\s*([★☆]+)/);
  const tiempo = linea.match(/\*\*Tiempo:\*\*\s*([\d\s-]+min)/);
  const porc = linea.match(/\*\*Porciones:\*\*\s*(\d+)/);
  return {
    dificultad: dif ? estrellasADificultad(dif[1]) : (1 as Dificultad),
    tiempo: tiempo ? minutosDeTexto(tiempo[1]) : 0,
    porciones: porc ? parseInt(porc[1], 10) : 1,
  };
}

/** Parsea la tabla de ingredientes (markdown). */
function parseIngredientes(lines: string[]): Ingrediente[] {
  const ingredientes: Ingrediente[] = [];
  let enTabla = false;
  for (const line of lines) {
    if (line.startsWith("| Cantidad | Ingrediente")) {
      enTabla = true;
      continue;
    }
    if (enTabla) {
      if (line.startsWith("|---") || line.startsWith("| ---")) continue;
      if (!line.startsWith("|")) {
        enTabla = false;
        continue;
      }
      const celdas = line
        .split("|")
        .map((c) => c.trim())
        .filter((c) => c !== "");
      if (celdas.length >= 2) {
        ingredientes.push({ nombre: celdas[1], cantidad: celdas[0] });
      }
    }
  }
  return ingredientes;
}

/** Parsea los pasos numerados con sus notas (> ...). */
function parsePasos(lines: string[]): Paso[] {
  const pasos: Paso[] = [];
  let actual: Paso | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    const pasoMatch = line.match(/^(\d+)\.\s+\*\*(.+?)\*\*\s*[—-]\s*(.+)$/);
    const notaMatch = line.match(/^>\s*(.+)$/);

    if (pasoMatch) {
      if (actual) pasos.push(actual);
      actual = {
        orden: parseInt(pasoMatch[1], 10),
        instruccion: `${pasoMatch[2]}: ${pasoMatch[3]}`,
      };
    } else if (notaMatch && actual) {
      actual.nota = notaMatch[1];
    } else if (actual && !line.startsWith("|") && line !== "" && !line.startsWith("#")) {
      // texto suelto dentro de un paso
      actual.instruccion += ` ${line}`;
    }
  }
  if (actual) pasos.push(actual);
  return pasos;
}

/** Normaliza un título para usarlo como clave de mapeo. Quita subtítulos entre paréntesis. */
function normalizarTitulo(titulo: string): string {
  return titulo
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Parsea una receta individual (bloque ## dentro de una ficha). */
function parseReceta(
  id: number,
  titulo: string,
  lines: string[],
  categoria: string,
): Receta {
  const meta = parseMetadata(lines.find((l) => l.includes("**Dificultad:**")) ?? "");
  const desc = lines.find((l) => l.startsWith(">"))?.replace(/^>\s*/, "") ?? "";

  const idxIng = lines.findIndex((l) => l.startsWith("### Ingredientes"));
  const idxPasos = lines.findIndex((l) => l.startsWith("### Pasos"));

  const ingredientes =
    idxIng >= 0 && idxPasos > idxIng
      ? parseIngredientes(lines.slice(idxIng + 1, idxPasos))
      : [];
  const pasos = idxPasos >= 0 ? parsePasos(lines.slice(idxPasos + 1)) : [];

  const tituloClave = normalizarTitulo(titulo);
  const tags = [categoria];

  return {
    id,
    titulo,
    tituloClave,
    descripcionCorta: desc,
    dificultad: meta.dificultad,
    tiempoTotalMinutos: meta.tiempo,
    porciones: meta.porciones,
    categoria,
    tags,
    tecnicas: [], // se asigna en el build (mapeo curado receta → técnicas)
    ingredientes,
    pasos,
  };
}

/** Lee todas las fichas de un directorio y devuelve las recetas. */
export function leerFichas(dir: string): Receta[] {
  const archivos = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const recetas: Receta[] = [];
  let id = 1;

  for (const archivo of archivos) {
    const categoria = CATEGORIA_POR_ARCHIVO[archivo] ?? archivo.replace(".md", "");
    const contenido = readFileSync(join(dir, archivo), "utf-8");

    // Separar en bloques por "## "
    const lineas = contenido.split("\n");
    let bloqueActual: string[] = [];
    let tituloActual: string | null = null;

    for (const line of lineas) {
      const tituloMatch = line.match(/^##\s+(.+)$/);
      if (tituloMatch) {
        if (tituloActual && bloqueActual.length) {
          recetas.push(parseReceta(id++, tituloActual, bloqueActual, categoria));
        }
        tituloActual = tituloMatch[1].trim();
        bloqueActual = [line];
      } else if (tituloActual) {
        bloqueActual.push(line);
      }
    }
    if (tituloActual && bloqueActual.length) {
      recetas.push(parseReceta(id++, tituloActual, bloqueActual, categoria));
    }
  }

  return recetas;
}
