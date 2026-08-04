# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y-audit.spec.ts >> A11y Audit - EnSuLugar >> feedback modal sin violaciones
- Location: tests/e2e/a11y-audit.spec.ts:62:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.btn-complete').first()

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Saltar al contenido" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - heading "Bienvenido a EnSuLugar" [level=1] [ref=e5]
    - paragraph [ref=e6]: Armá tu perfil para que la ruta de aprendizaje se adapte a vos.
    - generic [ref=e7]:
      - generic [ref=e8]: Tu nombre (opcional)
      - textbox "Tu nombre (opcional)" [ref=e9]:
        - /placeholder: Gonzo
    - generic [ref=e10]:
      - generic [ref=e11]: ¿Hasta qué nivel querés llegar?
      - combobox "¿Hasta qué nivel querés llegar?" [ref=e12]:
        - option "Nivel 1 ★☆☆☆☆ — Principiante" [selected]
        - option "Nivel 2 ★★☆☆☆ — En progreso"
        - option "Nivel 3 ★★★☆☆ — Intermedio"
        - option "Nivel 4 ★★★★☆ — En progreso"
        - option "Nivel 5 ★★★★★ — Avanzado"
    - generic [ref=e13]:
      - generic [ref=e14]: ¿Qué técnicas ya dominás? ( marcá las que sepas hacer con confianza )
      - generic [ref=e15]:
        - button "Cocción del huevo ★☆☆☆☆" [ref=e16] [cursor=pointer]
        - button "Emulsión ★☆☆☆☆" [ref=e17] [cursor=pointer]
        - button "Roux ★★☆☆☆" [ref=e18] [cursor=pointer]
        - button "Sellado (Maillard) ★★☆☆☆" [ref=e19] [cursor=pointer]
        - button "Deglaseado ★★★☆☆" [ref=e20] [cursor=pointer]
        - button "Reposo de la carne ★☆☆☆☆" [ref=e21] [cursor=pointer]
        - button "Masa quebrada (manteca fría) ★★★☆☆" [ref=e22] [cursor=pointer]
        - button "Fermentación / levado ★★★☆☆" [ref=e23] [cursor=pointer]
        - button "Control de fuego y temperatura ★☆☆☆☆" [ref=e24] [cursor=pointer]
        - button "Blanqueado y choque térmico ★☆☆☆☆" [ref=e25] [cursor=pointer]
        - button "Salsa de tomate base ★★☆☆☆" [ref=e26] [cursor=pointer]
        - button "Marinada y adobo ★★☆☆☆" [ref=e27] [cursor=pointer]
        - button "Salteado wok ★★☆☆☆" [ref=e28] [cursor=pointer]
        - button "Asado al horno ★☆☆☆☆" [ref=e29] [cursor=pointer]
        - button "Pollo al horno ★★☆☆☆" [ref=e30] [cursor=pointer]
        - button "Basting (bañar con manteca) ★★★☆☆" [ref=e31] [cursor=pointer]
        - button "Masa de pizza ★★★☆☆" [ref=e32] [cursor=pointer]
        - button "Pan casero ★★★☆☆" [ref=e33] [cursor=pointer]
        - button "Técnicas de corte ★☆☆☆☆" [ref=e34] [cursor=pointer]
        - button "Cocción de arroz ★☆☆☆☆" [ref=e35] [cursor=pointer]
        - button "Fritura profunda ★★☆☆☆" [ref=e36] [cursor=pointer]
        - button "Huevo duro perfecto ★☆☆☆☆" [ref=e37] [cursor=pointer]
        - button "Risotto ★★★☆☆" [ref=e38] [cursor=pointer]
        - button "Braseado ★★★☆☆" [ref=e39] [cursor=pointer]
        - button "Encurtido rápido ★★☆☆☆" [ref=e40] [cursor=pointer]
        - button "Caramelo ★★☆☆☆" [ref=e41] [cursor=pointer]
        - button "Crema pastelera ★★★☆☆" [ref=e42] [cursor=pointer]
        - button "Hojaldre ★★★★☆" [ref=e43] [cursor=pointer]
    - generic [ref=e44]:
      - button "Empezar a aprender" [ref=e45] [cursor=pointer]
      - button "Saltear por ahora" [ref=e46] [cursor=pointer]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import AxeBuilder from '@axe-core/playwright';
  3   | 
  4   | test.describe('A11y Audit - EnSuLugar', () => {
  5   |   test('página principal sin violaciones críticas', async ({ page }) => {
  6   |     await page.goto('/');
  7   |     await expect(page.locator('#root')).toBeVisible();
  8   |     
  9   |     const results = await new AxeBuilder({ page })
  10  |       .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa', 'best-practice'])
  11  |       .analyze();
  12  |     
  13  |     console.log('=== A11Y AUDIT RESULTS ===');
  14  |     console.log(`URL: ${page.url()}`);
  15  |     console.log(`Total violations: ${results.violations.length}`);
  16  |     console.log(`Total passes: ${results.passes.length}`);
  17  |     console.log(`Total incomplete: ${results.incomplete.length}`);
  18  |     console.log(`Total inapplicable: ${results.inapplicable.length}`);
  19  |     
  20  |     // Violaciones por severidad
  21  |     const critical = results.violations.filter(v => v.impact === 'critical');
  22  |     const serious = results.violations.filter(v => v.impact === 'serious');
  23  |     const moderate = results.violations.filter(v => v.impact === 'moderate');
  24  |     const minor = results.violations.filter(v => v.impact === 'minor');
  25  |     
  26  |     console.log(`\n=== POR SEVERIDAD ===`);
  27  |     console.log(`Critical: ${critical.length}`);
  28  |     console.log(`Serious: ${serious.length}`);
  29  |     console.log(`Moderate: ${moderate.length}`);
  30  |     console.log(`Minor: ${minor.length}`);
  31  |     
  32  |     // Detalle de cada violación
  33  |     if (results.violations.length > 0) {
  34  |       console.log(`\n=== DETALLE DE VIOLACIONES ===`);
  35  |       results.violations.forEach((v, i) => {
  36  |         console.log(`\n[${i + 1}] ${v.id} - ${v.help} (${v.impact})`);
  37  |         console.log(`  WCAG: ${v.tags.filter(t => t.startsWith('wcag')).join(', ')}`);
  38  |         console.log(`  Description: ${v.description}`);
  39  |         console.log(`  Help URL: ${v.helpUrl}`);
  40  |         console.log(`  Elements: ${v.nodes.length}`);
  41  |         v.nodes.forEach((node, j) => {
  42  |           console.log(`    [${j + 1}] ${node.html.slice(0, 100)}`);
  43  |           console.log(`        Target: ${node.target.join(', ')}`);
  44  |         });
  45  |       });
  46  |     }
  47  |     
  48  |     // Calcular score
  49  |     const totalChecks = results.violations.length + results.passes.length;
  50  |     const score = totalChecks > 0 
  51  |       ? Math.round((results.passes.length / totalChecks) * 100) 
  52  |       : 100;
  53  |     
  54  |     console.log(`\n=== SCORE ===`);
  55  |     console.log(`Score: ${score}/100`);
  56  |     console.log(`Passes: ${results.passes.length}/${totalChecks}`);
  57  |     
  58  |     // No debe haber violaciones críticas
  59  |     expect(critical.length).toBe(0);
  60  |   });
  61  |   
  62  |   test('feedback modal sin violaciones', async ({ page }) => {
  63  |     await page.goto('/');
  64  |     await expect(page.locator('#root')).toBeVisible();
  65  |     
  66  |     // Abrir feedback modal
  67  |     const btnComplete = page.locator('.btn-complete').first();
> 68  |     await btnComplete.click();
      |                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  69  |     
  70  |     await expect(page.locator('.feedback-overlay')).toBeVisible();
  71  |     
  72  |     const results = await new AxeBuilder({ page })
  73  |       .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
  74  |       .analyze();
  75  |     
  76  |     console.log('=== FEEDBACK MODAL AUDIT ===');
  77  |     console.log(`Violations: ${results.violations.length}`);
  78  |     
  79  |     results.violations.forEach((v, i) => {
  80  |       console.log(`[${i + 1}] ${v.id} - ${v.help} (${v.impact})`);
  81  |     });
  82  |     
  83  |     expect(results.violations.filter(v => v.impact === 'critical').length).toBe(0);
  84  |   });
  85  |   
  86  |   test('página de lección sin violaciones', async ({ page }) => {
  87  |     await page.goto('/');
  88  |     await expect(page.locator('#root')).toBeVisible();
  89  |     
  90  |     // Generar lección
  91  |     const btnLesson = page.locator('.btn-lesson').first();
  92  |     await btnLesson.click();
  93  |     
  94  |     // Esperar a que cargue la lección
  95  |     await expect(page.locator('.leccion-page')).toBeVisible({ timeout: 15000 });
  96  |     
  97  |     const results = await new AxeBuilder({ page })
  98  |       .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
  99  |       .analyze();
  100 |     
  101 |     console.log('=== LECCION PAGE AUDIT ===');
  102 |     console.log(`Violations: ${results.violations.length}`);
  103 |     
  104 |     results.violations.forEach((v, i) => {
  105 |       console.log(`[${i + 1}] ${v.id} - ${v.help} (${v.impact})`);
  106 |     });
  107 |     
  108 |     expect(results.violations.filter(v => v.impact === 'critical').length).toBe(0);
  109 |   });
  110 | });
  111 | 
```