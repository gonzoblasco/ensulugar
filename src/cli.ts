/**
 * EnSuLugar — CLI de prueba
 *
 * Uso:
 *   npx tsx src/cli.ts                      # muestra rutas para todos los perfiles
 *   npx tsx src/cli.ts --perfil principiante # muestra ruta para un perfil
 *   npx tsx src/cli.ts --perfil intermedio
 *   npx tsx src/cli.ts --perfil avanzado
 *   npx tsx src/cli.ts --leccion            # genera una lección con LLM
 */
import { leerFichas } from "./build/parser.js";
import { tecnicasDeReceta } from "./build/tecnicas-por-receta.js";
import { armarRuta, siguienteTecnica } from "./engine/path.js";
import { generarLeccion } from "./pedagogy/tutor.js";
import type { Dificultad, PerfilUsuario } from "./types.js";

const recetas = leerFichas("./fichas");
for (const r of recetas) r.tecnicas = tecnicasDeReceta(r);

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
    tecnicasDominadas: ["control-fuego", "coccion-huevo", "emulsion", "sellado", "reposo", "masa-quebrada"],
    recetasCompletadas: [1, 2, 6, 7, 8, 11, 21],
  },
};

const args = process.argv.slice(2);

function perfilDeArgs(): PerfilUsuario {
  const idx = args.indexOf("--perfil");
  if (idx >= 0 && args[idx + 1] && perfiles[args[idx + 1]]) {
    return perfiles[args[idx + 1]];
  }
  return perfiles.principiante;
}

if (args.includes("--leccion")) {
  const perfil = perfilDeArgs();
  const paso = siguienteTecnica(perfil, recetas);
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

  const leccion = await generarLeccion(paso, receta, perfil);
  console.log(leccion.contenido);
  console.log("\n=== Fin de la lección ===");
} else {
  console.log("=== EnSuLugar — Motor de Adaptación ===\n");
  console.log(`Recetas parseadas: ${recetas.length}`);

  const idx = args.indexOf("--perfil");
  if (idx >= 0 && args[idx + 1] && perfiles[args[idx + 1]]) {
    const nombre = args[idx + 1];
    const perfil = perfiles[nombre];
    const ruta = armarRuta(perfil, recetas);
    console.log(`\n--- Ruta para ${nombre} (nivel ${perfil.nivel}) ---`);
    console.table(ruta);
  } else {
    for (const [nombre, perfil] of Object.entries(perfiles)) {
      const ruta = armarRuta(perfil, recetas);
      console.log(`\n--- Ruta para ${nombre} (nivel ${perfil.nivel}) ---`);
      console.table(ruta);
    }
  }
}
