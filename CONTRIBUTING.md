# Guía de contribución

Convenciones para modificar este sitio estático (HTML + CSS + JS vanilla, sin frameworks ni backend).

## Estructura

- `index.html` — contenido y estructura semántica (header, nav, main, footer).
- `styles.css` — todos los estilos. Sin CSS embebido en el HTML.
- `script.js` — toda la lógica. Sin JS embebido (`onclick=...`) en el HTML.

## Reglas generales

- No introducir frameworks, librerías externas ni dependencias de build. El sitio debe seguir abriéndose directamente con un servidor estático (Live Server, `python3 -m http.server`).
- Textos en español, claros y sin errores ortográficos.
- Mantener el HTML semántico: usar `section`, `article`, `nav`, `figure`/`figcaption`, encabezados en orden jerárquico (`h1` único, luego `h2`, `h3`...).
- Cada `<img>` debe llevar un `alt` descriptivo (no genérico como "imagen" o vacío).
- Todo enlace interno (`href="#id"`) debe apuntar a un `id` que exista en el documento.

## Accesibilidad

- Elementos interactivos (botones, enlaces) deben ser focoables por teclado de forma nativa; evitar `tabindex="0"` en elementos no interactivos o redundantes junto a un control ya focoable.
- Mantener estilos `:focus-visible` visibles (outline) en enlaces y botones — no eliminarlos.
- Los componentes interactivos con estado (como la línea de tiempo) deben reflejar el estado en `aria-expanded` u otro atributo ARIA equivalente.

## JavaScript

- Vanilla JS únicamente, sin dependencias externas.
- Registrar la lógica dentro de `DOMContentLoaded`.
- Antes de confirmar un cambio, validar sintaxis con:

  ```bash
  node --check script.js
  ```

## CSS

- Usar las variables definidas en `:root` (`--color-primary`, `--color-accent`, etc.) en lugar de colores sueltos.
- Mantener el diseño responsive: probar cambios de layout contra el breakpoint existente (`max-width: 600px`) y añadir otros si hace falta.

## Antes de dar por cerrado un cambio

1. `node --check script.js` sin errores.
2. Verificar que todos los `href="#..."` tengan su `id` correspondiente.
3. Verificar que las imágenes nuevas tengan `alt` descriptivo.
4. Probar manualmente en el navegador (Live Server): navegación por teclado, enlaces, y que no haya errores en la consola.
