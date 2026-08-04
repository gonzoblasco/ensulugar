/**
 * EnSuLugar — Algoritmo de ruta de aprendizaje
 *
 * A partir del grafo de prerrequisitos y el perfil del usuario, arma la
 * secuencia de técnicas a aprender, cada una con su receta vehículo.
 *
 * Determinístico: no usa LLM. Es testeable y predecible.
 */
import type { Dificultad, PasoRuta, PerfilUsuario, Receta } from "../types.js";
import { ordenTopologico } from "./graph.js";

/**
 * Asigna a cada técnica la receta que mejor la vehiculiza.
 * Regla v2: preferir recetas "puras" (pocas técnicas) y de menor dificultad.
 * Si la técnica está en el título o descripción, le suma puntos.
 *
 * En v3 esto podría venir del frontmatter de las fichas.
 */
function recetaVehiculo(tecnicaId: string, recetas: Receta[]): Receta | undefined {
  const candidatas = recetas.filter((r) => r.tecnicas.includes(tecnicaId));
  if (candidatas.length === 0) return undefined;

  const keywords: Record<string, string[]> = {
    emulsion: ["emulsion", "vinagreta", "mayonesa", "holandesa", "carbonara", "cacio"],
    roux: ["roux", "bechamel"],
    sellado: ["sellado", "bife", "maillard"],
    deglaseado: ["deglaseado", "salsa de sartén"],
    reposo: ["reposo", "horno", "bife"],
    "coccion-huevo": ["huevo", "frito", "poché", "revuelto", "tortilla", "omelette"],
    "control-fuego": ["fuego", "sartén", "horno"],
    "masa-quebrada": ["quebrada", "pâte", "tarta"],
    fermentacion: ["fermentación", "levadura", "pan", "pizza"],
    blanqueado: ["blanqueado", "choque"],
  };

  const palabras = keywords[tecnicaId] ?? [tecnicaId];

  function score(r: Receta): number {
    const pureza = 10 - r.tecnicas.length * 2; // menos técnicas = más pura
    const dificultad = 10 - r.dificultad;
    const tituloMatch = palabras.some((p) => r.titulo.toLowerCase().includes(p)) ? 5 : 0;
    const descMatch = palabras.some((p) =>
      r.descripcionCorta.toLowerCase().includes(p),
    )
      ? 2
      : 0;
    return pureza + dificultad + tituloMatch + descMatch;
  }

  return [...candidatas].sort((a, b) => score(b) - score(a))[0];
}

/**
 * Arma la ruta de aprendizaje completa para un usuario.
 *
 * - Ordena las técnicas por prerrequisitos (bases primero).
 * - Filtra las que el usuario ya domina.
 * - Respeta el nivel del usuario (no propone técnicas por encima de su nivel).
 * - Asigna receta vehículo a cada técnica.
 */
export function armarRuta(
  perfil: PerfilUsuario,
  recetas: Receta[],
  limiteNivel?: Dificultad,
): PasoRuta[] {
  const tope = limiteNivel ?? perfil.nivel;

  const disponibles = ordenTopologico(perfil.tecnicasDominadas).filter(
    (t) => t.nivelBase <= tope,
  );

  const ruta: PasoRuta[] = [];

  for (const tecnica of disponibles) {
    const vehiculo = recetaVehiculo(tecnica.id, recetas);
    if (!vehiculo) continue;

    ruta.push({
      tecnicaId: tecnica.id,
      nombre: tecnica.nombre,
      recetaVehiculo: vehiculo.id,
      nivel: tecnica.nivelBase,
    });
  }

  return ruta;
}

/** Devuelve la siguiente técnica recomendada (la primera no dominada, base primero). */
export function siguienteTecnica(
  perfil: PerfilUsuario,
  recetas: Receta[],
): PasoRuta | null {
  const ruta = armarRuta(perfil, recetas);
  return ruta[0] ?? null;
}
