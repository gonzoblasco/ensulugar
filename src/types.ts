/**
 * EnSuLugar — Tipos de dominio
 *
 * El modelo de datos refleja la decisión A: cada ficha/receta es la semilla
 * de una lección. El tutor enseña técnicas y teoría usando la receta como vehículo.
 */

/** Dificultad en escala 1 (principiante) a 5 (avanzado). */
export type Dificultad = 1 | 2 | 3 | 4 | 5;

export interface Ingrediente {
  nombre: string;
  cantidad: string;
  unidad?: string | null;
  opcional?: boolean;
}

/** Un paso de una receta, con su "porqué" pedagógico (nota). */
export interface Paso {
  orden: number;
  instruccion: string;
  nota?: string;
}

/**
 * Una técnica es el concepto que se enseña. Cada receta es vehículo de una o
 * más técnicas. Es el nodo del grafo de prerrequisitos.
 */
export interface Tecnica {
  id: string; // slug: "emulsion", "roux", "sellado"...
  nombre: string;
  descripcion: string;
  /** Otras técnicas que deben dominarse antes. */
  prerrequisitos: string[];
  /** Nivel base de la técnica (0 = no requiere nivel previo). */
  nivelBase: Dificultad;
}

/**
 * Una receta completa. Es la fuente de verdad (markdown) materializada.
 * Es la semilla de una lección.
 */
export interface Receta {
  id: number;
  titulo: string;
  /** Título normalizado para mapeo curado (sin subtítulos entre paréntesis). */
  tituloClave?: string;
  descripcionCorta: string;
  dificultad: Dificultad;
  tiempoTotalMinutos: number;
  porciones: number;
  categoria: string;
  tags: string[];
  /** Técnicas que esta receta enseña/vehiculiza. */
  tecnicas: string[];
  ingredientes: Ingrediente[];
  pasos: Paso[];
}

/** Perfil del usuario: el estado que el motor usa para adaptar la ruta. */
export interface PerfilUsuario {
  /** Nivel global autodeclarado (1-5). */
  nivel: Dificultad;
  /** Técnicas que el usuario ya domina (id). */
  tecnicasDominadas: string[];
  /** Recetas ya completadas (id). */
  recetasCompletadas: number[];
  /** Objetivo declarado (opcional): técnica o nivel al que quiere llegar. */
  objetivo?: string;
}

/** Una técnica dentro de una ruta de aprendizaje. */
export interface PasoRuta {
  tecnicaId: string;
  nombre: string;
  /** Receta que sirve de vehículo para enseñar esta técnica. */
  recetaVehiculo: number; // receta id
  nivel: Dificultad;
}
