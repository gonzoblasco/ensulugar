/**
 * EnSuLugar — Cache de lecciones generadas por IA
 *
 * Guarda lecciones en SQLite para evitar regenerar las mismas.
 * Key: (recetaId, perfilNivel, hash del contexto)
 * TTL: 7 días (para permitir actualizaciones si cambia el contenido)
 */
import Database from "better-sqlite3";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, "..", "..", "dist", "ensulugar.db");

export interface LeccionCache {
  id?: number;
  recetaId: number;
  perfilNivel: number;
  tecnicasDominadasHash: string;
  contenido: string;
  evaluacion?: string; // JSON string
  variaciones?: string; // JSON string
  generadoEn: number; // timestamp
}

function getDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  
  // Crear tabla si no existe
  db.exec(`
    CREATE TABLE IF NOT EXISTS lecciones_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receta_id INTEGER NOT NULL,
      perfil_nivel INTEGER NOT NULL,
      tecnicas_hash TEXT NOT NULL,
      contenido TEXT NOT NULL,
      evaluacion TEXT,
      variaciones TEXT,
      generado_en INTEGER NOT NULL,
      UNIQUE(receta_id, perfil_nivel, tecnicas_hash)
    )
  `);
  
  // Índice para búsquedas rápidas
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_lecciones_receta 
    ON lecciones_cache(receta_id, perfil_nivel, tecnicas_hash)
  `);
  
  return db;
}

function hashTecnicas(tecnicas: string[]): string {
  const sorted = [...tecnicas].sort().join(",");
  return createHash("sha256").update(sorted).digest("hex").slice(0, 16);
}

export function getLeccionFromCache(
  recetaId: number,
  perfilNivel: number,
  tecnicasDominadas: string[],
): LeccionCache | null {
  const db = getDb();
  const hash = hashTecnicas(tecnicasDominadas);
  
  const row = db
    .prepare(`
      SELECT * FROM lecciones_cache
      WHERE receta_id = ? AND perfil_nivel = ? AND tecnicas_hash = ?
      AND generado_en > (strftime('%s', 'now') - 604800) -- 7 días TTL
    `)
    .get(recetaId, perfilNivel, hash) as LeccionCache | undefined;
  
  db.close();
  return row ?? null;
}

export function saveLeccionToCache(
  recetaId: number,
  perfilNivel: number,
  tecnicasDominadas: string[],
  contenido: string,
  evaluacion?: unknown,
  variaciones?: unknown,
): void {
  const db = getDb();
  const hash = hashTecnicas(tecnicasDominadas);
  const ahora = Math.floor(Date.now() / 1000);
  
  db.prepare(`
    INSERT OR REPLACE INTO lecciones_cache 
    (receta_id, perfil_nivel, tecnicas_hash, contenido, evaluacion, variaciones, generado_en)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    recetaId,
    perfilNivel,
    hash,
    contenido,
    evaluacion ? JSON.stringify(evaluacion) : null,
    variaciones ? JSON.stringify(variaciones) : null,
    ahora
  );
  
  db.close();
}

export function limpiarCacheVieja(): void {
  const db = getDb();
  const hace7Dias = Math.floor(Date.now() / 1000) - 604800;
  
  db.prepare(`
    DELETE FROM lecciones_cache WHERE generado_en < ?
  `).run(hace7Dias);
  
  db.close();
}
