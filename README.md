# Tienda de Videojuegos

eCommerce desarrollado con **Bootstrap 5** y **JavaScript**, que permite explorar un catálogo de videojuegos, filtrarlo por categoría o por texto, y agregar productos a un carrito de compras con resumen dinámico. Los productos se cargan de forma externa mediante la **Fetch API**.

🔗 **Demo en GitHub Pages:** https://cristianjtm.github.io/Exp2_S6_Cristian_Torres_DESARROLLO-FRONTEND-I_004A/

## Funcionalidades

- **Catálogo dinámico**: los productos se cargan desde `assets/data/productos.json` usando la Fetch API (`async/await`), con manejo de errores (`response.ok` + `try/catch`) y un mensaje amigable si la carga falla.
- **Carrito de compras**: botón "Agregar al carrito" en cada producto, resumen con cantidad y total actualizado en tiempo real, controles para sumar/restar unidades y para vaciar el carrito.
- **Búsqueda de productos**: formulario que filtra el catálogo visible según el texto ingresado (evento `submit`).
- **Filtro por categoría**: desde el menú desplegable de la barra de navegación o desde la sección "Categorías" (con efecto `mouseover`/`mouseout`).
- **Formulario de boletín**: valida nombre y correo, y muestra un mensaje de éxito o error sin recargar la página.
- **Diseño responsivo**: navegación con menú hamburguesa, grid adaptable y carrusel de destacados, construidos con componentes y utilidades de Bootstrap 5.

## Tecnologías

- HTML5 semántico
- Bootstrap 5.3.8 (CSS y JS bundle vía CDN)
- CSS propio para la identidad visual del sitio
- JavaScript (ES6+): manipulación del DOM, delegación de eventos y Fetch API

## Estructura del proyecto

```
│   index.html
│   README.md
│
├───assets
│   ├───css
│   │       style.css
│   │
│   ├───data
│   │       productos.json
│   │
│   ├───img
│   │       videojuego1.jpg ... videojuego8.jpg
│   │
│   └───js
│           script.js
│
└───evidencias
        chrome.png
        firefox.png
        laptop.png
        movil.png
        msedge.png
        tablet.png
```

## Cómo ejecutar el proyecto localmente

Como el sitio carga `productos.json` con la Fetch API, no se puede abrir `index.html` directamente con doble click (el navegador bloquea el `fetch` en archivos `file://`). Hay que servirlo con un servidor local:

**Opción A — Live Server (VS Code)**
1. Instala la extensión "Live Server".
2. Click derecho sobre `index.html` → "Open with Live Server".

**Opción B — Python**
```bash
python -m http.server
```
Y abre `http://localhost:8000` en el navegador.

## Autor

[Tu nombre] — [Sigla del curso]