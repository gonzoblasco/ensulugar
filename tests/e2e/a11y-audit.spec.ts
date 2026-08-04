import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('A11y Audit - EnSuLugar', () => {
  test('página principal sin violaciones críticas', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'])
      .analyze();
    
    console.log('=== A11Y AUDIT RESULTS ===');
    console.log(`URL: ${page.url()}`);
    console.log(`Total violations: ${results.violations.length}`);
    console.log(`Total passes: ${results.passes.length}`);
    console.log(`Total incomplete: ${results.incomplete.length}`);
    console.log(`Total inapplicable: ${results.inapplicable.length}`);
    
    // Violaciones por severidad
    const critical = results.violations.filter(v => v.impact === 'critical');
    const serious = results.violations.filter(v => v.impact === 'serious');
    const moderate = results.violations.filter(v => v.impact === 'moderate');
    const minor = results.violations.filter(v => v.impact === 'minor');
    
    console.log(`\n=== POR SEVERIDAD ===`);
    console.log(`Critical: ${critical.length}`);
    console.log(`Serious: ${serious.length}`);
    console.log(`Moderate: ${moderate.length}`);
    console.log(`Minor: ${minor.length}`);
    
    // Detalle de cada violación
    if (results.violations.length > 0) {
      console.log(`\n=== DETALLE DE VIOLACIONES ===`);
      results.violations.forEach((v, i) => {
        console.log(`\n[${i + 1}] ${v.id} - ${v.help} (${v.impact})`);
        console.log(`  WCAG: ${v.tags.filter(t => t.startsWith('wcag')).join(', ')}`);
        console.log(`  Description: ${v.description}`);
        console.log(`  Help URL: ${v.helpUrl}`);
        console.log(`  Elements: ${v.nodes.length}`);
        v.nodes.forEach((node, j) => {
          console.log(`    [${j + 1}] ${node.html.slice(0, 100)}`);
          console.log(`        Target: ${node.target.join(', ')}`);
        });
      });
    }
    
    // Calcular score
    const totalChecks = results.violations.length + results.passes.length;
    const score = totalChecks > 0 
      ? Math.round((results.passes.length / totalChecks) * 100) 
      : 100;
    
    console.log(`\n=== SCORE ===`);
    console.log(`Score: ${score}/100`);
    console.log(`Passes: ${results.passes.length}/${totalChecks}`);
    
    // No debe haber violaciones críticas
    expect(critical.length).toBe(0);
  });
  
  test('feedback modal sin violaciones', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
    
    // Abrir feedback modal
    const btnComplete = page.locator('.btn-complete').first();
    await btnComplete.click();
    
    await expect(page.locator('.feedback-overlay')).toBeVisible();
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();
    
    console.log('=== FEEDBACK MODAL AUDIT ===');
    console.log(`Violations: ${results.violations.length}`);
    
    results.violations.forEach((v, i) => {
      console.log(`[${i + 1}] ${v.id} - ${v.help} (${v.impact})`);
    });
    
    expect(results.violations.filter(v => v.impact === 'critical').length).toBe(0);
  });
  
  test('página de lección sin violaciones', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
    
    // Generar lección
    const btnLesson = page.locator('.btn-lesson').first();
    await btnLesson.click();
    
    // Esperar a que cargue la lección
    await expect(page.locator('.leccion-page')).toBeVisible({ timeout: 15000 });
    
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();
    
    console.log('=== LECCION PAGE AUDIT ===');
    console.log(`Violations: ${results.violations.length}`);
    
    results.violations.forEach((v, i) => {
      console.log(`[${i + 1}] ${v.id} - ${v.help} (${v.impact})`);
    });
    
    expect(results.violations.filter(v => v.impact === 'critical').length).toBe(0);
  });
});
