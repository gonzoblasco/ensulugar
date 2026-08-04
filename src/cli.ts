/**
 * EnSuLugar — CLI de prueba
 *
 * Uso:
 *   npx tsx src/cli.ts                    # muestra rutas
 *   npx tsx src/cli.ts --leccion          # genera una lección con LLM
 *   npx tsx src/cli.ts --leccion <id>     # lección para una receta específica
 */
import { leerFichas } from "./build/parser.js";
import { tecnicasDeReceta } from "./build/tecnicas-por-receta.js";
import { armarRuta, siguienteTecnica } from "./engine/path.js";
import { generarLeccion } from "./pedagogy/tutor.js";
import type { PerfilUsuario } from "./types.js";

const recetas = leerFichas("./fichas");
for (const r of recetas) r.tecnicas = tecnicasDeReceta(r);

const perfilPrincipiante: PerfilUsuario = {
  nivel: 1,
  tecnicasDominadas: [],
  recetasCompletadas: [],
};

const perfilIntermedio: PerfilUsuario = {
  nivel: 3,
  tecnicasDominadas: ["control-fuego", "coccion-huevo"],
  recetasCompletadas: [1, 2, 6],
};

const args = process.argv.slice(2);

if (args.includes("--leccion")) {
  // Generar lección
  const paso = siguienteTecnica(perfilPrincipiante, recetas);
  if (!paso) {
    console.log("No hay técnicas disponibles para este perfil.");
    process.exit(0);
  }

  const receta = recetas.find((r) => r.id === paso.recetaVehiculo);
  if (!receta) {
    console.log(`Receta id ${paso.recetaVehiculo} no encontrada.`);
    process.exit(1);
  }

  console.log(`\n=== Generando lección: ${paso.nombre} ===`);
  console.log(`Receta vehículo: ${receta.titulo}\n`);

  const leccion = await generarLeccion(paso, receta, perfilPrincipiante);
  console.log(leccion.contenido);
  console.log("\n=== Fin de la lección ===");
} else {
  console.log("=== EnSuLugar — Motor de Adaptación ===\n");
  console.log(`Recetas parseadas: ${recetas.length}`);

  console.log("\n--- Ruta para principiante (nivel 1) ---");
  console.table(armarRuta(perfilPrincipiante, recetas));

  console.log("\n--- Siguiente paso para intermedio (nivel 3) ---");
  console.log(siguienteTecnica(perfilIntermedio, recetas));

  console.log("\n--- Ruta completa para intermedio (nivel 3) ---");
  console.table(armarRuta(perfilIntermedio, recetas));
}
