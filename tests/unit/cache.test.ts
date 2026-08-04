import { describe, it, expect } from "vitest";
import { hashTecnicas } from "../../src/pedagogy/cache.js";

describe("cache.ts - hashTecnicas()", () => {
  it("debe generar hash consistente para mismas técnicas", () => {
    const hash1 = hashTecnicas(["emulsion", "control-fuego"]);
    const hash2 = hashTecnicas(["emulsion", "control-fuego"]);
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(16);
  });

  it("debe ignorar el orden de las técnicas (sort interno)", () => {
    const hash1 = hashTecnicas(["emulsion", "control-fuego"]);
    const hash2 = hashTecnicas(["control-fuego", "emulsion"]);
    expect(hash1).toBe(hash2);
  });

  it("debe retornar hash diferente para técnicas diferentes", () => {
    const hash1 = hashTecnicas(["emulsion"]);
    const hash2 = hashTecnicas(["control-fuego"]);
    expect(hash1).not.toBe(hash2);
  });

  it("debe manejar array vacío", () => {
    const hash = hashTecnicas([]);
    expect(hash).toHaveLength(16);
    expect(typeof hash).toBe("string");
  });

  it("debe ser case-sensitive", () => {
    const hash1 = hashTecnicas(["Emulsion"]);
    const hash2 = hashTecnicas(["emulsion"]);
    expect(hash1).not.toBe(hash2);
  });

  it("debe manejar técnicas con guiones", () => {
    const hash = hashTecnicas(["control-fuego", "masa-quebrada"]);
    expect(hash).toHaveLength(16);
    expect(hash).toMatch(/^[0-9a-f]+$/); // Hex string
  });
});

// Nota: Los tests de save/getLeccionFromCache requieren integración con SQLite
// Se implementarán en tests/integration/cache.integration.test.ts
