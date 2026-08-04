import { test, expect } from '@playwright/test';

test.describe('Quiz de Lecciones IA', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la home
    await page.goto('/');
    
    // Esperar a que cargue la app
    await expect(page.locator('#root')).toBeVisible();
  });

  test('genera una lección y muestra el quiz', async ({ page }) => {
    // Click en "Generar lección con IA" en la primera receta
    const btnGenerar = page.locator('.btn-lesson').first();
    await btnGenerar.click();
    
    // Esperar a que aparezca el modal
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
    
    // Esperar a que termine de cargar la lección
    await expect(page.locator('.loading-inline')).not.toBeVisible({ timeout: 15000 });
    
    // Verificar que aparece la sección del quiz
    const quizSection = page.locator('.quiz-section');
    await expect(quizSection).toBeVisible();
    
    // Verificar que hay al menos una pregunta
    const preguntas = quizSection.locator('.quiz-question');
    expect(await preguntas.count()).toBeGreaterThan(0);
  });

  test('interactúa con el quiz - respuesta correcta', async ({ page }) => {
    // Generar lección
    await page.locator('.btn-lesson').first().click();
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.loading-inline')).not.toBeVisible({ timeout: 15000 });
    
    // Buscar la primera pregunta y sus opciones
    const primerBotonOpcion = page.locator('.option-btn').first();
    
    // Hacer click en la primera opción
    await primerBotonOpcion.click();
    
    // Verificar que el botón se marca (correcto o incorrecto)
    const esCorrecto = await primerBotonOpcion.classList().then(classes => classes.includes('correct'));
    const esIncorrecto = await primerBotonOpcion.classList().then(classes => classes.includes('incorrect'));
    
    expect(esCorrecto || esIncorrecto).toBeTruthy();
    
    // Verificar que aparece la explicación
    const explicacion = page.locator('.explanation');
    await expect(explicacion).toBeVisible();
  });

  test('cierra el modal con la X', async ({ page }) => {
    // Generar lección
    await page.locator('.btn-lesson').first().click();
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
    
    // Click en la X para cerrar
    await page.locator('.modal-close').click();
    
    // Verificar que el modal desapareció
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
  });

  test('cierra el modal haciendo click afuera', async ({ page }) => {
    // Generar lección
    await page.locator('.btn-lesson').first().click();
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
    
    // Click en el overlay (área oscura)
    await page.locator('.modal-overlay').click({ position: { x: 50, y: 50 } });
    
    // Verificar que el modal desapareció
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
  });

  test('el teclado Escape cierra el modal', async ({ page }) => {
    // Generar lección
    await page.locator('.btn-lesson').first().click();
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
    
    // Presionar Escape
    await page.keyboard.press('Escape');
    
    // Verificar que el modal desapareció
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
  });
});
