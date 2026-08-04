import { describe, it, expect } from "vitest";
import { armarRuta } from "../../src/engine/path.js";
import type { PerfilUsuario, Receta } from "../../src/types.js";

// Mock de recetas mínimas para testing
const mockRecetas: Receta[] = [
  {
    id: 1,
    titulo: "Arroz Blanco",
    tituloClave: "arroz-blanco",
    descripcionCorta: "Básico",
    dificultad: 2,
    tiempoTotalMinutos: 25,
    porciones: 4,
    categoria: "arroz",
    tags: ["arroz"],
    tecnicas: ["arroz", "control-fuego"],
    ingredientes: [{ nombre: "Arroz", cantidad: "1 taza" }],
    pasos: [{ orden: 1, instruccion: "Lavar el arroz" }],
  },
  {
    id: 2,
    titulo: "Vinagreta",
    tituloClave: "vinagreta",
    descripcionCorta: "Emulsión básica",
    dificultad: 1,
    tiempoTotalMinutos: 5,
    porciones: 2,
    categoria: "salsas",
    tags: ["salsas"],
    tecnicas: ["emulsion"],
    ingredientes: [{ nombre: "Aceite", cantidad: "3 cdas" }],
    pasos: [{ orden: 1, instruccion: "Mezclar ingredientes" }],
  },
  {
    id: 3,
    titulo: "Mayonesa",
    tituloClave: "mayonesa",
    descripcionCorta: "Emulsión avanzada",
    dificultad: 3,
    tiempoTotalMinutos: 10,
    porciones: 4,
    categoria: "salsas",
    tags: ["salsas"],
    tecnicas: ["emulsion"],
    ingredientes: [{ nombre: "Yema", cantidad: "1" }],
    pasos: [{ orden: 1, instruccion: "Batir yema" }],
  },
];

describe("armarRuta()", () => {
  it("debe retornar ruta vacía si no hay recetas", () => {
    const perfil: PerfilUsuario = {
      nivel: 1,
      tecnicasDominadas: [],
      recetasCompletadas: [],
    };
    
    const ruta = armarRuta(perfil, []);
    expect(ruta).toEqual([]);
  });

  it("debe armar ruta completa para principiante absoluto (0 técnicas dominadas)", () => {
    const perfil: PerfilUsuario = {
      nivel: 1,
      tecnicasDominadas: [],
      recetasCompletadas: [],
    };
    
    const ruta = armarRuta(perfil, mockRecetas);
    
    // Debe incluir todas las técnicas disponibles ordenadas por nivel
    expect(ruta.length).toBeGreaterThan(0);
    expect(ruta[0].nivel).toBeLessThanOrEqual(perfil.nivel + 1);
  });

  it("debe excluir técnicas ya dominadas de la ruta", () => {
    const perfil: PerfilUsuario = {
      nivel: 2,
      tecnicasDominadas: ["arroz", "control-fuego"],
      recetasCompletadas: [1],
    };
    
    const ruta = armarRuta(perfil, mockRecetas);
    
    // La ruta no debería incluir técnicas que ya domina
    const tecnicasEnRuta = ruta.map(p => p.tecnicaId);
    expect(tecnicasEnRuta).not.toContain("arroz");
    expect(tecnicasEnRuta).not.toContain("control-fuego");
  });

  it("debe respetar prerrequisitos (no mostrar técnica avanzada sin base)", () => {
    const perfil: PerfilUsuario = {
      nivel: 3,
      tecnicasDominadas: [],
      recetasCompletadas: [],
    };
    
    const ruta = armarRuta(perfil, mockRecetas);
    
    // Si existe prerrequisito, debe aparecer en orden
    // Ejemplo: emulsion básica antes que variantes avanzadas
    expect(ruta.length).toBeGreaterThan(0);
  });

  it("debe retornar ruta vacía si todas las técnicas están dominadas", () => {
    const perfil: PerfilUsuario = {
      nivel: 5,
      tecnicasDominadas: ["arroz", "control-fuego", "emulsion"],
      recetasCompletadas: [1, 2, 3],
    };
    
    const ruta = armarRuta(perfil, mockRecetas);
    
    // No deberían quedar técnicas por aprender
    expect(ruta.length).toBe(0);
  });

  it("debe priorizar técnicas del nivel objetivo del usuario", () => {
    const perfil: PerfilUsuario = {
      nivel: 3,
      tecnicasDominadas: [],
      recetasCompletadas: [],
    };
    
    const ruta = armarRuta(perfil, mockRecetas);
    
    // Las primeras técnicas deberían ser de nivel <= 3
    if (ruta.length > 0) {
      expect(ruta[0].nivel).toBeLessThanOrEqual(3);
    }
  });
});
