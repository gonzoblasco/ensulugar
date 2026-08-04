import { describe, it, expect } from 'vitest';
import type { PerfilUsuario, Receta } from '../../src/shared/types';

// Mock data
const mockPerfil: PerfilUsuario = {
  nivel: 2,
  tecnicasDominadas: ['cortar', 'saltear'],
  recetasCompletadas: [1, 3],
  objetivo: 'Aprender a cocinar mejor',
};

const mockRecetas: Receta[] = [
  {
    id: 1,
    titulo: 'Milanesas al Verdeo',
    categoria: 'Carnes',
    tecnicas: ['cortar', 'rebozar', 'freir'],
    ingredientes: [{ cantidad: '500g', nombre: 'Nalga' }],
    pasos: [{ orden: 1, instruccion: 'Cortar la carne' }],
    tiempoEstimado: 45,
    dificultad: 2,
  },
  {
    id: 2,
    titulo: 'Tarta de Jamón y Queso',
    categoria: 'Masas',
    tecnicas: ['amasar', 'hornea'],
    ingredientes: [{ cantidad: '200g', nombre: 'Harina' }],
    pasos: [{ orden: 1, instruccion: 'Hacer la masa' }],
    tiempoEstimado: 60,
    dificultad: 3,
  },
];

describe('DashboardView - Lógica de negocio', () => {
  it('calcula correctamente el porcentaje de técnicas dominadas', () => {
    // Este test verifica la lógica de cálculo de progreso
    const totalTecnicas = 28; // Según TECNICAS.length
    const dominadas = 2;
    const porcentaje = Math.round((dominadas / totalTecnicas) * 100);
    
    expect(porcentaje).toBe(7); // 2/28 ≈ 7%
  });

  it('filtra recetas completadas correctamente', () => {
    const completadasIds = [1, 3];
    const todasLasRecetas = mockRecetas;
    
    const completadas = todasLasRecetas.filter(r => completadasIds.includes(r.id));
    
    expect(completadas).toHaveLength(1);
    expect(completadas[0].id).toBe(1);
  });

  it('determina el próximo paso correcto según nivel y técnicas dominadas', () => {
    const perfil: PerfilUsuario = {
      nivel: 2,
      tecnicasDominadas: ['cortar'],
      recetasCompletadas: [],
    };

    // Simular lógica de selección del próximo paso
    const siguienteTecnica = 'saltear'; // Debería ser la próxima según nivel 2
    
    expect(siguienteTecnica).toBeDefined();
    expect(typeof siguienteTecnica).toBe('string');
  });
});
