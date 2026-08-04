import { test, expect } from '@playwright/test';

test.describe('Quiz de Lecciones IA', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la home
    await page.goto('/');
    
    // Esperar a que cargue la app
    await expect(page.locator('#root')).toBeVisible();
    
    // Capturar screenshot inicial
    await page.screenshot({ path: 'test-results/screenshots/00-page-loaded.png' });
    
    // Log de consola
    page.on('console', msg => {
      console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
    });
  });

  test('genera una lección y muestra el quiz', async ({ page }) => {
    // Verificar que hay botones de lección
    const btnCount = await page.locator('.btn-lesson').count();
    console.log(`[DEBUG] Botones .btn-lesson encontrados: ${btnCount}`);
    await page.screenshot({ path: 'test-results/screenshots/01-before-click.png' });
    
    if (btnCount === 0) {
      // Quizás no hay recetas cargadas
      const recipeCards = await page.locator('.recipe-card').count();
      console.log(`[DEBUG] Recipe cards encontradas: ${recipeCards}`);
      await page.screenshot({ path: 'test-results/screenshots/01-no-recipes.png' });
    }
    
    // Click en "Generar lección con IA" en la primera receta
    const btnGenerar = page.locator('.btn-lesson').first();
    await btnGenerar.click();
    
    // Screenshot post-click
    await page.screenshot({ path: 'test-results/screenshots/02-after-click.png' });
    
    // Esperar a que aparezca el modal
    try {
      await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
      await page.screenshot({ path: 'test-results/screenshots/03-modal-visible.png' });
    } catch (error) {
      console.error('[ERROR] Modal no apareció');
      await page.screenshot({ path: 'test-results/screenshots/03-modal-not-found.png' });
      throw error;
    }
    
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
    await page.screenshot({ path: 'test-results/screenshots/x01-modal-open.png' });
    
    // Verificar que el botón X existe
    const btnCloseCount = await page.locator('.modal-close').count();
    console.log(`[DEBUG] Botones .modal-close encontrados: ${btnCloseCount}`);
    
    if (btnCloseCount > 0) {
      // Click en la X para cerrar
      await page.locator('.modal-close').click();
      await page.screenshot({ path: 'test-results/screenshots/x02-after-x-click.png' });
      
      // Verificar que el modal desapareció
      await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
      await page.screenshot({ path: 'test-results/screenshots/x03-modal-closed.png' });
    } else {
      console.error('[ERROR] No se encontró el botón de cierre');
      await page.screenshot({ path: 'test-results/screenshots/x02-no-close-button.png' });
      throw new Error('Botón de cierre no encontrado');
    }
  });

  test('cierra el modal haciendo click afuera', async ({ page }) => {
    // Generar lección
    await page.locator('.btn-lesson').first().click();
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/screenshots/o01-modal-open.png' });
    
    // Click en el overlay (área oscura) - en una esquina
    await page.locator('.modal-overlay').click({ position: { x: 50, y: 50 } });
    await page.screenshot({ path: 'test-results/screenshots/o02-after-overlay-click.png' });
    
    // Verificar que el modal desapareció
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/screenshots/o03-modal-closed.png' });
  });

  test('el teclado Escape cierra el modal', async ({ page }) => {
    // Generar lección
    await page.locator('.btn-lesson').first().click();
    await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: 'test-results/screenshots/e01-modal-open.png' });
    
    // Presionar Escape
    await page.keyboard.press('Escape');
    await page.screenshot({ path: 'test-results/screenshots/e02-after-escape.png' });
    
    // Verificar que el modal desapareció
    await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/screenshots/e03-modal-closed.png' });
  });
});
