# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y-audit.spec.ts >> A11y Audit - EnSuLugar >> página de lección sin violaciones
- Location: tests/e2e/a11y-audit.spec.ts:86:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.leccion-page')
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for locator('.leccion-page')

```

```yaml
- link "Saltar al contenido":
  - /url: "#main-content"
- main:
  - combobox:
    - option "Todas" [selected]
    - option "Nivel 1 ★☆☆☆☆"
    - option "Nivel 2 ★★☆☆☆"
    - option "Nivel 3 ★★★☆☆"
    - option "Nivel 4 ★★★★☆"
    - option "Nivel 5 ★★★★★"
  - textbox "Buscar receta…"
  - combobox "Buscar técnica"
  - heading "Recetas (41)" [level=2]
  - article:
    - heading "Arroz Blanco Perfecto — Método de Absorción" [level=2]
    - text: ★★☆☆☆ 25 min 4 porciones arroz
    - button "Cocción de arroz"
    - button "Control de fuego y temperatura"
    - paragraph: "El arroz blanco parece fácil, pero la mayoría lo hace mal: lo lavan de más, lo revuelven mientras se cocina, destapan antes de tiempo. La técnica de absorción es infalible: proporción exacta, fuego controlado, reposo tapado."
    - button "Ver detalles de Arroz Blanco Perfecto — Método de Absorción": Ver detalles ▼
    - button "Generar lección con IA para Arroz Blanco Perfecto — Método de Absorción": Generar lección con IA
    - button "Marcar Arroz Blanco Perfecto — Método de Absorción como completada": Marcar como completada
  - article:
    - heading "Arroz Pilaf — Arroz Sofrito" [level=2]
    - text: ★★★☆☆ 30 min 4 porciones arroz
    - button "Cocción de arroz"
    - button "Control de fuego y temperatura"
    - paragraph: El pilaf es arroz cocido en caldo con aromáticos, tostado primero. Más sabor que el arroz blanco, misma técnica de absorción. Base para arroz con pollo, arroz a la mexicana, arroz amarillo.
    - button "Ver detalles de Arroz Pilaf — Arroz Sofrito": Ver detalles ▼
    - button "Generar lección con IA para Arroz Pilaf — Arroz Sofrito": Generar lección con IA
    - button "Marcar Arroz Pilaf — Arroz Sofrito como completada": Marcar como completada
  - article:
    - heading "Osobuco Braseado — Cocción Lenta" [level=2]
    - text: ★★★★☆ 0 min 4 porciones braseado
    - button "Braseado"
    - button "Sellado (Maillard)"
    - button "Deglaseado"
    - button "Control de fuego y temperatura"
    - paragraph: "El braseado es la técnica para cortes duros y económicos: cocción larga, líquido, tapado, temperatura baja. El colágeno se convierte en gelatina y la carne se deshace. No es \"hervir la carne\" — es transformarla."
    - button "Ver detalles de Osobuco Braseado — Cocción Lenta": Ver detalles ▼
    - button "Generar lección con IA para Osobuco Braseado — Cocción Lenta": Generar lección con IA
    - button "Marcar Osobuco Braseado — Cocción Lenta como completada": Marcar como completada
  - article:
    - heading "Caramelo Seco — Azúcar Sola" [level=2]
    - text: ★★★☆☆ 10 min 4 porciones caramelo
    - button "Caramelo"
    - button "Control de fuego y temperatura"
    - paragraph: "Caramelo seco es azúcar derretida sola, sin agua. Parece simple, pero es traicionero: un segundo de más y pasa de dorado a quemado. La técnica está en el control del fuego y en no moverlo."
    - button "Ver detalles de Caramelo Seco — Azúcar Sola": Ver detalles ▼
    - button "Generar lección con IA para Caramelo Seco — Azúcar Sola": Generar lección con IA
    - button "Marcar Caramelo Seco — Azúcar Sola como completada": Marcar como completada
  - article:
    - heading "Caramelo Húmedo — Azúcar + Agua" [level=2]
    - text: ★★☆☆☆ 15 min 4 porciones caramelo
    - button "Caramelo"
    - button "Control de fuego y temperatura"
    - paragraph: "Caramelo húmedo es más fácil de controlar que el seco: el agua evita que el azúcar se queme antes de derretirse. Ideal para principiantes."
    - button "Ver detalles de Caramelo Húmedo — Azúcar + Agua": Ver detalles ▼
    - button "Generar lección con IA para Caramelo Húmedo — Azúcar + Agua": Generar lección con IA
    - button "Marcar Caramelo Húmedo — Azúcar + Agua como completada": Marcar como completada
  - article:
    - heading "Bife a la Plancha — Punto Perfecto" [level=2]
    - text: ★★★☆☆ 10 min 1 porciones carnes
    - button "Sellado (Maillard)"
    - button "Reposo de la carne"
    - button "Control de fuego y temperatura"
    - paragraph: El 90% de la gente cocina la carne mal. Fuego muy bajo, la mueven, la pinchan. Un bife bien sellado por fuera y en el punto exacto por dentro es cuestión de técnica, no de suerte. Incluye cómo identificar el punto al tacto.
    - button "Ver detalles de Bife a la Plancha — Punto Perfecto": Ver detalles ▼
    - button "Generar lección con IA para Bife a la Plancha — Punto Perfecto": Generar lección con IA
    - button "Marcar Bife a la Plancha — Punto Perfecto como completada": Marcar como completada
  - article:
    - heading "Sellado Perfecto + Salsa de Sartén" [level=2]
    - text: ★★★☆☆ 15 min 2 porciones carnes
    - button "Sellado (Maillard)"
    - button "Deglaseado"
    - button "Basting (bañar con manteca)"
    - button "Reposo de la carne"
    - paragraph: El color dorado en la carne es sabor, no decoración. Y después de cocinar, el fondo del sartén tiene todo el sabor concentrado. Deglaseado es la técnica para convertirlo en salsa en 2 minutos.
    - button "Ver detalles de Sellado Perfecto + Salsa de Sartén": Ver detalles ▼
    - button "Generar lección con IA para Sellado Perfecto + Salsa de Sartén": Generar lección con IA
    - button "Marcar Sellado Perfecto + Salsa de Sartén como completada": Marcar como completada
  - article:
    - heading "Pollo al Horno — Piel Crocante, Carne Jugosa" [level=2]
    - text: ★★☆☆☆ 60 min 4 porciones carnes
    - button "Pollo al horno"
    - button "Reposo de la carne"
    - button "Control de fuego y temperatura"
    - paragraph: El pollo al horno seco es un clásico de la cocina aburrida. El secreto está en la temperatura inicial alta, el reposo y no abrir el horno. Piel crocante, carne que se desprende del hueso.
    - button "Ver detalles de Pollo al Horno — Piel Crocante, Carne Jugosa": Ver detalles ▼
    - button "Generar lección con IA para Pollo al Horno — Piel Crocante, Carne Jugosa": Generar lección con IA
    - button "Marcar Pollo al Horno — Piel Crocante, Carne Jugosa como completada": Marcar como completada
  - article:
    - heading "Marinada vs Adobo Seco" [level=2]
    - text: ★☆☆☆☆ 10 min 4 porciones carnes
    - button "Marinada y adobo"
    - button "Sellado (Maillard)"
    - paragraph: No toda carne se marina. Las marinadas ácidas (limón, vinagre) ablandan pero pueden arruinar carnes tiernas. El adobo seco (especias + sal) es para cortes que ya son tiernos. Saber cuándo usar cada uno es la diferencia.
    - button "Ver detalles de Marinada vs Adobo Seco": Ver detalles ▼
    - button "Generar lección con IA para Marinada vs Adobo Seco": Generar lección con IA
    - button "Marcar Marinada vs Adobo Seco como completada": Marcar como completada
  - article:
    - heading "Crema Pastelera Clásica" [level=2]
    - text: ★★★☆☆ 20 min 4 porciones crema-pastelera
    - button "Crema pastelera"
    - button "Control de fuego y temperatura"
    - paragraph: "Crema pastelera es leche, huevos, azúcar y almidón. Parece simple, pero los grumos y el sabor a huevo son los enemigos. La técnica está en la temperatura de la leche y en no dejar de batir. Base de postres: profiteroles, tartas, churros, medialunas."
    - button "Ver detalles de Crema Pastelera Clásica": Ver detalles ▼
    - button "Generar lección con IA para Crema Pastelera Clásica": Generar lección con IA
    - button "Marcar Crema Pastelera Clásica como completada": Marcar como completada
  - article:
    - heading "Corte Juliana — Bastones Finos" [level=2]
    - text: ★★☆☆☆ 5 min 1 porciones cuchillo
    - button "Técnicas de corte"
    - paragraph: "La juliana es el corte más versátil: bastones finos de 4-5 cm de largo y 2-3 mm de ancho. Se usa para salteados, ensaladas, guarniciones. Es la base de todos los cortes en bastón."
    - button "Ver detalles de Corte Juliana — Bastones Finos": Ver detalles ▼
    - button "Generar lección con IA para Corte Juliana — Bastones Finos": Generar lección con IA
    - button "Marcar Corte Juliana — Bastones Finos como completada": Marcar como completada
  - article:
    - heading "Corte Brunoise — Cubos Pequeños" [level=2]
    - text: ★★★☆☆ 5 min 1 porciones cuchillo
    - button "Técnicas de corte"
    - paragraph: Brunoise es juliana cortada en cubos de 2-3 mm. Es la base de salsas, rellenos y sopas. Requiere más precisión que la juliana.
    - button "Ver detalles de Corte Brunoise — Cubos Pequeños": Ver detalles ▼
    - button "Generar lección con IA para Corte Brunoise — Cubos Pequeños": Generar lección con IA
    - button "Marcar Corte Brunoise — Cubos Pequeños como completada": Marcar como completada
  - article:
    - heading "Corte Chiffonade — Tiras Finas de Hojas" [level=2]
    - text: ★★☆☆☆ 2 min 1 porciones cuchillo
    - button "Técnicas de corte"
    - paragraph: "Chiffonade es el corte para hojas verdes y hierbas: albahaca, lechuga, acelga, espinaca. Tiras finas que se integran sin dominar el plato."
    - button "Ver detalles de Corte Chiffonade — Tiras Finas de Hojas": Ver detalles ▼
    - button "Generar lección con IA para Corte Chiffonade — Tiras Finas de Hojas": Generar lección con IA
    - button "Marcar Corte Chiffonade — Tiras Finas de Hojas como completada": Marcar como completada
  - article:
    - heading "Cebolla Morada en Escabeche Rápido" [level=2]
    - text: ★☆☆☆☆ 15 min 4 porciones encurtido
    - button "Encurtido rápido"
    - button "Técnicas de corte"
    - paragraph: "Encurtido rápido no es fermentación: es vegetales en vinagre, sal y azúcar. En 30 minutos tenés un acompañamiento ácido y crujiente que transforma cualquier plato. La cebolla morada en escabeche es la entrada al mundo de los pickles."
    - button "Ver detalles de Cebolla Morada en Escabeche Rápido": Ver detalles ▼
    - button "Generar lección con IA para Cebolla Morada en Escabeche Rápido": Generar lección con IA
    - button "Marcar Cebolla Morada en Escabeche Rápido como completada": Marcar como completada
  - article:
    - heading "Pepinos en Pickle Rápido" [level=2]
    - text: ★☆☆☆☆ 15 min 4 porciones encurtido
    - button "Encurtido rápido"
    - button "Técnicas de corte"
    - paragraph: Pepinos crujientes, ácidos, ligeramente dulces. El pickle rápido perfecto para hamburguesas, sándwiches y ensaladas.
    - button "Ver detalles de Pepinos en Pickle Rápido": Ver detalles ▼
    - button "Generar lección con IA para Pepinos en Pickle Rápido": Generar lección con IA
    - button "Marcar Pepinos en Pickle Rápido como completada": Marcar como completada
  - article:
    - heading "Milanesa de Carne — Empanizado y Fritura Perfecta" [level=2]
    - text: ★★★☆☆ 20 min 2 porciones fritura
    - button "Fritura profunda"
    - button "Control de fuego y temperatura"
    - paragraph: "La milanesa parece fácil, pero la mayoría la hace mal: el empanizado se despega, el aceite no está a la temperatura justa, y queda aceitosa en vez de crocante. La técnica está en la temperatura del aceite y el empanizado en tres pasos."
    - button "Ver detalles de Milanesa de Carne — Empanizado y Fritura Perfecta": Ver detalles ▼
    - button "Generar lección con IA para Milanesa de Carne — Empanizado y Fritura Perfecta": Generar lección con IA
    - button "Marcar Milanesa de Carne — Empanizado y Fritura Perfecta como completada": Marcar como completada
  - article:
    - heading "Papas Fritas — Doble Cocción" [level=2]
    - text: ★★★☆☆ 30 min 2 porciones fritura
    - button "Fritura profunda"
    - button "Control de fuego y temperatura"
    - paragraph: Las papas fritas perfectas no se fríen una vez, se fríen dos. La primera cocción a baja temperatura las cocina por dentro; la segunda a alta temperatura las dora y las deja crocantes. Sin trucos raros, solo técnica.
    - button "Ver detalles de Papas Fritas — Doble Cocción": Ver detalles ▼
    - button "Generar lección con IA para Papas Fritas — Doble Cocción": Generar lección con IA
    - button "Marcar Papas Fritas — Doble Cocción como completada": Marcar como completada
  - article:
    - heading "Hojaldre Clásico — Laminado de Manteca" [level=2]
    - text: ★★★★★ 0 min 6 porciones hojaldre
    - button "Hojaldre"
    - button "Masa quebrada (manteca fría)"
    - button "Control de fuego y temperatura"
    - paragraph: "El hojaldre no es una masa, es una técnica: capas de masa y manteca que se multiplican al hornearse. Cada pliegue triplica las capas. 6 pliegues = 729 capas. La manteca fría, el reposo y la paciencia son todo."
    - button "Ver detalles de Hojaldre Clásico — Laminado de Manteca": Ver detalles ▼
    - button "Generar lección con IA para Hojaldre Clásico — Laminado de Manteca": Generar lección con IA
    - button "Marcar Hojaldre Clásico — Laminado de Manteca como completada": Marcar como completada
  - article:
    - heading "Palmitos de Hojaldre" [level=2]
    - text: ★★★★☆ 30 min 4 porciones hojaldre
    - button "Hojaldre"
    - paragraph: "La aplicación más simple del hojaldre: azúcar + canela + horneado. Ideal para practicar el laminado sin presión."
    - button "Ver detalles de Palmitos de Hojaldre": Ver detalles ▼
    - button "Generar lección con IA para Palmitos de Hojaldre": Generar lección con IA
    - button "Marcar Palmitos de Hojaldre como completada": Marcar como completada
  - article:
    - heading "Huevo Duro — Tiempos Exactos" [level=2]
    - text: ★★☆☆☆ 15 min 4 porciones huevo-duro
    - button "Huevo duro perfecto"
    - button "Cocción del huevo"
    - paragraph: El huevo duro parece lo más simple del mundo, pero la mayoría lo cocina de más y la yema se pone verde y pastosa. La técnica está en los tiempos exactos y el choque térmico. Con esto, la yema queda amarilla y cremosa, no verde y seca.
    - button "Ver detalles de Huevo Duro — Tiempos Exactos": Ver detalles ▼
    - button "Generar lección con IA para Huevo Duro — Tiempos Exactos": Generar lección con IA
    - button "Marcar Huevo Duro — Tiempos Exactos como completada": Marcar como completada
  - article:
    - heading "Huevo Frito Perfecto" [level=2]
    - text: ★☆☆☆☆ 5 min 1 porciones huevos
    - button "Cocción del huevo"
    - button "Control de fuego y temperatura"
    - paragraph: La técnica definitiva para un huevo frito con clara cocida, yema líquida y bordes crocantes. Sin trucos raros, solo precisión.
    - button "Ver detalles de Huevo Frito Perfecto": Ver detalles ▼
    - button "Generar lección con IA para Huevo Frito Perfecto": Generar lección con IA
    - button "Marcar Huevo Frito Perfecto como completada": Marcar como completada
  - article:
    - heading "Huevo Poché" [level=2]
    - text: ★★★☆☆ 8 min 1 porciones huevos
    - button "Cocción del huevo"
    - button "Control de fuego y temperatura"
    - paragraph: El huevo cocido en agua con la yema líquida y la clara envuelta. Parece de restaurante, pero con los trucos correctos es más fácil de lo que parece.
    - button "Ver detalles de Huevo Poché": Ver detalles ▼
    - button "Generar lección con IA para Huevo Poché": Generar lección con IA
    - button "Marcar Huevo Poché como completada": Marcar como completada
  - article:
    - heading "Revuelto Cremoso" [level=2]
    - text: ★★☆☆☆ 6 min 1 porciones huevos
    - button "Cocción del huevo"
    - button "Control de fuego y temperatura"
    - paragraph: Huevos revueltos suaves, cremosos, casi como una natilla. Nada que ver con el revuelto seco y marrón del desayuno de hotel. Técnica francesa, resultado celestial.
    - button "Ver detalles de Revuelto Cremoso": Ver detalles ▼
    - button "Generar lección con IA para Revuelto Cremoso": Generar lección con IA
    - button "Marcar Revuelto Cremoso como completada": Marcar como completada
  - article:
    - heading "Tortilla Francesa" [level=2]
    - text: ★★★☆☆ 4 min 1 porciones huevos
    - button "Cocción del huevo"
    - button "Control de fuego y temperatura"
    - paragraph: La tortilla que se dobla, no la de papas. Fina, dorada por fuera, cremosa por dentro. Un pliegue perfecto y listo. La prueba de que menos es más.
    - button "Ver detalles de Tortilla Francesa": Ver detalles ▼
    - button "Generar lección con IA para Tortilla Francesa": Generar lección con IA
    - button "Marcar Tortilla Francesa como completada": Marcar como completada
  - article:
    - heading "Omelette" [level=2]
    - text: ★★★★☆ 8 min 1 porciones huevos
    - button "Cocción del huevo"
    - button "Control de fuego y temperatura"
    - paragraph: La prueba de fuego de cualquier cocinero. Un omelette perfecto es dorado por fuera, cremoso por dentro, y el relleno va adentro — no encima. Dominalo y dominás el sartén.
    - button "Ver detalles de Omelette": Ver detalles ▼
    - button "Generar lección con IA para Omelette": Generar lección con IA
    - button "Marcar Omelette como completada": Marcar como completada
  - article:
    - heading "Cacio e Pepe" [level=2]
    - text: ★★★★☆ 15 min 2 porciones pasta
    - button "Emulsión"
    - paragraph: "Tres ingredientes: pasta, queso pecorino, pimienta. Parece imposible que salga algo tan cremoso sin crema. La salsa se hace con el agua de la pasta y movimiento. Si usás crema, no es Cacio e Pepe."
    - button "Ver detalles de Cacio e Pepe": Ver detalles ▼
    - button "Generar lección con IA para Cacio e Pepe": Generar lección con IA
    - button "Marcar Cacio e Pepe como completada": Marcar como completada
  - article:
    - heading "Spaghetti Aglio e Olio" [level=2]
    - text: ★★★☆☆ 15 min 2 porciones pasta
    - button "Emulsión"
    - button "Control de fuego y temperatura"
    - paragraph: Ajo, aceite de oliva, guindilla y perejil. Parece tan simple que cualquiera lo hace. Pero el 90% quema el ajo y amarga todo el plato. La técnica está en la temperatura del aceite.
    - button "Ver detalles de Spaghetti Aglio e Olio": Ver detalles ▼
    - button "Generar lección con IA para Spaghetti Aglio e Olio": Generar lección con IA
    - button "Marcar Spaghetti Aglio e Olio como completada": Marcar como completada
  - article:
    - heading "Carbonara" [level=2]
    - text: ★★★★☆ 20 min 2 porciones pasta
    - button "Emulsión"
    - paragraph: Huevo, pecorino, guanciale (o panceta), pimienta. Sin crema, sin cebolla, sin ajo. La salsa se hace con el calor de la pasta y el movimiento, no con fuego. El huevo no se debe cortar.
    - button "Ver detalles de Carbonara": Ver detalles ▼
    - button "Generar lección con IA para Carbonara": Generar lección con IA
    - button "Marcar Carbonara como completada": Marcar como completada
  - article:
    - heading "Salsa de Tomate Base" [level=2]
    - text: ★★☆☆☆ 45 min 6 porciones pasta
    - button "Salsa de tomate base"
    - button "Control de fuego y temperatura"
    - paragraph: No es abrir un tarro. Cebolla, ajo, tomate, tiempo. Parece simple, pero la diferencia entre una salsa de tarro y una casera es abismal. Esta es la base para pastas, pizzas, guisos.
    - button "Ver detalles de Salsa de Tomate Base": Ver detalles ▼
    - button "Generar lección con IA para Salsa de Tomate Base": Generar lección con IA
    - button "Marcar Salsa de Tomate Base como completada": Marcar como completada
  - article:
    - heading "Masa de Pizza" [level=2]
    - text: ★★★☆☆ 1440 min 4 porciones pasta
    - button "Masa de pizza"
    - button "Fermentación / levado"
    - button "Masa quebrada (manteca fría)"
    - paragraph: Hidratación alta, reposo en frío, estirado a mano. La masa de pizza no se estira con palo — se estira con las manos, de adentro hacia afuera, dejando el borde más grueso. 24 horas de reposo en heladera = sabor de pizzeria.
    - button "Ver detalles de Masa de Pizza": Ver detalles ▼
    - button "Generar lección con IA para Masa de Pizza": Generar lección con IA
    - button "Marcar Masa de Pizza como completada": Marcar como completada
  - article:
    - heading "Risotto Clásico — Mantecatura Perfecta" [level=2]
    - text: ★★★★☆ 35 min 2 porciones risotto
    - button "Risotto"
    - button "Cocción de arroz"
    - button "Control de fuego y temperatura"
    - paragraph: "El risotto no es arroz con cosas. Es una técnica: el almidón del arroz se libera con el movimiento constante y el caldo caliente, creando una crema natural sin crema de leche. La mantecatura final (manteca + queso fuera del fuego) es lo que lo eleva de \"arroz caldoso\" a \"risotto\"."
    - button "Ver detalles de Risotto Clásico — Mantecatura Perfecta": Ver detalles ▼
    - button "Generar lección con IA para Risotto Clásico — Mantecatura Perfecta": Generar lección con IA
    - button "Marcar Risotto Clásico — Mantecatura Perfecta como completada": Marcar como completada
  - article:
    - heading "Risotto de Hongos" [level=2]
    - text: ★★★★☆ 40 min 2 porciones risotto
    - button "Risotto"
    - button "Cocción de arroz"
    - button "Control de fuego y temperatura"
    - paragraph: La misma técnica, con hongos salteados incorporados al final. El umami de los hongos potencia la cremosidad del risotto.
    - button "Ver detalles de Risotto de Hongos": Ver detalles ▼
    - button "Generar lección con IA para Risotto de Hongos": Generar lección con IA
    - button "Marcar Risotto de Hongos como completada": Marcar como completada
  - article:
    - heading "Bechamel" [level=2]
    - text: ★★★☆☆ 15 min 4 porciones salsas
    - button "Roux"
    - paragraph: Leche, manteca, harina. Parece fácil, pero los grumos son el enemigo. La técnica está en el roux y en agregar la leche en el momento justo. Base de laslasa, croquetas, gratinados.
    - button "Ver detalles de Bechamel": Ver detalles ▼
    - button "Generar lección con IA para Bechamel": Generar lección con IA
    - button "Marcar Bechamel como completada": Marcar como completada
  - article:
    - heading "Vinagreta Clásica Emulsionada" [level=2]
    - text: ★★☆☆☆ 5 min 4 porciones salsas
    - button "Emulsión"
    - paragraph: La proporción 3:1 aceite/vinagre y por qué a veces se corta. Una vinagreta bien emulsionada es la diferencia entre una ensalada triste y una ensalada que querés repetir.
    - button "Ver detalles de Vinagreta Clásica Emulsionada": Ver detalles ▼
    - button "Generar lección con IA para Vinagreta Clásica Emulsionada": Generar lección con IA
    - button "Marcar Vinagreta Clásica Emulsionada como completada": Marcar como completada
  - article:
    - heading "Mayonesa Casera" [level=2]
    - text: ★★★☆☆ 10 min 6 porciones salsas
    - button "Emulsión"
    - paragraph: Huevo + aceite + emulsión. Parece magia pero es física. Cuando se corta, cómo salvarla. Una vez que hacés mayonesa casera, no volvés a comprar.
    - button "Ver detalles de Mayonesa Casera": Ver detalles ▼
    - button "Generar lección con IA para Mayonesa Casera": Generar lección con IA
    - button "Marcar Mayonesa Casera como completada": Marcar como completada
  - article:
    - heading "Salsa Holandesa" [level=2]
    - text: ★★★★★ 15 min 4 porciones salsas
    - button "Emulsión"
    - paragraph: La reina de las salsas emulsionadas. Manteca, yema, limón. Se corta fácil, pero cuando la dominás, es la salsa más versátil para huevos, vegetales y pescados. La prueba de fuego de la emulsión.
    - button "Ver detalles de Salsa Holandesa": Ver detalles ▼
    - button "Generar lección con IA para Salsa Holandesa": Generar lección con IA
    - button "Marcar Salsa Holandesa como completada": Marcar como completada
  - article:
    - heading "Salteado Wok — Vegetales" [level=2]
    - text: ★★★☆☆ 10 min 2 porciones vegetales
    - button "Salteado wok"
    - button "Control de fuego y temperatura"
    - paragraph: El wok hay que quemarlo primero. El "sabor wok" no es mito — es la reacción química del metal caliente con el aceite. Vegetales crocantes, no hervidos. La técnica del salteado chino aplicada a casa.
    - button "Ver detalles de Salteado Wok — Vegetales": Ver detalles ▼
    - button "Generar lección con IA para Salteado Wok — Vegetales": Generar lección con IA
    - button "Marcar Salteado Wok — Vegetales como completada": Marcar como completada
  - article:
    - heading "Vegetales Asados al Horno" [level=2]
    - text: ★☆☆☆☆ 30 min 4 porciones vegetales
    - button "Asado al horno"
    - button "Control de fuego y temperatura"
    - paragraph: "La mayoría pone los vegetales muy juntos y los hierve en vez de dorarlos. La regla de oro: espacio entre ellos, temperatura alta, y no moverlos hasta que estén caramelizados."
    - button "Ver detalles de Vegetales Asados al Horno": Ver detalles ▼
    - button "Generar lección con IA para Vegetales Asados al Horno": Generar lección con IA
    - button "Marcar Vegetales Asados al Horno como completada": Marcar como completada
  - article:
    - heading "Blanqueado y Choque Térmico" [level=2]
    - text: ★☆☆☆☆ 5 min 4 porciones vegetales
    - button "Blanqueado y choque térmico"
    - paragraph: La técnica que usan los chefs para que los vegetales verdes mantengan su color vibrante y textura firme. Hervir + agua con hielo. Parece simple, el timing es todo.
    - button "Ver detalles de Blanqueado y Choque Térmico": Ver detalles ▼
    - button "Generar lección con IA para Blanqueado y Choque Térmico": Generar lección con IA
    - button "Marcar Blanqueado y Choque Térmico como completada": Marcar como completada
  - article:
    - heading "Masa de Tarta Quebrada (Pâte Brisée)" [level=2]
    - text: ★★★☆☆ 40 min 6 porciones vegetales
    - button "Masa quebrada (manteca fría)"
    - button "Control de fuego y temperatura"
    - paragraph: Manteca fría, no trabajar de más, reposo. Tres reglas que la mayoría rompe. Una masa quebrada bien hecha es la base de tartas saladas y dulces. Crocante, mantecosa, se deshace en la boca.
    - button "Ver detalles de Masa de Tarta Quebrada (Pâte Brisée)": Ver detalles ▼
    - button "Generar lección con IA para Masa de Tarta Quebrada (Pâte Brisée)": Generar lección con IA
    - button "Marcar Masa de Tarta Quebrada (Pâte Brisée) como completada": Marcar como completada
  - article:
    - heading "Pan Casero — 4 Ingredientes" [level=2]
    - text: ★★★☆☆ 180 min 1 porciones vegetales
    - button "Pan casero"
    - button "Fermentación / levado"
    - button "Masa quebrada (manteca fría)"
    - paragraph: "Harina, agua, levadura, sal. Parece simple, pero el pan es pura técnica: hidratación, amasado, tiempos de reposo. Con 3 días de práctica ya sale rico. Con una semana, sale pan de panadería."
    - button "Ver detalles de Pan Casero — 4 Ingredientes": Ver detalles ▼
    - button "Generar lección con IA para Pan Casero — 4 Ingredientes": Generar lección con IA
    - button "Marcar Pan Casero — 4 Ingredientes como completada": Marcar como completada
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
  68  |     await btnComplete.click();
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
> 95  |     await expect(page.locator('.leccion-page')).toBeVisible({ timeout: 15000 });
      |                                                 ^ Error: expect(locator).toBeVisible() failed
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