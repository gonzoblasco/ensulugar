# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: quiz.spec.ts >> Quiz de Lecciones IA >> cierra el modal con la X
- Location: tests/e2e/quiz.spec.ts:85:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.modal-overlay')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('.modal-overlay')

```

```yaml
- banner:
  - heading "Bienvenido 👋" [level=1]
  - paragraph: Tu progreso hacia el nivel 1
- text: 0/28 Técnicas dominadas 0/41 Recetas completadas Nivel 1 Objetivo ★☆☆☆☆
- heading "¿Qué sigue?" [level=2]
- text: 🎯 Cocción del huevo Nivel 1 ★☆☆☆☆
- button "Continuar aprendiendo"
- button "Ver toda tu ruta (9 técnicas)"
- heading "Accesos rápidos" [level=2]
- button "📖 Explorar recetas"
- button "🗺️ Ver ruta completa"
- button "🔄 Reiniciar progreso"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Quiz de Lecciones IA', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Ir a la home
  6   |     await page.goto('/');
  7   |     
  8   |     // Esperar a que cargue la app
  9   |     await expect(page.locator('#root')).toBeVisible();
  10  |     
  11  |     // Capturar screenshot inicial
  12  |     await page.screenshot({ path: 'test-results/screenshots/00-page-loaded.png' });
  13  |     
  14  |     // Log de consola
  15  |     page.on('console', msg => {
  16  |       console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  17  |     });
  18  |   });
  19  | 
  20  |   test('genera una lección y muestra el quiz', async ({ page }) => {
  21  |     // Verificar que hay botones de lección
  22  |     const btnCount = await page.locator('.btn-lesson').count();
  23  |     console.log(`[DEBUG] Botones .btn-lesson encontrados: ${btnCount}`);
  24  |     await page.screenshot({ path: 'test-results/screenshots/01-before-click.png' });
  25  |     
  26  |     if (btnCount === 0) {
  27  |       // Quizás no hay recetas cargadas
  28  |       const recipeCards = await page.locator('.recipe-card').count();
  29  |       console.log(`[DEBUG] Recipe cards encontradas: ${recipeCards}`);
  30  |       await page.screenshot({ path: 'test-results/screenshots/01-no-recipes.png' });
  31  |     }
  32  |     
  33  |     // Click en "Generar lección con IA" en la primera receta
  34  |     const btnGenerar = page.locator('.btn-lesson').first();
  35  |     await btnGenerar.click();
  36  |     
  37  |     // Screenshot post-click
  38  |     await page.screenshot({ path: 'test-results/screenshots/02-after-click.png' });
  39  |     
  40  |     // Esperar a que aparezca el modal
  41  |     try {
  42  |       await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
  43  |       await page.screenshot({ path: 'test-results/screenshots/03-modal-visible.png' });
  44  |     } catch (error) {
  45  |       console.error('[ERROR] Modal no apareció');
  46  |       await page.screenshot({ path: 'test-results/screenshots/03-modal-not-found.png' });
  47  |       throw error;
  48  |     }
  49  |     
  50  |     // Esperar a que termine de cargar la lección
  51  |     await expect(page.locator('.loading-inline')).not.toBeVisible({ timeout: 15000 });
  52  |     
  53  |     // Verificar que aparece la sección del quiz
  54  |     const quizSection = page.locator('.quiz-section');
  55  |     await expect(quizSection).toBeVisible();
  56  |     
  57  |     // Verificar que hay al menos una pregunta
  58  |     const preguntas = quizSection.locator('.quiz-question');
  59  |     expect(await preguntas.count()).toBeGreaterThan(0);
  60  |   });
  61  | 
  62  |   test('interactúa con el quiz - respuesta correcta', async ({ page }) => {
  63  |     // Generar lección
  64  |     await page.locator('.btn-lesson').first().click();
  65  |     await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
  66  |     await expect(page.locator('.loading-inline')).not.toBeVisible({ timeout: 15000 });
  67  |     
  68  |     // Buscar la primera pregunta y sus opciones
  69  |     const primerBotonOpcion = page.locator('.option-btn').first();
  70  |     
  71  |     // Hacer click en la primera opción
  72  |     await primerBotonOpcion.click();
  73  |     
  74  |     // Verificar que el botón se marca (correcto o incorrecto)
  75  |     const esCorrecto = await primerBotonOpcion.classList().then(classes => classes.includes('correct'));
  76  |     const esIncorrecto = await primerBotonOpcion.classList().then(classes => classes.includes('incorrect'));
  77  |     
  78  |     expect(esCorrecto || esIncorrecto).toBeTruthy();
  79  |     
  80  |     // Verificar que aparece la explicación
  81  |     const explicacion = page.locator('.explanation');
  82  |     await expect(explicacion).toBeVisible();
  83  |   });
  84  | 
  85  |   test('cierra el modal con la X', async ({ page }) => {
  86  |     // Generar lección
  87  |     await page.locator('.btn-lesson').first().click();
> 88  |     await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
      |                                                  ^ Error: expect(locator).toBeVisible() failed
  89  |     await page.screenshot({ path: 'test-results/screenshots/x01-modal-open.png' });
  90  |     
  91  |     // Verificar que el botón X existe
  92  |     const btnCloseCount = await page.locator('.modal-close').count();
  93  |     console.log(`[DEBUG] Botones .modal-close encontrados: ${btnCloseCount}`);
  94  |     
  95  |     if (btnCloseCount > 0) {
  96  |       // Click en la X para cerrar
  97  |       await page.locator('.modal-close').click();
  98  |       await page.screenshot({ path: 'test-results/screenshots/x02-after-x-click.png' });
  99  |       
  100 |       // Verificar que el modal desapareció
  101 |       await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
  102 |       await page.screenshot({ path: 'test-results/screenshots/x03-modal-closed.png' });
  103 |     } else {
  104 |       console.error('[ERROR] No se encontró el botón de cierre');
  105 |       await page.screenshot({ path: 'test-results/screenshots/x02-no-close-button.png' });
  106 |       throw new Error('Botón de cierre no encontrado');
  107 |     }
  108 |   });
  109 | 
  110 |   test('cierra el modal haciendo click afuera', async ({ page }) => {
  111 |     // Generar lección
  112 |     await page.locator('.btn-lesson').first().click();
  113 |     await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
  114 |     await page.screenshot({ path: 'test-results/screenshots/o01-modal-open.png' });
  115 |     
  116 |     // Click en el overlay (área oscura) - en una esquina
  117 |     await page.locator('.modal-overlay').click({ position: { x: 50, y: 50 } });
  118 |     await page.screenshot({ path: 'test-results/screenshots/o02-after-overlay-click.png' });
  119 |     
  120 |     // Verificar que el modal desapareció
  121 |     await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
  122 |     await page.screenshot({ path: 'test-results/screenshots/o03-modal-closed.png' });
  123 |   });
  124 | 
  125 |   test('el teclado Escape cierra el modal', async ({ page }) => {
  126 |     // Generar lección
  127 |     await page.locator('.btn-lesson').first().click();
  128 |     await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 10000 });
  129 |     await page.screenshot({ path: 'test-results/screenshots/e01-modal-open.png' });
  130 |     
  131 |     // Presionar Escape
  132 |     await page.keyboard.press('Escape');
  133 |     await page.screenshot({ path: 'test-results/screenshots/e02-after-escape.png' });
  134 |     
  135 |     // Verificar que el modal desapareció
  136 |     await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 });
  137 |     await page.screenshot({ path: 'test-results/screenshots/e03-modal-closed.png' });
  138 |   });
  139 | });
  140 | 
```