# Informe de Auditoría de Accesibilidad (WCAG 2.2 AA), UX y Diseño Responsive

**Fecha de evaluación:** 7 de septiembre de 2026  
**Archivos auditados:** `index.html`, `styles.css`, `script.js`  
**Tipo de auditoría:** Estática y no destructiva (análisis de código fuente, reglas semánticas, cálculo de ratios de contraste y responsive)

---

## 1. Resumen Ejecutivo

El sitio web presenta una base sólida en cuanto a estructura semántica HTML5, tipografía legible, jerarquía de encabezados lineal y atributos descriptivos en elementos multimedia. No se identificaron bloqueos críticos (*showstoppers*) que impidan completamente el acceso al contenido.

Sin embargo, se han detectado **3 hallazgos de severidad alta**, **4 de severidad media** y **4 de severidad baja** relacionados principalmente con:
1. **Contraste no textual insuficiente** en el anillo de foco (`:focus-visible`) sobre fondos claros.
2. **Ausencia de mecanismo de salto** (*Skip link*) para eludir la navegación repetitiva.
3. **Inconsistencia de estado en el acordeón de la trayectoria**, donde el contenido se oculta visualmente pero no semánticamente ante lectores de pantalla.
4. **Degradación de la experiencia de usuario móvil (320px y 390px)** ocasionada por una cabecera fija (*sticky header*) que ocupa un porcentaje excesivo de la pantalla al envolver los enlaces.
5. **Áreas táctiles (*touch targets*) por debajo del estándar recomendado** en enlaces de navegación móvil y falta de gestión para `prefers-reduced-motion`.

---

## 2. Criterios que Cumplen Satisfactoriamente

| Criterio / Aspecto | Estado | Justificación técnica |
| :--- | :---: | :--- |
| **Idioma de la página (WCAG 3.1.1)** | **CUMPLE** | `index.html` declara `<html lang="es">` correctamente. |
| **Jerarquía de encabezados (WCAG 1.3.1, 2.4.6)** | **CUMPLE** | Existe un único `<h1>` en la sección hero y todos los títulos de sección utilizan `<h2>` sin saltos de nivel. |
| **Estructura semántica (WCAG 1.3.1)** | **CUMPLE** | Uso apropiado de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<figure>`, `<figcaption>` y `<footer>`. |
| **Contraste de texto principal (WCAG 1.4.3)** | **CUMPLE** | Texto general (`#1a1a1a` sobre `#ffffff` y `#f4f5f7`) con ratio $\ge 14.8:1$. Títulos, números destacados y textos de cabecera/pie superan ampliamente el mínimo de $4.5:1$. |
| **Textos alternativos en imágenes (WCAG 1.1.1)** | **CUMPLE** | Las tres imágenes en `<figure>` contienen atributos `alt` descriptivos y contextuales. |
| **Uso de controles nativos (WCAG 4.1.2)** | **CUMPLE** | La navegación usa enlaces `<a>` con `href` válidos y el acordeón interactivo usa elementos `<button>` nativos en lugar de `<div>` con eventos de clic. |
| **Ausencia de scroll horizontal a 320px (WCAG 1.4.10)** | **CUMPLE** | El uso de `box-sizing: border-box`, `max-width: 100%` en imágenes y rejillas fluidas (`auto-fit`, `minmax`) evita el desbordamiento horizontal en 320px, 390px y 768px. |
| **Sintaxis JavaScript (Robustez)** | **CUMPLE** | Archivo `script.js` sintácticamente válido, ejecuta sin dependencias externas y escucha `DOMContentLoaded`. |

---

## 3. Matriz de Hallazgos

### Leyenda de Severidad
- 🔴 **Crítico:** Impide totalmente el acceso o navegación para ciertos grupos de usuarios.
- 🟠 **Alto:** Dificulta gravemente la accesibilidad o incumple directamente criterios de conformidad WCAG 2.2 AA.
- 🟡 **Medio:** Degrada la experiencia de usuario (UX), accesibilidad secundaria o buenas prácticas responsive.
- 🔵 **Bajo:** Mejora menor de usabilidad, robustez de código o refinamiento visual.

---

### 3.1. Hallazgos Críticos
*No se encontraron hallazgos de severidad crítica.*

---

### 3.2. Hallazgos Altos

#### [H-01] Contraste insuficiente en el indicador de foco visible (`:focus-visible`)
- **Severidad:** 🟠 Alto
- **Criterio WCAG:** 1.4.11 Non-text Contrast (Nivel AA) / 2.4.13 Focus Appearance (WCAG 2.2 AA)
- **Archivo afectado:** `styles.css` (Líneas 38–42)
- **Evidencia:**
  ```css
  a:focus-visible,
  button:focus-visible {
    outline: 3px solid var(--color-accent); /* #d4af37 */
    outline-offset: 3px;
  }
  ```
  La variable `--color-accent` (`#d4af37`, oro) sobre el fondo principal blanco (`#ffffff`) o gris claro (`#f4f5f7`) produce un ratio de contraste de **2.10:1**, el cual está **por debajo del mínimo obligatorio de 3:1** para componentes de la interfaz de usuario e indicadores de foco.
- **Impacto:** Los usuarios que navegan exclusivamente con teclado pierden la referencia visual de dónde se encuentra el foco al recorrer los botones del acordeón o enlaces sobre fondo claro.
- **Recomendación de corrección:**
  Usar un color de foco de alto contraste sobre fondos claros (por ejemplo `var(--color-primary)` o `#0d1b2a`, que ofrece un ratio $> 14:1$), o adaptar el color de contorno según el contexto del contenedor:
  ```css
  a:focus-visible,
  button:focus-visible {
    outline: 3px solid var(--color-primary);
    outline-offset: 3px;
  }

  .site-header a:focus-visible,
  .site-footer a:focus-visible {
    outline: 3px solid var(--color-accent); /* Válido aquí porque el fondo es oscuro */
  }
  ```

---

#### [H-02] Ausencia de enlace de salto al contenido principal (*Skip Link*)
- **Severidad:** 🟠 Alto
- **Criterio WCAG:** 2.4.1 Bypass Blocks (Nivel A)
- **Archivo afectado:** `index.html` (Líneas 10–27)
- **Evidencia:**
  El documento inicia el `<body>` pasando directamente al `<header class="site-header">` con un menú de 5 enlaces sin ofrecer un mecanismo previo para eludir el bloque de navegación repetitivo.
- **Impacto:** Usuarios con lectores de pantalla o navegación por pulsador/teclado se ven forzados a tabular repetidamente por la cabecera antes de llegar al contenido central.
- **Recomendación de corrección:**
  1. Añadir como primer hijo del `<body>` en `index.html`:
     ```html
     <a href="#inicio" class="skip-link">Saltar al contenido principal</a>
     ```
  2. Añadir estilos en `styles.css` para mantenerlo oculto visualmente hasta recibir foco:
     ```css
     .skip-link {
       position: absolute;
       top: -100px;
       left: 1rem;
       background: var(--color-accent);
       color: var(--color-primary);
       padding: 0.75rem 1.25rem;
       font-weight: 700;
       z-index: 1000;
       border-radius: var(--radius);
       text-decoration: none;
       transition: top 0.2s ease;
     }
     .skip-link:focus {
       top: 1rem;
     }
     ```

---

#### [H-03] Accesibilidad deficiente en el componente interactivo de Trayectoria (Acordeón)
- **Severidad:** 🟠 Alto
- **Criterio WCAG:** 4.1.2 Name, Role, Value (Nivel A) / 1.3.1 Info and Relationships (Nivel A)
- **Archivos afectados:** `index.html` (Líneas 73–80), `styles.css` (Líneas 180–191), `script.js` (Líneas 8–13)
- **Evidencia:**
  1. En `index.html`: Los botones `<button class="timeline-toggle" aria-expanded="false">` no cuentan con el atributo `aria-controls="id-detalle"`, y los párrafos `.timeline-detail` no poseen un `id` asociado.
  2. En `styles.css`: El colapso del contenido se realiza únicamente mediante `max-height: 0; overflow: hidden;`. Al no usar `visibility: hidden`, `display: none` o el atributo HTML `hidden`, el contenido textual sigue presente en el árbol de accesibilidad y puede ser leído por cursores virtuales de lectores de pantalla (NVDA / VoiceOver) aun cuando el botón anuncia estado "colapsado".
- **Impacto:** Confusión para usuarios de tecnología de asistencia debido a la discrepancia entre el estado anunciado por ARIA y el contenido accesible en el DOM.
- **Recomendación de corrección:**
  1. En `index.html`: Vincular botones y paneles con IDs únicos:
     ```html
     <button class="timeline-toggle" aria-expanded="false" aria-controls="timeline-detail-1" id="timeline-btn-1" type="button">
       <span class="timeline-year">2002–2003</span>
       <span class="timeline-title">Sporting de Lisboa</span>
     </button>
     <p class="timeline-detail" id="timeline-detail-1" role="region" aria-labelledby="timeline-btn-1" hidden>
       ...
     </p>
     ```
  2. En `script.js`: Sincronizar la visibilidad semántica (`hidden` o `visibility`):
     ```javascript
     toggleButton.addEventListener("click", function () {
       var isOpen = item.classList.contains("is-open");
       var detail = item.querySelector(".timeline-detail");
       item.classList.toggle("is-open", !isOpen);
       toggleButton.setAttribute("aria-expanded", String(!isOpen));
       if (detail) {
         detail.hidden = isOpen;
       }
     });
     ```
  3. En `styles.css`: Asegurar compatibilidad de transiciones con `visibility: hidden;` o gestión controlada de `hidden`.

---

### 3.3. Hallazgos Medios

#### [H-04] Ocupación excesiva de pantalla por la cabecera fija (*Sticky Header*) en dispositivos móviles (320px y 390px)
- **Severidad:** 🟡 Medio
- **Criterio:** UX Móvil / Responsive Design
- **Archivos afectados:** `styles.css` (Líneas 45–60, 284–289), `index.html` (Líneas 12–25)
- **Evidencia:**
  En `@media (max-width: 600px)`, `.header-inner` cambia a `flex-direction: column; align-items: flex-start;`. En pantallas de 320px (ej. iPhone SE) y 390px (ej. iPhone 13/14), los 5 enlaces del menú envuelven en 2 o 3 filas debido al `gap: 1.25rem`. Al tener `position: sticky; top: 0; z-index: 10;`, la cabecera adquiere una altura fija de entre **140px y 170px**, bloqueando más del 30% del alto visible en vertical y más del 50% en orientación horizontal (*landscape*).
- **Impacto:** Severa reducción del área de lectura y frustración de navegación en pantallas estrechas.
- **Recomendación de corrección:**
  - Desactivar `position: sticky` en móviles por debajo de 600px (`position: static;` o relativo), o implementar un botón de menú colapsable (hamburguesa accesible) para pantallas pequeñas.

---

#### [H-05] Objetivos táctiles reducidos (*Touch Target Size*) en enlaces de navegación
- **Severidad:** 🟡 Medio
- **Criterio WCAG:** 2.5.8 Target Size (Minimum) (WCAG 2.2 Nivel AA) / UX Móvil
- **Archivo afectado:** `styles.css` (Líneas 82–86, 274–277)
- **Evidencia:**
  Los selectores `.main-nav a` y `.footer-inner a` no definen relleno (`padding`) táctil ni propiedad de visualización en bloque. El área clickable/táctil está limitada a la caja de texto (~24px de altura), lo que roza el límite mínimo absoluto de 24×24px de WCAG 2.2 AA y no alcanza la recomendación óptima para móviles de 44×44px o 48×48px.
- **Impacto:** Dificultad para pulsar enlaces con precisión en pantallas táctiles, provocando toques accidentales en enlaces contiguos.
- **Recomendación de corrección:**
  Añadir relleno táctil en los enlaces de navegación:
  ```css
  .main-nav a {
    display: inline-block;
    padding: 0.5rem 0.6rem;
    color: #fff;
    text-decoration: none;
    font-weight: 500;
  }
  ```

---

#### [H-06] Enlace externo a Wikipedia sin advertencia de apertura en nueva pestaña
- **Severidad:** 🟡 Medio
- **Criterio WCAG:** 3.2.5 Change on Request (Buenas prácticas AAA / Usabilidad AA)
- **Archivo afectado:** `index.html` (Línea 207)
- **Evidencia:**
  ```html
  <li><a href="https://es.wikipedia.org/wiki/Cristiano_Ronaldo" target="_blank" rel="noopener noreferrer">Wikipedia</a></li>
  ```
  El enlace abre una ventana externa sin proporcionar indicación visual (ícono de enlace externo) ni textual para lectores de pantalla.
- **Impacto:** Puede desorientar a usuarios con baja visión o que utilizan lectores de pantalla al cambiar el contexto de navegación sin previo aviso.
- **Recomendación de corrección:**
  Incorporar una aclaración accesible:
  ```html
  <a href="https://es.wikipedia.org/wiki/Cristiano_Ronaldo" target="_blank" rel="noopener noreferrer">
    Wikipedia <span class="visually-hidden">(se abre en una nueva pestaña)</span>
  </a>
  ```
  (Acompañado de la clase utilitaria `.visually-hidden` en CSS).

---

#### [H-07] Ausencia de atributos explícitos `width` y `height` en imágenes (Riesgo CLS)
- **Severidad:** 🟡 Medio
- **Criterio:** Core Web Vitals (Cumulative Layout Shift) / Rendimiento UX
- **Archivo afectado:** `index.html` (Líneas 173–195)
- **Evidencia:**
  Las etiquetas `<img>` de la galería cuentan con `src`, `alt` y `loading="lazy"`, pero no declaran atributos `width` y `height` ni la propiedad CSS `aspect-ratio`.
- **Impacto:** Cuando el usuario se desplaza rápidamente y las imágenes diferidas comienzan a cargarse, la página puede experimentar saltos bruscos de contenido (*layout shifts*), perjudicando la estabilidad visual.
- **Recomendación de corrección:**
  Declarar dimensiones intrínsecas en HTML o definir `aspect-ratio: 16 / 9` (o la proporción correspondiente) en la clase `.gallery img` en `styles.css`.

---

### 3.4. Hallazgos Bajos

#### [H-08] Inexistencia de soporte para `prefers-reduced-motion`
- **Severidad:** 🔵 Bajo
- **Criterio WCAG:** 2.3.3 Animation from Interactions (Nivel AAA / UX Best Practice)
- **Archivo afectado:** `styles.css` (Líneas 17, 185)
- **Evidencia:**
  Se define desplazamiento suave global incondicional (`html { scroll-behavior: smooth; }`) y transiciones en el acordeón sin consultar la preferencia del sistema operativo del usuario.
- **Recomendación de corrección:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
    .timeline-detail,
    * {
      transition: none !important;
      animation: none !important;
    }
  }
  ```

---

#### [H-09] Falta de programación defensiva en `script.js`
- **Severidad:** 🔵 Bajo
- **Criterio:** Robustez de JavaScript
- **Archivo afectado:** `script.js` (Líneas 5–8)
- **Evidencia:**
  ```javascript
  timelineItems.forEach(function (item) {
    var toggleButton = item.querySelector(".timeline-toggle");
    toggleButton.addEventListener("click", function () { ... });
  });
  ```
  Si un elemento `.timeline-item` en el HTML no tuviera el botón `.timeline-toggle` (por ejemplo tras una edición de contenido), se lanzaría un error en consola `TypeError: Cannot read properties of null (reading 'addEventListener')`.
- **Recomendación de corrección:**
  Agregar validación temprana: `if (!toggleButton) return;`.

---

#### [H-10] Etiqueta de navegación "Contacto" incoherente con el contenido
- **Severidad:** 🔵 Bajo
- **Criterio:** UX / Coherencia de Navegación
- **Archivo afectado:** `index.html` (Líneas 21, 202)
- **Evidencia:**
  El menú contiene un enlace `<a href="#contacto">Contacto</a>`, pero el destino (`<footer id="contacto">`) no tiene formulario de contacto, correo electrónico ni redes sociales; contiene un aviso legal/educativo y enlaces de referencia.
- **Recomendación de corrección:**
  Renombrar el enlace a "Referencias" o "Pie de página", o añadir una sección de contacto real si el sitio lo requiere.

---

#### [H-11] Redundancia textual entre `alt` y `<figcaption>` en la galería
- **Severidad:** 🔵 Bajo
- **Criterio:** Experiencia con Lector de Pantalla
- **Archivo afectado:** `index.html` (Líneas 174–178, 182–186, 190–194)
- **Evidencia:**
  El texto del `alt` repite casi exactamente el contenido visible del `<figcaption>`. Por ejemplo:
  - `alt`: "Cristiano Ronaldo con la camiseta de la selección de Portugal durante un partido en 2018"
  - `figcaption`: "Cristiano Ronaldo con la selección de Portugal, 2018."
- **Recomendación de corrección:**
  Diferenciar o sintetizar: usar el `alt` para describir detalles visuales específicos de la imagen y el `figcaption` para el contexto editorial o título de la foto.

---

## 4. Pruebas que Deben Repetirse Tras las Correcciones

Una vez aplicadas las soluciones recomendadas, deben ejecutarse las siguientes pruebas de verificación:

1. **Prueba de Contraste Automática y Manual:**
   - Validar con Color Contrast Analyzer o devtools de accesibilidad que el anillo `:focus-visible` supere el ratio 3:1 contra todos los fondos (blanco `#fff`, gris `#f4f5f7` y azul oscuro `#1b1f3b`).
2. **Prueba de Navegación por Teclado:**
   - Verificar la aparición y funcionalidad del *Skip link* presionando `Tab` inmediatamente al cargar la página.
   - Navegar todos los botones de la trayectoria con `Tab`, abrirlos y cerrarlos con `Enter` y `Space`.
3. **Prueba con Lectores de Pantalla (NVDA en Windows / VoiceOver en macOS/iOS):**
   - Comprobar que los paneles colapsados del acordeón no sean leídos mientras su estado sea `aria-expanded="false"`.
   - Comprobar que el cambio de estado se anuncie verbalmente al interactuar con cada botón.
   - Comprobar el anuncio de apertura en nueva pestaña en el enlace de Wikipedia.
4. **Prueba de Dispositivos Móviles y Viewports Específicos:**
   - **320px (móvil ultracompacto):** Verificar que la cabecera no bloquee el área de contenido durante el desplazamiento vertical y que no exista scroll horizontal.
   - **390px (móvil estándar):** Validar espaciado y comodidad táctil de los enlaces de cabecera y pie.
   - **768px (tablet):** Validar correcta distribución de la rejilla de estadísticas y galería.
   - **1024px+ (escritorio):** Confirmar alineación del contenedor y comportamiento general.
5. **Prueba de Reducción de Movimiento:**
   - Activar "Reducir movimiento" en las preferencias del sistema operativo y comprobar que el scroll salte instantáneamente sin animación.

---

## 5. Alcance de la Verificación Realizada vs. Pendiente de Prueba Manual

### Qué se verificó exhaustivamente en esta auditoría:
- Análisis completo del código fuente HTML5 (`index.html`), CSS (`styles.css`) y JavaScript (`script.js`).
- Cálculo matemático de luminosidad relativa y ratios de contraste WCAG (texto y componentes no textuales).
- Validación de sintaxis JS (`node --check script.js`).
- Jerarquía semántica de encabezados, estructura de landmarks (`header`, `nav`, `main`, `footer`), listas y figuras.
- Revisión de lógica de media queries CSS para 320px, 390px, 600px, 768px y desktop.

### Qué queda pendiente de probar manualmente en el navegador:
- Simulación en emulador de dispositivos móviles reales (iOS Safari y Android Chrome) para medir la respuesta táctil exacta y altura dinámica de la barra de direcciones (*URL bar resize*).
- Prueba con lectores de pantalla reales (NVDA, JAWS, VoiceOver, TalkBack) para escuchar la pronunciación y concordancia exacta de los atributos ARIA.
- Verificación de la velocidad de carga de las imágenes externas de Wikimedia Commons bajo conexiones lentas (3G throttling).
