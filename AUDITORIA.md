# Informe de Auditoría de Accesibilidad (WCAG 2.2 AA), UX, Diseño Responsive y Seguridad

**Fecha de evaluación inicial:** 7 de septiembre de 2026
**Fecha de seguimiento (verificación de correcciones + pruebas de seguridad):** 9 de septiembre de 2026
**Archivos auditados:** `index.html`, `styles.css`, `script.js`, `observabilidad.html`, `observabilidad.css`, `observabilidad.js`
**Tipo de auditoría:** Estática y no destructiva (análisis de código fuente, reglas semánticas, cálculo de ratios de contraste, responsive) + pruebas dinámicas básicas (sintaxis, validación HTML, smoke test local y en producción)

---

## 0. Registro de Actualizaciones

| Fecha | Cambio |
| :--- | :--- |
| 2026-09-07 | Auditoría inicial de `index.html`, `styles.css`, `script.js`. 11 hallazgos (H-01 a H-11). |
| 2026-09-09 | Se verifican correcciones de los 11 hallazgos iniciales (ver §2). Se audita el nuevo módulo `observabilidad.*` (3 hallazgos nuevos, H-12 a H-14, ver §3.5). Se ejecutan pruebas de seguridad y pruebas básicas (ver §6). Se publica el sitio en GitHub Pages (ver §7). |

---

## 1. Resumen Ejecutivo

El sitio partió de una base sólida en estructura semántica HTML5, tipografía legible, jerarquía de encabezados lineal y atributos descriptivos en elementos multimedia. La auditoría inicial (7 de septiembre) identificó **3 hallazgos de severidad alta**, **4 de severidad media** y **4 de severidad baja**.

En la verificación de seguimiento (9 de septiembre) se confirma que **los 11 hallazgos originales fueron corregidos** en el código actual (ver matriz de verificación en §2). Adicionalmente se incorporó un nuevo módulo de **observabilidad local** (`observabilidad.html/css/js`), que registra rendimiento, errores y clics exclusivamente en `localStorage` del navegador del usuario, sin backend ni envío de datos a terceros. Este módulo fue auditado de forma independiente, con **0 hallazgos críticos o altos**, **1 hallazgo medio** y **2 hallazgos bajos** (H-12 a H-14, §3.5).

Se ejecutaron pruebas de seguridad básicas (búsqueda de sumideros de XSS, secretos embebidos, contenido mixto, enlaces externos inseguros) y pruebas funcionales básicas (validación de sintaxis JS, validación HTML, smoke test de todos los recursos en local y en producción). Ningún hallazgo crítico de seguridad fue detectado. El sitio ya se encuentra publicado y accesible públicamente en GitHub Pages (§7).

---

## 2. Verificación de Correcciones Aplicadas (Hallazgos Originales H-01 a H-11)

| ID | Hallazgo | Severidad original | Estado (2026-09-09) | Evidencia de corrección |
| :-- | :-- | :--: | :--: | :-- |
| H-01 | Contraste insuficiente en `:focus-visible` | 🟠 Alto | ✅ Resuelto | `styles.css:38-47` usa `--color-primary` como color de foco general y `--color-accent` solo sobre fondos oscuros de header/footer, tal como se recomendó. |
| H-02 | Ausencia de *skip link* | 🟠 Alto | ✅ Resuelto | `index.html:12` añade `<a href="#inicio" class="skip-link">`; estilos en `styles.css:61-77`. |
| H-03 | Acordeón de trayectoria sin sincronía ARIA/DOM | 🟠 Alto | ✅ Resuelto | `index.html:75-141` vincula cada botón con `aria-controls` + `id`, y cada panel usa `hidden`, `role="region"` y `aria-labelledby`. `script.js:16` sincroniza `detail.hidden = isOpen`. |
| H-04 | Cabecera *sticky* ocupa demasiada pantalla en móvil | 🟡 Medio | ✅ Resuelto | `styles.css:319-322` desactiva `position: sticky` (pasa a `static`) por debajo de 600px. |
| H-05 | Objetivos táctiles reducidos en navegación | 🟡 Medio | ✅ Resuelto | `styles.css:117-123` añade `padding: 0.5rem 0.6rem` y `display: inline-block` a `.main-nav a`. |
| H-06 | Enlace a Wikipedia sin aviso de nueva pestaña | 🟡 Medio | ✅ Resuelto | `index.html:215` agrega `<span class="visually-hidden">(se abre en una nueva pestaña)</span>`. |
| H-07 | Imágenes sin `width`/`height` (riesgo CLS) | 🟡 Medio | ✅ Resuelto | `index.html:178-179, 188-189, 198-199` declara `width` y `height` explícitos en las tres imágenes de la galería. |
| H-08 | Sin soporte para `prefers-reduced-motion` | 🔵 Bajo | ✅ Resuelto | `styles.css:341-350` desactiva `scroll-behavior` y transiciones/animaciones bajo esa media query. |
| H-09 | Falta de programación defensiva en `script.js` | 🔵 Bajo | ✅ Resuelto | `script.js:9` agrega `if (!toggleButton || !detail) return;`. |
| H-10 | Etiqueta "Contacto" incoherente con el contenido | 🔵 Bajo | ✅ Resuelto | `index.html:23` renombra el enlace del menú a "Referencias". |
| H-11 | Redundancia textual `alt` / `figcaption` en galería | 🔵 Bajo | ✅ Resuelto | Los `alt` actuales describen composición visual específica (encuadre, gesto, expresión) mientras los `figcaption` aportan contexto editorial (evento, año, club), sin solaparse. |

**Conclusión de la verificación:** 11/11 hallazgos originales corregidos correctamente, sin regresiones detectadas en el código circundante.

---

## 3. Matriz de Hallazgos

### Leyenda de Severidad
- 🔴 **Crítico:** Impide totalmente el acceso o navegación para ciertos grupos de usuarios, o representa un riesgo de seguridad explotable.
- 🟠 **Alto:** Dificulta gravemente la accesibilidad/seguridad o incumple directamente criterios de conformidad WCAG 2.2 AA.
- 🟡 **Medio:** Degrada la experiencia de usuario (UX), accesibilidad secundaria, buenas prácticas responsive o de seguridad defensiva.
- 🔵 **Bajo:** Mejora menor de usabilidad, robustez de código o refinamiento visual.

### 3.1–3.4. Hallazgos Históricos (H-01 a H-11)

Todos corregidos y verificados — ver detalle técnico completo de cada hallazgo, evidencia original y recomendación aplicada en el **Anexo A** al final de este documento. Se conserva el detalle original para trazabilidad, ya que las correcciones referencian esas recomendaciones exactas.

### 3.5. Hallazgos Nuevos — Módulo de Observabilidad Local (`observabilidad.*`)

Contexto: `observabilidad.js` se carga en ambas páginas (`index.html` y `observabilidad.html`) e instrumenta rendimiento de navegación, errores JS, clics y visibilidad de pestaña, guardando todo bajo el prefijo de clave `cr7-observability` **exclusivamente en `localStorage`**. No existe transmisión de red hacia servidores propios o de terceros (confirmado por inspección de código: no hay `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `<img>` de tracking ni WebSockets en el archivo).

#### [H-12] Acción destructiva "Limpiar almacenamiento" sin confirmación
- **Severidad:** 🟡 Medio
- **Criterio:** UX defensivo / Prevención de errores (WCAG 3.3.4 aplicado por analogía, aunque el criterio formal aplica a transacciones)
- **Archivo afectado:** `observabilidad.html:40`, `observabilidad.js:521-527`
- **Evidencia:** El botón `#cr7-clear` invoca `CR7Observability.clearAll()` de inmediato al primer clic, sin diálogo de confirmación (`confirm()` o modal accesible), borrando todos los eventos y la sesión capturada de forma irreversible.
- **Impacto:** Un clic accidental (especialmente en móvil, donde los botones ocupan el 100% del ancho) elimina permanentemente el historial local sin posibilidad de deshacer.
- **Recomendación de corrección:**
  ```javascript
  clearBtn.addEventListener("click", function () {
    if (!window.confirm("¿Seguro que quieres borrar todos los datos locales de observabilidad? Esta acción no se puede deshacer.")) {
      return;
    }
    window.CR7Observability.clearAll();
    window.CR7Observability.captureSession();
    refresh("Almacenamiento local limpiado.");
  });
  ```

#### [H-13] Ausencia de `Content-Security-Policy` a nivel de documento
- **Severidad:** 🔵 Bajo
- **Criterio:** Defensa en profundidad (OWASP Secure Headers)
- **Archivo afectado:** `index.html`, `observabilidad.html` (sección `<head>`)
- **Evidencia:** Ninguna de las dos páginas define una política `Content-Security-Policy`, ni siquiera vía `<meta http-equiv="Content-Security-Policy">`. GitHub Pages no permite configurar cabeceras HTTP personalizadas para sitios estáticos servidos desde una rama, por lo que la única vía disponible es la etiqueta `<meta>`.
- **Impacto:** Bajo en el estado actual (no hay entrada de datos de usuario que se inserte vía `innerHTML`, ni scripts de terceros), pero es una capa de defensa recomendable ante cambios futuros.
- **Recomendación de corrección:**
  ```html
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self' https://upload.wikimedia.org; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'">
  ```
  (Ajustar `img-src` si cambian los orígenes de las imágenes de la galería.)

#### [H-14] Captor de clics genérico sin lista de exclusión para campos sensibles futuros
- **Severidad:** 🔵 Bajo (nota de diseño preventiva, no vulnerabilidad activa)
- **Criterio:** Privacidad por diseño
- **Archivo afectado:** `observabilidad.js:236-247` (`handleClick`), `225-234` (`describeElement`)
- **Evidencia:** `handleClick` registra en `localStorage` el `textContent` (hasta 80 caracteres) y atributos (`id`, `className`, `href`) de **cualquier** elemento interactivo (`a, button, input, select, [role='button']`) que reciba clic en cualquier página donde se cargue el script. Hoy el sitio no tiene formularios ni campos con datos personales, por lo que no hay exposición real. Sin embargo, si en el futuro se agregan formularios (login, contacto, newsletter), el registrador capturaría automáticamente el contenido de esos controles sin redacción.
- **Impacto potencial (futuro):** Si se añaden inputs de texto/checkbox con datos sensibles y se reutiliza este mismo script sin ajuste, su contenido podría quedar registrado en `localStorage` del propio usuario (no se transmite a servidores, pero sí queda persistido en el dispositivo más tiempo del necesario).
- **Recomendación de corrección:** Antes de añadir formularios con datos personales, extender `describeElement` con una lista de exclusión (por ejemplo, `data-obs-ignore` o tipos de input sensibles) para omitir su contenido del registro.

**Aspectos positivos verificados en el módulo:**
- Todo el renderizado del panel (`renderSession`, `renderEvents`) usa `textContent`, nunca inserta HTML sin escapar proveniente de datos almacenados — **sin vector de XSS**, incluso si un usuario edita manualmente su propio `localStorage`.
- Acceso a `localStorage` envuelto en `try/catch` con *fallback* a memoria (`hasLocalStorage`, `safeGetJSON`, `safeSetJSON`) — robusto ante modo privado o cuotas excedidas.
- Límite duro de `MAX_EVENTS = 200` evita crecimiento indefinido del almacenamiento.
- Controles con `type="button"` explícito, tamaño mínimo táctil de 44px (`min-height: 44px` en `observabilidad.css:151`) y soporte de `prefers-reduced-motion`.
- Guard `if (window.CR7Observability) return;` evita doble inicialización si el script se incluye más de una vez.

---

## 4. Pruebas que Deben Repetirse Tras las Correcciones (vigente)

1. **Prueba de Contraste Automática y Manual:** re-confirmar con Color Contrast Analyzer que el anillo `:focus-visible` supera 3:1 en todos los fondos, incluyendo los del nuevo panel de observabilidad.
2. **Prueba de Navegación por Teclado:** validar *skip links* (ambas páginas), navegación completa por `Tab` del acordeón y de los cuatro botones del panel de observabilidad.
3. **Prueba con Lectores de Pantalla (NVDA/VoiceOver):** confirmar anuncio correcto de `aria-expanded`/`hidden` en el acordeón y del `role="status" aria-live="polite"` (`#cr7-status`) al pulsar los botones del panel.
4. **Prueba de Dispositivos Móviles (320px, 390px, 768px, 1024px+):** incluir ahora `observabilidad.html`, cuyos botones pasan a `width: 100%` bajo 600px.
5. **Prueba de Reducción de Movimiento:** verificar en ambas páginas.
6. **Prueba manual del flujo de "Limpiar almacenamiento":** confirmar que, una vez aplicado H-12, el diálogo de confirmación se anuncia correctamente por lectores de pantalla.

---

## 5. Alcance de la Verificación Realizada vs. Pendiente de Prueba Manual

### Qué se verificó exhaustivamente:
- Análisis completo del código fuente de las 6 archivos del sitio (HTML/CSS/JS).
- Verificación línea por línea de que los 11 hallazgos originales fueron corregidos según lo recomendado.
- Auditoría de seguridad estática del nuevo módulo de observabilidad (sumideros de XSS, fugas de datos, secretos embebidos).
- Ejecución de pruebas básicas automatizadas (ver §6): sintaxis JS, validación HTML, smoke test HTTP local y en producción.
- Confirmación de publicación y accesibilidad pública del sitio en GitHub Pages, incluyendo HTTPS/HSTS.

### Qué queda pendiente de probar manualmente:
- Simulación en dispositivos móviles reales (iOS Safari, Android Chrome).
- Pruebas con lectores de pantalla reales (NVDA, JAWS, VoiceOver, TalkBack), incluyendo el nuevo panel de observabilidad.
- Confirmación visual del diálogo de confirmación una vez implementado H-12.
- Prueba de carga de imágenes de Wikimedia Commons bajo conexión 3G simulada.

---

## 6. Pruebas de Seguridad y Pruebas Básicas Ejecutadas (2026-09-09)

### 6.1. Pruebas básicas (funcionalidad y sintaxis)

| Prueba | Comando | Resultado |
| :-- | :-- | :--: |
| Sintaxis `script.js` | `node --check script.js` | ✅ Sin errores |
| Sintaxis `observabilidad.js` | `node --check observabilidad.js` | ✅ Sin errores |
| Validación HTML | `npx html-validate index.html observabilidad.html` | ⚠️ 17 avisos de estilo (ver nota) |
| Smoke test local (servidor estático) | `python3 -m http.server` + `curl` a los 6 archivos | ✅ Los 6 devuelven HTTP 200 |
| Smoke test en producción (GitHub Pages) | `curl` a `https://chuchobck.github.io/ejml1/` y sus 5 recursos | ✅ Los 6 devuelven HTTP 200 |

**Nota sobre `html-validate`:** los 17 avisos son de estilo, no funcionales: (a) preferencia por etiquetas de cierre omitidas en `<meta>`, `<link>`, `<img>` en vez de la sintaxis autocerrada `/>` (ambas son válidas en HTML5, es una preferencia de la guía de estilo por defecto de la herramienta); (b) sugerencia de usar `<section>` en vez de `<p role="region">` para los paneles del acordeón. Ninguno de los dos afecta el renderizado, la semántica accesible ni la seguridad; se documentan como mejora cosmética opcional, no como hallazgo.

### 6.2. Pruebas de seguridad

| Prueba | Método | Resultado |
| :-- | :-- | :--: |
| Sumideros de XSS (`innerHTML`, `eval`, `document.write`, `new Function`) | `grep` recursivo sobre `.js`/`.html` | ✅ Único uso de `innerHTML` es para vaciar contenedores (`= ""`); sin inserción de datos no confiables |
| Secretos/credenciales embebidos (API keys, tokens, contraseñas) | `grep` con patrones de credenciales comunes | ✅ Ninguno encontrado |
| Contenido mixto (recursos `http://` en sitio `https://`) | `grep "http://"` sobre todo el proyecto | ✅ Ninguno; todas las imágenes externas usan `https://` |
| Enlaces externos inseguros (`target="_blank"` sin `rel="noopener noreferrer"`) | `grep` sobre `.html` | ✅ El único enlace externo (Wikipedia) ya incluye `rel="noopener noreferrer"` |
| Exfiltración de datos del módulo de observabilidad | Revisión de `observabilidad.js` completo | ✅ Sin `fetch`/`XMLHttpRequest`/`sendBeacon`; todo persiste solo en `localStorage` |
| Cabeceras de seguridad HTTP en producción | `curl -I https://chuchobck.github.io/ejml1/` | ✅ HSTS activo (`strict-transport-security: max-age=31556952`) y servido por HTTPS; ⚠️ sin `Content-Security-Policy` (ver H-13, limitación de la plataforma GitHub Pages) |

**Conclusión de seguridad:** no se detectaron vulnerabilidades explotables (XSS, fuga de secretos, contenido mixto, *tabnabbing*). Los hallazgos H-12 a H-14 son de robustez/UX/defensa en profundidad, no exploits confirmados.

---

## 7. Estado de Publicación

- **Plataforma:** GitHub Pages
- **Repositorio:** `chuchobck/ejml1` (rama `main`, carpeta raíz `/`)
- **URL pública:** https://chuchobck.github.io/ejml1/
- **Verificación:** confirmado HTTP 200 en la página principal y en los 5 recursos restantes (`observabilidad.html`, `styles.css`, `script.js`, `observabilidad.css`, `observabilidad.js`) tras la activación del despliegue el 2026-09-09.
- **HTTPS:** forzado, con `Strict-Transport-Security` activo.

---

## Anexo A — Detalle Técnico Original de los Hallazgos H-01 a H-11 (7 de septiembre de 2026)

> Se conserva para trazabilidad. Todos los ítems de este anexo están marcados como **✅ Resueltos** en la verificación de §2.

### A.1. Hallazgos Críticos
*No se encontraron hallazgos de severidad crítica.*

### A.2. Hallazgos Altos

#### [H-01] Contraste insuficiente en el indicador de foco visible (`:focus-visible`)
- **Severidad:** 🟠 Alto — **Estado: ✅ Resuelto**
- **Criterio WCAG:** 1.4.11 Non-text Contrast (Nivel AA) / 2.4.13 Focus Appearance (WCAG 2.2 AA)
- **Archivo afectado (original):** `styles.css` (Líneas 38–42)
- **Evidencia original:**
  ```css
  a:focus-visible,
  button:focus-visible {
    outline: 3px solid var(--color-accent); /* #d4af37 */
    outline-offset: 3px;
  }
  ```
  `--color-accent` (`#d4af37`) sobre fondo blanco/gris claro producía un ratio de **2.10:1**, por debajo del mínimo de 3:1.
- **Corrección aplicada:** outline general con `--color-primary` (ratio > 14:1) y `--color-accent` reservado a fondos oscuros de header/footer.

---

#### [H-02] Ausencia de enlace de salto al contenido principal (*Skip Link*)
- **Severidad:** 🟠 Alto — **Estado: ✅ Resuelto**
- **Criterio WCAG:** 2.4.1 Bypass Blocks (Nivel A)
- **Corrección aplicada:** `<a href="#inicio" class="skip-link">Saltar al contenido principal</a>` como primer hijo del `<body>`, con estilos que lo revelan al recibir foco.

---

#### [H-03] Accesibilidad deficiente en el componente interactivo de Trayectoria (Acordeón)
- **Severidad:** 🟠 Alto — **Estado: ✅ Resuelto**
- **Criterio WCAG:** 4.1.2 Name, Role, Value (Nivel A) / 1.3.1 Info and Relationships (Nivel A)
- **Corrección aplicada:** botones con `aria-controls` + `id` únicos, paneles con `hidden`, `role="region"` y `aria-labelledby`; `script.js` sincroniza `detail.hidden` con el estado `aria-expanded`.

### A.3. Hallazgos Medios

#### [H-04] Ocupación excesiva de pantalla por la cabecera fija en móviles
- **Severidad:** 🟡 Medio — **Estado: ✅ Resuelto**
- **Corrección aplicada:** `position: static` para `.site-header` bajo 600px.

#### [H-05] Objetivos táctiles reducidos en enlaces de navegación
- **Severidad:** 🟡 Medio — **Estado: ✅ Resuelto**
- **Criterio WCAG:** 2.5.8 Target Size (Minimum)
- **Corrección aplicada:** `padding: 0.5rem 0.6rem` y `display: inline-block` en `.main-nav a`.

#### [H-06] Enlace externo a Wikipedia sin advertencia de apertura en nueva pestaña
- **Severidad:** 🟡 Medio — **Estado: ✅ Resuelto**
- **Corrección aplicada:** texto oculto accesible `(se abre en una nueva pestaña)`.

#### [H-07] Ausencia de atributos explícitos `width`/`height` en imágenes
- **Severidad:** 🟡 Medio — **Estado: ✅ Resuelto**
- **Corrección aplicada:** `width`/`height` intrínsecos declarados en las tres imágenes de la galería.

### A.4. Hallazgos Bajos

#### [H-08] Inexistencia de soporte para `prefers-reduced-motion`
- **Severidad:** 🔵 Bajo — **Estado: ✅ Resuelto**

#### [H-09] Falta de programación defensiva en `script.js`
- **Severidad:** 🔵 Bajo — **Estado: ✅ Resuelto**
- **Corrección aplicada:** `if (!toggleButton || !detail) return;`.

#### [H-10] Etiqueta de navegación "Contacto" incoherente con el contenido
- **Severidad:** 🔵 Bajo — **Estado: ✅ Resuelto**
- **Corrección aplicada:** renombrado a "Referencias".

#### [H-11] Redundancia textual entre `alt` y `<figcaption>` en la galería
- **Severidad:** 🔵 Bajo — **Estado: ✅ Resuelto**
- **Corrección aplicada:** `alt` diferenciado del `figcaption` en las tres imágenes.
