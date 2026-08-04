/**
 * EnSuLugar — Pipeline md → SQLite + JSON
 *
 * Fuente de verdad: `fichas/*.md` (markdown)
 * Artefactos generados:
 *   - dist/ensulugar.db (SQLite)
 *   - dist/ensulugar.json (JSON, para la app)
 *
 * Uso: npm run build:content
 */
import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { leerFichas } from "./parser.js";
import { tecnicasDeReceta } from "./tecnicas-por-receta.js";
import type { Receta } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const SRC_DIR = join(ROOT, "fichas");
const OUT_DIR = join(ROOT, "dist");
const DB_PATH = join(OUT_DIR, "ensulugar.db");
const JSON_PATH = join(OUT_DIR, "ensulugar.json");
const PUBLIC_JSON_PATH = join(ROOT, "app", "public", "ensulugar.json");

function createSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS recetas (
      id INTEGER PRIMARY KEY,
      titulo TEXT NOT NULL,
      descripcion_corta TEXT,
      dificultad INTEGER,
      tiempo_total_minutos INTEGER,
      porciones INTEGER,
      categoria TEXT,
      tags TEXT,
      tecnicas TEXT
    );
    CREATE TABLE IF NOT EXISTS ingredientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receta_id INTEGER,
      nombre TEXT,
      cantidad TEXT,
      unidad TEXT,
      opcional INTEGER
    );
    CREATE TABLE IF NOT EXISTS pasos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receta_id INTEGER,
      orden INTEGER,
      instruccion TEXT,
      nota_opcional TEXT
    );
  `);
}

function insertReceta(db: Database.Database, r: Receta) {
  const stmt = db.prepare(`
    INSERT INTO recetas (id, titulo, descripcion_corta, dificultad, tiempo_total_minutos, porciones, categoria, tags, tecnicas)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    r.id,
    r.titulo,
    r.descripcionCorta,
    r.dificultad,
    r.tiempoTotalMinutos,
    r.porciones,
    r.categoria,
    r.tags.join(","),
    r.tecnicas.join(","),
  );

  const ingStmt = db.prepare(
    "INSERT INTO ingredientes (receta_id, nombre, cantidad, unidad, opcional) VALUES (?, ?, ?, ?, ?)",
  );
  for (const ing of r.ingredientes) {
    ingStmt.run(r.id, ing.nombre, ing.cantidad, ing.unidad ?? null, ing.opcional ? 1 : 0);
  }

  const pasoStmt = db.prepare(
    "INSERT INTO pasos (receta_id, orden, instruccion, nota_opcional) VALUES (?, ?, ?, ?)",
  );
  for (const p of r.pasos) {
    pasoStmt.run(r.id, p.orden, p.instruccion, p.nota ?? null);
  }
}

async function main() {
  console.log("[build] Leyendo fichas markdown...");
  const recetas = leerFichas(SRC_DIR);

  for (const r of recetas) {
    r.tecnicas = tecnicasDeReceta(r);
  }

  console.log(`[build] ${recetas.length} recetas parseadas.`);

  mkdirSync(OUT_DIR, { recursive: true });

  // SQLite
  try {
    const db = new Database(DB_PATH);
    db.exec("PRAGMA foreign_keys = ON;");
    db.exec(`
      DROP TABLE IF EXISTS ingredientes;
      DROP TABLE IF EXISTS pasos;
      DROP TABLE IF EXISTS recetas;
    `);
    createSchema(db);
    for (const r of recetas) insertReceta(db, r);
    db.close();
    console.log(`[build] SQLite generado: ${DB_PATH}`);
  } catch (err) {
    console.error("[build] error generando SQLite:", err);
    throw err;
  }

  // JSON
  writeFileSync(JSON_PATH, JSON.stringify({ recetas }, null, 2));
  console.log(`[build] JSON generado: ${JSON_PATH}`);

  // Copia para el frontend
  mkdirSync(join(ROOT, "app", "public"), { recursive: true });
  copyFileSync(JSON_PATH, PUBLIC_JSON_PATH);
  console.log(`[build] JSON copiado para la app: ${PUBLIC_JSON_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
