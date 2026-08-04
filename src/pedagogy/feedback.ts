/**
 * EnSuLugar — Sistema de feedback post-receta
 *
 * Guarda el resultado reportado por el usuario y genera sugerencias
 * personalizadas para mejorar.
 */
import Database from "better-sqlite3";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { PerfilUsuario } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const DB_PATH = join(ROOT, "dist", "ensulugar.db");

export interface FeedbackReceta {
  recetaId: number;
  resultado: "excelente" | "bien" | "regular" | "mal";
  problema?: string;
  comentario?: string;
  fecha: number; // timestamp
}

interface SugerenciaFeedback {
  tipo: "repaso" | "siguiente" | "variacion";
  mensaje: string;
  tecnicaSugerida?: string;
  recetaSugerida?: number;
}

function getDb(): Database.Database {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS feedback_recetas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receta_id INTEGER NOT NULL,
      resultado TEXT NOT NULL,
      problema TEXT,
      comentario TEXT,
      fecha INTEGER NOT NULL,
      INDEX idx_receta (receta_id),
      INDEX idx_fecha (fecha)
    )
  `);
  
  return db;
}

export function guardarFeedbackReceta(payload: {
  recetaId: number;
  resultado: "excelente" | "bien" | "regular" | "mal";
  problema?: string;
  comentario?: string;
  perfil: PerfilUsuario;
}): { ok: true; sugerencias: SugerenciaFeedback[] } {
  const db = getDb();
  const fecha = Math.floor(Date.now() / 1000);
  
  db.prepare(`
    INSERT INTO feedback_recetas (receta_id, resultado, problema, comentario, fecha)
    VALUES (?, ?, ?, ?, ?)
  `).run(payload.recetaId, payload.resultado, payload.problema ?? null, payload.comentario ?? null, fecha);
  
  db.close();
  
  // Generar sugerencias basadas en el resultado
  const sugerencias = generarSugerencias(payload);
  
  return { ok: true, sugerencias };
}

function generarSugerencias(payload: {
  recetaId: number;
  resultado: "excelente" | "bien" | "regular" | "mal";
  problema?: string;
  perfil: PerfilUsuario;
}): SugerenciaFeedback[] {
  const sugerencias: SugerenciaFeedback[] = [];
  
  if (payload.resultado === "excelente" || payload.resultado === "bien") {
    // Felicitaciones + siguiente desafío
    sugerencias.push({
      tipo: "siguiente",
      mensaje: payload.resultado === "excelente"
        ? "¡Excelente trabajo! Dominaste esta técnica. ¿Querés seguir avanzando?"
        : "¡Bien hecho! Seguimos practicando. ¿Probamos la siguiente técnica?",
    });
    
    // Sugerir variación si tiene suficiente experiencia
    if (payload.perfil.recetasCompletadas.length >= 3) {
      sugerencias.push({
        tipo: "variacion",
        mensaje: "Ya tenés experiencia. ¿Te animás a una variación más desafiante?",
      });
    }
  } else if (payload.resultado === "regular") {
    // Sugerir repaso con enfoque específico
    sugerencias.push({
      tipo: "repaso",
      mensaje: "No te preocupes, es normal al principio. ¿Querés repasar los conceptos clave?",
    });
    
    if (payload.problema) {
      sugerencias.push({
        tipo: "repaso",
        mensaje: `Veo que tuviste problemas con "${payload.problema}". Te recomiendo revisar esa parte específica antes de continuar.`,
      });
    }
  } else {
    // Resultado "mal" — ofrecer ayuda concreta
    sugerencias.push({
      tipo: "repaso",
      mensaje: "Tranqui, todos fallamos al aprender. ¿Querés que repasemos juntos qué salió mal?",
    });
    
    if (payload.problema) {
      sugerencias.push({
        tipo: "repaso",
        mensaje: `El problema fue "${payload.problema}". Esto suele pasar por [causa común]. Te doy tips específicos para la próxima.`,
      });
    }
  }
  
  return sugerencias;
}

export function obtenerHistorialFeedback(recetaId?: number): FeedbackReceta[] {
  const db = getDb();
  
  let query = "SELECT * FROM feedback_recetas ORDER BY fecha DESC";
  const params: any[] = [];
  
  if (recetaId !== undefined) {
    query = "SELECT * FROM feedback_recetas WHERE receta_id = ? ORDER BY fecha DESC";
    params.push(recetaId);
  }
  
  const rows = db.prepare(query).all(...params) as FeedbackReceta[];
  db.close();
  
  return rows;
}

export function analizarTendenciaFeedback(): {
  total: number;
  promedio: number;
  porResultado: Record<string, number>;
} {
  const db = getDb();
  
  const rows = db.prepare(`
    SELECT resultado, COUNT(*) as cantidad
    FROM feedback_recetas
    GROUP BY resultado
  `).all() as Array<{ resultado: string; cantidad: number }>;
  
  db.close();
  
  const porResultado: Record<string, number> = {};
  let total = 0;
  let sumaPonderada = 0;
  
  const pesos = { excelente: 4, bien: 3, regular: 2, mal: 1 };
  
  for (const row of rows) {
    porResultado[row.resultado] = row.cantidad;
    total += row.cantidad;
    sumaPonderada += row.cantidad * (pesos[row.resultado as keyof typeof pesos] ?? 0);
  }
  
  return {
    total,
    promedio: total > 0 ? sumaPonderada / total : 0,
    porResultado,
  };
}
