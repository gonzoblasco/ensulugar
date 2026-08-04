/**
 * EnSuLugar — Grafo de prerrequisitos (determinístico)
 *
 * Modela las técnicas culinarias como nodos y sus dependencias como aristas.
 * El tutor usa este grafo para NO enseñar una técnica avanzada sin sus bases,
 * y para armar rutas coherentes de "principiante → masterchef".
 *
 * Este módulo NO depende del LLM: es lógica pura, testeable y predecible.
 */
import type { Dificultad, Tecnica } from "../types.js";

/**
 * Catálogo de técnicas. Este es el conocimiento estructural del dominio.
 * Se alimenta de las fichas markdown (fuente de verdad) pero la estructura
 * de prerrequisitos vive acá como dato curado.
 */
export const TECNICAS: Tecnica[] = [
  {
    id: "coccion-huevo",
    nombre: "Cocción del huevo",
    descripcion: "Temperaturas y tiempos para clara y yema en su punto.",
    prerrequisitos: [],
    nivelBase: 1,
  },
  {
    id: "emulsion",
    nombre: "Emulsión",
    descripcion: "Mezclar dos líquidos que no se llevan (aceite y agua) con estabilidad.",
    prerrequisitos: [],
    nivelBase: 1,
  },
  {
    id: "roux",
    nombre: "Roux",
    descripcion: "Harina + grasa como base espesante de salsas.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 2,
  },
  {
    id: "sellado",
    nombre: "Sellado (Maillard)",
    descripcion: "Dorar la superficie a fuego alto para concentrar sabor.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 2,
  },
  {
    id: "deglaseado",
    nombre: "Deglaseado",
    descripcion: "Despegar el fondo dorado del sartén con líquido para hacer salsa.",
    prerrequisitos: ["sellado"],
    nivelBase: 3,
  },
  {
    id: "reposo",
    nombre: "Reposo de la carne",
    descripcion: "Dejar descansar la carne para redistribuir jugos.",
    prerrequisitos: [],
    nivelBase: 1,
  },
  {
    id: "masa-quebrada",
    nombre: "Masa quebrada (manteca fría)",
    descripcion: "Manteca fría + no amasar = textura quebrada.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 3,
  },
  {
    id: "fermentacion",
    nombre: "Fermentación / levado",
    descripcion: "Tiempos y temperatura para desarrollar sabor y textura en masas.",
    prerrequisitos: ["masa-quebrada"],
    nivelBase: 3,
  },
  {
    id: "control-fuego",
    nombre: "Control de fuego y temperatura",
    descripcion: "Saber cuándo el fuego está alto, medio o bajo y qué hace cada uno.",
    prerrequisitos: [],
    nivelBase: 1,
  },
  {
    id: "blanqueado",
    nombre: "Blanqueado y choque térmico",
    descripcion: "Hervir breve + agua helada para fijar color y textura.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 1,
  },
  {
    id: "salsa-tomate",
    nombre: "Salsa de tomate base",
    descripcion: "Cocción lenta de tomate con aromáticos como base universal.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 2,
  },
  {
    id: "marinada",
    nombre: "Marinada y adobo",
    descripcion: "Cuándo usar marinada ácida vs adobo seco según el corte.",
    prerrequisitos: ["sellado"],
    nivelBase: 2,
  },
  {
    id: "salteado-wok",
    nombre: "Salteado wok",
    descripcion: "Cocción rápida a fuego máximo con movimiento constante.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 2,
  },
  {
    id: "asado-horno",
    nombre: "Asado al horno",
    descripcion: "Cocción con calor seco, una sola capa, sin mover hasta caramelizar.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 1,
  },
  {
    id: "pollo-horno",
    nombre: "Pollo al horno",
    descripcion: "Piel crocante, carne jugosa: temperatura inicial alta + reposo.",
    prerrequisitos: ["asado-horno", "reposo"],
    nivelBase: 2,
  },
  {
    id: "basting",
    nombre: "Basting (bañar con manteca)",
    descripcion: "Bañar la carne con manteca derretida para sabor y humedad.",
    prerrequisitos: ["sellado"],
    nivelBase: 3,
  },
  {
    id: "pizza",
    nombre: "Masa de pizza",
    descripcion: "Hidratación alta, reposo en frío, estirado a mano.",
    prerrequisitos: ["fermentacion"],
    nivelBase: 3,
  },
  {
    id: "pan-casero",
    nombre: "Pan casero",
    descripcion: "4 ingredientes, amasado, tiempos de levado.",
    prerrequisitos: ["fermentacion"],
    nivelBase: 3,
  },
  {
    id: "cuchillo",
    nombre: "Técnicas de corte",
    descripcion: "Juliana, brunoise, chiffonade, rodajas, cubos. La base de toda preparación.",
    prerrequisitos: [],
    nivelBase: 1,
  },
  {
    id: "arroz",
    nombre: "Cocción de arroz",
    descripcion: "Método de absorción: proporción agua/arroz, tiempos, reposo tapado.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 1,
  },
  {
    id: "fritura",
    nombre: "Fritura profunda",
    descripcion: "Temperatura del aceite, empanizado, punto exacto, escurrido.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 2,
  },
  {
    id: "huevo-duro",
    nombre: "Huevo duro perfecto",
    descripcion: "Tiempos exactos, choque térmico, punto de cocción de la yema.",
    prerrequisitos: ["coccion-huevo"],
    nivelBase: 1,
  },
  {
    id: "risotto",
    nombre: "Risotto",
    descripcion: "Arroz cremoso: mantecatura, caldo caliente, movimiento constante.",
    prerrequisitos: ["arroz", "control-fuego"],
    nivelBase: 3,
  },
  {
    id: "braseado",
    nombre: "Braseado",
    descripcion: "Cocción lenta de cortes duros en líquido, tapado, a baja temperatura.",
    prerrequisitos: ["sellado", "control-fuego"],
    nivelBase: 3,
  },
  {
    id: "encurtido",
    nombre: "Encurtido rápido",
    descripcion: "Vegetales en vinagre, sal y azúcar. Pickles rápidos sin fermentación.",
    prerrequisitos: ["cuchillo"],
    nivelBase: 2,
  },
  {
    id: "caramelo",
    nombre: "Caramelo",
    descripcion: "Caramelo seco (azúcar sola) y húmedo (azúcar + agua). Punto justo.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 2,
  },
  {
    id: "crema-pastelera",
    nombre: "Crema pastelera",
    descripcion: "Leche, huevos, azúcar, almidón. Base de postres.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 3,
  },
  {
    id: "hojaldre",
    nombre: "Hojaldre",
    descripcion: "Laminado de manteca entre capas de masa. Cocción al vapor.",
    prerrequisitos: ["masa-quebrada", "control-fuego"],
    nivelBase: 4,
  },
  {
    id: "masa-madre",
    nombre: "Masa madre",
    descripcion: "Fermentación natural sin levadura comercial. Alimentación y mantenimiento.",
    prerrequisitos: ["fermentacion"],
    nivelBase: 4,
  },
  {
    id: "confit",
    nombre: "Confit",
    descripcion: "Cocción lenta en grasa a baja temperatura. Textura confitada.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 4,
  },
  {
    id: "sous-vide",
    nombre: "Sous-vide",
    descripcion: "Cocción al vacío en baño María a temperatura controlada.",
    prerrequisitos: ["sellado", "control-fuego"],
    nivelBase: 4,
  },
  {
    id: "merengue",
    nombre: "Merengue",
    descripcion: "Claras de huevo + azúcar. Francés, italiano, suizo.",
    prerrequisitos: ["control-fuego"],
    nivelBase: 3,
  },
];

/** Índice rápido por id. */
export const tecnicaPorId = new Map(TECNICAS.map((t) => [t.id, t]));

/**
 * Devuelve las técnicas que el usuario ya puede aprender dado su nivel y las
 * técnicas que domina (las que tienen todos sus prerrequisitos cumplidos).
 */
export function tecnicasDisponibles(dominadas: string[], nivel: Dificultad): Tecnica[] {
  const dominado = new Set(dominadas);
  return TECNICAS.filter((t) => {
    const preReqsOk = t.prerrequisitos.every((p) => dominado.has(p));
    return preReqsOk && t.nivelBase <= nivel && !dominado.has(t.id);
  });
}

/**
 * Orden topológico del grafo: devuelve las técnicas en orden de aprendizaje
 * (bases primero). Respetando prerrequisitos. No incluye ya dominadas.
 */
export function ordenTopologico(dominadas: string[] = []): Tecnica[] {
  const dominado = new Set(dominadas);
  const visitado = new Set<string>();
  const orden: Tecnica[] = [];

  function visitar(id: string) {
    if (visitado.has(id)) return;
    visitado.add(id);
    const t = tecnicaPorId.get(id);
    if (!t) return;
    for (const pre of t.prerrequisitos) visitar(pre);
    if (!dominado.has(id)) orden.push(t);
  }

  for (const t of TECNICAS) visitar(t.id);
  return orden;
}
