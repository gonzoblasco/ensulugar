import type { PerfilUsuario } from "@shared/types.js";

const STORAGE_KEY = "ensulugar:perfil";

export function loadPerfil(): PerfilUsuario | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PerfilUsuario;
  } catch {
    return null;
  }
}

export function savePerfil(perfil: PerfilUsuario) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(perfil));
}

export function resetPerfil() {
  localStorage.removeItem(STORAGE_KEY);
}

export function defaultPerfil(): PerfilUsuario {
  return {
    nivel: 1,
    tecnicasDominadas: [],
    recetasCompletadas: [],
  };
}
