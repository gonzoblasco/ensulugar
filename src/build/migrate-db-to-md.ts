/**
 * EnSuLugar — Script de migración: DB original → fichas markdown
 *
 * Lee la DB original (ensulugar.db) y regenera las fichas markdown
 * en fichas/ con el formato estándar que el parser entiende.
 *
 * Uso: npx tsx src/build/migrate-db-to-md.ts
 */
import Database from "better-sqlite3";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const DB_PATH = join(ROOT, "ensulugar.db");
const FICHAS_DIR = join(ROOT, "fichas");

interface RecetaRow {
  id: number;
  titulo: string;
  descripcion_corta: string;
  dificultad: number;
  tiempo_total_minutos: number;
  porciones: number;
  tags: string | null;
}

interface IngredienteRow {
  nombre: string;
  cantidad: string | null;
  unidad: string | null;
  opcional: number;
}

interface PasoRow {
  orden: number;
  instruccion: string;
  nota_opcional: string | null;
}

const CATEGORIAS: Record<string, string> = {
  huevos: "🥚 Fichas de Huevos",
  pasta: "🍝 Fichas de Pastas",
  salsas: "🥘 Fichas de Salsas Madre",
  carnes: "🔥 Fichas de Carnes",
  vegetales: "🥦 Fichas de Vegetales y Masas",
};

/** Asigna categoría por tags de la receta. Prioridad: categoría principal primero. */
function categoriaDeTags(tags: string[]): string {
  const t = tags.join(",").toLowerCase();
  if (t.includes("huevos")) return "huevos";
  if (t.includes("carnes")) return "carnes";
  if (t.includes("pasta") || t.includes("italiana")) return "pasta";
  if (t.includes("salsas")) return "salsas";
  if (t.includes("vegetales") || t.includes("masas") || t.includes("pan")) return "vegetales";
  return "general";
}

function estrella(n: number): string {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function formatIngrediente(row: IngredienteRow): string {
  let cant = row.cantidad ?? "";
  if (row.unidad) {
    cant = cant ? `${cant} ${row.unidad}` : row.unidad;
  }
  return `| ${cant} | ${row.nombre} |`;
}

function formatPaso(row: PasoRow): string {
  const lines: string[] = [];
  const texto = row.instruccion.trim();
  // Extraer título corto: primeras palabras hasta el primer punto, o hasta 60 chars
  const matchTitulo = texto.match(/^(.+?)[.:]/);
  let titulo = matchTitulo ? matchTitulo[1].trim() : texto.slice(0, 50).trim();
  let cuerpo = texto.startsWith(titulo) ? texto.slice(titulo.length).replace(/^[.:\s]+/, "") : texto;
  // Si el cuerpo quedó vacío, el título es toda la instrucción
  if (!cuerpo) {
    // Usar primeras 4-5 palabras como título
    const palabras = texto.split(/\s+/);
    titulo = palabras.slice(0, Math.min(5, palabras.length)).join(" ");
    cuerpo = texto.slice(titulo.length).replace(/^[.:\s]+/, "");
  }
  lines.push(`${row.orden}. **${titulo}** — ${cuerpo}`);
  if (row.nota_opcional) {
    lines.push(`   > ${row.nota_opcional}`);
  }
  return lines.join("\n");
}

function main() {
  const db = new Database(DB_PATH);
  const recetas = db.prepare("SELECT * FROM recetas ORDER BY id").all() as RecetaRow[];

  // Agrupar recetas por categoría usando tags
  const porCategoria: Record<string, RecetaRow[]> = {};
  for (const r of recetas) {
    const tagsReceta = db
      .prepare(
        "SELECT t.nombre FROM receta_tags rt JOIN tags t ON t.id = rt.tag_id WHERE rt.receta_id = ?",
      )
      .all(r.id) as { nombre: string }[];
    const tagNombres = tagsReceta.map((t) => t.nombre);
    const cat = categoriaDeTags(tagNombres);
    if (!porCategoria[cat]) porCategoria[cat] = [];
    porCategoria[cat].push(r);
  }

  mkdirSync(FICHAS_DIR, { recursive: true });

  for (const [cat, recetasCat] of Object.entries(porCategoria)) {
    const lines: string[] = [];
    lines.push(`# ${CATEGORIAS[cat] ?? `Fichas de ${cat}`}`);
    lines.push("");

    for (const r of recetasCat) {
      lines.push(`## ${r.titulo}`);
      lines.push("");
      lines.push(
        `**Dificultad:** ${estrella(r.dificultad)} | **Tiempo:** ${r.tiempo_total_minutos} min | **Porciones:** ${r.porciones}`,
      );
      lines.push("");
      lines.push(`> ${r.descripcion_corta}`);
      lines.push("");

      // Ingredientes
      const ingredientes = db
        .prepare("SELECT * FROM ingredientes WHERE receta_id = ? ORDER BY id")
        .all(r.id) as IngredienteRow[];
      lines.push("### Ingredientes");
      lines.push("");
      lines.push("| Cantidad | Ingrediente |");
      lines.push("|---|---|");
      for (const ing of ingredientes) {
        lines.push(formatIngrediente(ing));
      }
      lines.push("");

      // Pasos
      const pasos = db
        .prepare("SELECT * FROM pasos WHERE receta_id = ? ORDER BY orden")
        .all(r.id) as PasoRow[];
      lines.push("### Pasos");
      lines.push("");
      for (const p of pasos) {
        lines.push(formatPaso(p));
        lines.push("");
      }
      lines.push("---");
      lines.push("");
    }

    const filename = `${cat}.md`;
    writeFileSync(join(FICHAS_DIR, filename), lines.join("\n"));
    console.log(`[migrate] ${filename}: ${recetasCat.length} recetas`);
  }

  db.close();
  console.log("\n[migrate] Fichas regeneradas desde la DB original.");
}

main();
