/**
 * EnSuLugar — Mapeo curado: receta → técnicas que enseña
 *
 * Cada receta es vehículo de una o más técnicas. Este mapeo es curado
 * (a mano), porque es conocimiento estructural del dominio que no se puede
 * inferir de forma confiable con regex.
 *
 * v1: mapeo por título normalizado (sin subtítulos entre paréntesis).
 * Cuando el contenido crezca, se puede mover a frontmatter en las fichas
 * markdown (fuente de verdad única).
 */
export const TECNICAS_POR_RECETA: Record<string, string[]> = {
  // Huevos
  "Huevo Frito Perfecto": ["coccion-huevo", "control-fuego"],
  "Huevo Poché": ["coccion-huevo", "control-fuego"],
  "Revuelto Cremoso": ["coccion-huevo", "control-fuego"],
  "Tortilla Francesa": ["coccion-huevo", "control-fuego"],
  Omelette: ["coccion-huevo", "control-fuego"],

  // Pastas
  "Cacio e Pepe": ["emulsion"],
  "Spaghetti Aglio e Olio": ["emulsion", "control-fuego"],
  Carbonara: ["emulsion"],

  // Salsas
  Bechamel: ["roux"],
  "Salsa de Tomate Base": ["salsa-tomate", "control-fuego"],
  "Vinagreta Clásica Emulsionada": ["emulsion"],
  "Mayonesa Casera": ["emulsion"],
  "Salsa Holandesa": ["emulsion"],

  // Carnes
  "Bife a la Plancha — Punto Perfecto": ["sellado", "reposo", "control-fuego"],
  "Sellado Perfecto + Salsa de Sartén": ["sellado", "deglaseado", "basting", "reposo"],
  "Pollo al Horno — Piel Crocante, Carne Jugosa": ["pollo-horno", "reposo", "control-fuego"],
  "Marinada vs Adobo Seco": ["marinada", "sellado"],

  // Vegetales
  "Salteado Wok — Vegetales": ["salteado-wok", "control-fuego"],
  "Vegetales Asados al Horno": ["asado-horno", "control-fuego"],
  "Blanqueado y Choque Térmico": ["blanqueado"],

  // Masas
  "Masa de Tarta Quebrada": ["masa-quebrada", "control-fuego"],
  "Pan Casero — 4 Ingredientes": ["pan-casero", "fermentacion", "masa-quebrada"],
  "Masa de Pizza": ["pizza", "fermentacion", "masa-quebrada"],

  // Nuevas — Prioridad 1
  "Corte Juliana — Bastones Finos": ["cuchillo"],
  "Corte Brunoise — Cubos Pequeños": ["cuchillo"],
  "Corte Chiffonade — Tiras Finas de Hojas": ["cuchillo"],
  "Arroz Blanco Perfecto — Método de Absorción": ["arroz", "control-fuego"],
  "Arroz Pilaf — Arroz Sofrito": ["arroz", "control-fuego"],
  "Milanesa de Carne — Empanizado y Fritura Perfecta": ["fritura", "control-fuego"],
  "Papas Fritas — Doble Cocción": ["fritura", "control-fuego"],
  "Huevo Duro — Tiempos Exactos": ["huevo-duro", "coccion-huevo"],

  // Prioridad 2
  "Risotto Clásico — Mantecatura Perfecta": ["risotto", "arroz", "control-fuego"],
  "Risotto de Hongos": ["risotto", "arroz", "control-fuego"],
  "Osobuco Braseado — Cocción Lenta": ["braseado", "sellado", "deglaseado", "control-fuego"],
  "Cebolla Morada en Escabeche Rápido": ["encurtido", "cuchillo"],
  "Pepinos en Pickle Rápido": ["encurtido", "cuchillo"],
  "Caramelo Seco — Azúcar Sola": ["caramelo", "control-fuego"],
  "Caramelo Húmedo — Azúcar + Agua": ["caramelo", "control-fuego"],
  "Crema Pastelera Clásica": ["crema-pastelera", "control-fuego"],
};

/** Asigna técnicas a una receta por su título (o título clave normalizado). */
export function tecnicasDeReceta(receta: { titulo: string; tituloClave?: string }): string[] {
  const clave = receta.tituloClave ?? receta.titulo;
  return TECNICAS_POR_RECETA[clave] ?? [];
}
