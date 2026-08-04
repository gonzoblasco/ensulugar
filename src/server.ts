/**
 * EnSuLugar — Backend minimal para el frontend
 *
 * Expone:
 *   GET  /api/recetas      → JSON con todas las recetas
 *   POST /api/leccion      → genera una lección con LLM (BYOK)
 *
 * El frontend en Vite proxya /api a este servidor en desarrollo.
 * En producción, este server es el backend desplegado.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { leerFichas } from "./build/parser.js";
import { tecnicasDeReceta } from "./build/tecnicas-por-receta.js";
import { armarRuta } from "./engine/path.js";
import { generarLeccion } from "./pedagogy/tutor.js";
import { loadConfig } from "./pedagogy/llm.js";
import type { Dificultad, PerfilUsuario, Receta } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = Number(process.env.PORT ?? 3001);

const perfiles: Record<string, PerfilUsuario> = {
  principiante: {
    nivel: 1 as Dificultad,
    tecnicasDominadas: [],
    recetasCompletadas: [],
  },
  intermedio: {
    nivel: 3 as Dificultad,
    tecnicasDominadas: ["control-fuego", "coccion-huevo"],
    recetasCompletadas: [1, 2, 6],
  },
  avanzado: {
    nivel: 5 as Dificultad,
    tecnicasDominadas: [
      "control-fuego",
      "coccion-huevo",
      "emulsion",
      "sellado",
      "reposo",
      "masa-quebrada",
    ],
    recetasCompletadas: [1, 2, 6, 7, 8, 11, 21],
  },
};

function loadRecetas(): Receta[] {
  const jsonPath = join(ROOT, "dist", "ensulugar.json");
  try {
    const raw = readFileSync(jsonPath, "utf-8");
    return (JSON.parse(raw) as { recetas: Receta[] }).recetas;
  } catch {
    // fallback: leer de markdown si el JSON no existe
    const rs = leerFichas(join(ROOT, "fichas"));
    for (const r of rs) r.tecnicas = tecnicasDeReceta(r);
    return rs;
  }
}

function sendJson(res: any, status: number, data: unknown) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(data));
}

function parseBody(req: any): Promise<string> {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk: Buffer) => (body += chunk.toString()));
    req.on("end", () => resolve(body));
  });
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const path = url.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (path === "/api/recetas" && req.method === "GET") {
    try {
      const recetas = loadRecetas();
      sendJson(res, 200, { recetas });
    } catch (err) {
      sendJson(res, 500, {
        error: "No se pudieron cargar las recetas.",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (path === "/api/leccion" && req.method === "POST") {
    try {
      const body = await parseBody(req);
      const payload = JSON.parse(body) as {
        recetaId?: number;
        perfilNombre?: string;
        perfil?: PerfilUsuario;
      };

      const recetas = loadRecetas();
      const receta = recetas.find((r) => r.id === payload.recetaId);
      if (!receta) {
        sendJson(res, 404, { error: `Receta id ${payload.recetaId} no encontrada.` });
        return;
      }

      const perfil =
        payload.perfil ??
        perfiles[payload.perfilNombre ?? "principiante"] ??
        perfiles.principiante;

      // Encontrar el paso de ruta para esta receta + técnica principal
      const ruta = armarRuta(perfil, recetas);
      const paso = ruta.find((p) => p.recetaVehiculo === receta.id) ?? {
        tecnicaId: receta.tecnicas[0] ?? "tecnica",
        nombre: receta.tecnicas[0] ?? "Técnica",
        recetaVehiculo: receta.id,
        nivel: perfil.nivel,
      };

      const config = loadConfig();
      const leccion = await generarLeccion(paso, receta, perfil);
      sendJson(res, 200, { leccion, provider: config.provider, model: config.model });
    } catch (err) {
      sendJson(res, 500, {
        error: "No se pudo generar la lección.",
        detail: err instanceof Error ? err.message : String(err),
      });
    }
    return;
  }

  if (path === "/api/health" && req.method === "GET") {
    sendJson(res, 200, { ok: true, recetas: loadRecetas().length });
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`[ensulugar-server] http://localhost:${PORT}`);
  console.log(`[ensulugar-server] endpoints: /api/recetas, /api/leccion, /api/health`);
});
