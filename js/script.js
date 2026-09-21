// ============================================================
// script.js
// Tienda de Videojuegos - Semana 6 (eCommerce con Bootstrap 5 + JS)
// Carga de productos con Fetch API, carrito de compras, búsqueda
// y filtrado por categoría, todo con manipulación del DOM.
// ============================================================

// Estado del carrito en memoria: cada item = { id, nombre, precio, cantidad }
let carrito = [];

// Punto de entrada: esperamos a que el HTML exista antes de manipularlo.
document.addEventListener('DOMContentLoaded', () => {
    inicializarCategorias();
    inicializarCarrito();
    inicializarBusqueda();
    inicializarFormularioBoletin();
    cargarProductos();
});


// ------------------------------------------------------------
// FETCH API: carga del catálogo de productos
// ------------------------------------------------------------

/**
 * Usa la Fetch API para obtener el catálogo desde assets/data/productos.json
 * y renderizarlo en la grilla principal. Maneja tanto la carga exitosa
 * como errores de red o de formato con un mensaje amigable.
 */
async function cargarProductos() {
    const contenedor = document.getElementById('listaProductos');
    const estado = document.getElementById('estadoProductos');

    try {
        const respuesta = await fetch('assets/data/productos.json');

        // response.ok evita procesar una respuesta fallida (404, 500, etc.)
        if (!respuesta.ok) {
            throw new Error('No se pudo obtener el catálogo (' + respuesta.status + ')');
        }

        const productos = await respuesta.json();
        renderizarProductos(productos, contenedor);
        estado.remove();

    } catch (error) {
        estado.textContent = 'No se pudieron cargar los productos. Intenta nuevamente más tarde.';
        estado.className = 'mensaje-error';
        console.error('Error al cargar productos.json:', error);
    }
}

/**
 * Crea una tarjeta por cada producto del catálogo usando createElement
 * y textContent (en vez de innerHTML), y la agrega a la grilla.
 */
function renderizarProductos(productos, contenedor) {
    productos.forEach((producto) => {
        const columna = document.createElement('div');
        columna.className = 'col-12 col-md-6 col-lg-4 producto-item';
        columna.dataset.categoria = producto.categoria;
        columna.dataset.nombre = producto.titulo;

        const tarjeta = document.createElement('article');
        tarjeta.className = 'card producto h-100';

        const imagen = document.createElement('img');
        imagen.src = producto.imagen;
        imagen.className = 'card-img-top';
        imagen.alt = 'Portada de ' + producto.titulo;

        const cuerpo = document.createElement('div');
        cuerpo.className = 'card-body d-flex flex-column';

        const titulo = document.createElement('h3');
        titulo.className = 'card-title';
        titulo.textContent = producto.titulo;

        const categoria = document.createElement('span');
        categoria.className = 'badge-categoria mb-2';
        categoria.textContent = producto.categoria;

        const descripcion = document.createElement('p');
        descripcion.className = 'card-text';
        descripcion.textContent = producto.descripcion;

        const precio = document.createElement('p');
        precio.className = 'precio-producto';
        precio.textContent = formatearPrecio(producto.precio);

        const botonCarrito = document.createElement('button');
        botonCarrito.type = 'button';
        botonCarrito.className = 'btn btn-primary mt-auto btn-agregar-carrito';
        botonCarrito.textContent = 'Agregar al carrito';
        botonCarrito.dataset.id = producto.id;
        botonCarrito.dataset.nombre = producto.titulo;
        botonCarrito.dataset.precio = producto.precio;

        cuerpo.appendChild(titulo);
        cuerpo.appendChild(categoria);
        cuerpo.appendChild(descripcion);
        cuerpo.appendChild(precio);
        cuerpo.appendChild(botonCarrito);

        tarjeta.appendChild(imagen);
        tarjeta.appendChild(cuerpo);
        columna.appendChild(tarjeta);
        contenedor.appendChild(columna);
    });
}

/** Formatea un número como precio en pesos chilenos. Función reutilizable. */
function formatearPrecio(numero) {
    return Number(numero).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });
}


// ------------------------------------------------------------
// CARRITO DE COMPRAS: evento click + manipulación dinámica del DOM
// ------------------------------------------------------------

/**
 * Crea la sección "Carrito de compras" dinámicamente y registra los
 * listeners necesarios usando delegación de eventos: un solo listener
 * por contenedor en vez de uno por cada botón individual.
 */
function inicializarCarrito() {
    crearSeccionCarrito();

    // Un solo listener para todos los botones "Agregar al carrito",
    // incluso los que se agregan después vía Fetch API.
    const contenedorProductos = document.getElementById('listaProductos');
    contenedorProductos.addEventListener('click', (evento) => {
        const boton = evento.target.closest('.btn-agregar-carrito');
        if (!boton) return;

        agregarAlCarrito({
            id: boton.dataset.id,
            nombre: boton.dataset.nombre,
            precio: Number(boton.dataset.precio)
        });
    });

    // Un solo listener para los botones +/- y "Quitar" dentro del carrito
    const listaCarrito = document.getElementById('listaCarrito');
    listaCarrito.addEventListener('click', (evento) => {
        const botonMas = evento.target.closest('.btn-mas');
        const botonMenos = evento.target.closest('.btn-menos');
        const botonQuitar = evento.target.closest('.btn-quitar-carrito');

        if (botonMas) cambiarCantidad(botonMas.dataset.id, 1);
        if (botonMenos) cambiarCantidad(botonMenos.dataset.id, -1);
        if (botonQuitar) quitarDelCarrito(botonQuitar.dataset.id);
    });

    document.getElementById('btnVaciarCarrito').addEventListener('click', () => {
        carrito = [];
        renderizarCarrito();
    });
}

/** Construye la sección del carrito con createElement/appendChild y la inserta en el DOM. */
function crearSeccionCarrito() {
    const seccionProductos = document.getElementById('productos');

    const seccion = document.createElement('section');
    seccion.id = 'carrito';
    seccion.className = 'seccion mb-4 p-4 rounded-3';

    const contenedor = document.createElement('div');
    contenedor.className = 'container';

    const titulo = document.createElement('h2');
    titulo.className = 'fs-3';
    titulo.textContent = 'Carrito de compras';

    const descripcion = document.createElement('p');
    descripcion.textContent = 'Agrega productos con el botón "Agregar al carrito" y revisa aquí tu resumen de compra.';

    const lista = document.createElement('ul');
    lista.id = 'listaCarrito';
    lista.className = 'lista-carrito list-unstyled mt-3 mb-3';

    const total = document.createElement('p');
    total.id = 'totalCarrito';
    total.className = 'fs-5 fw-bold mb-3';
    total.textContent = 'Total: ' + formatearPrecio(0);

    const botonVaciar = document.createElement('button');
    botonVaciar.type = 'button';
    botonVaciar.id = 'btnVaciarCarrito';
    botonVaciar.className = 'btn btn-outline-danger btn-sm';
    botonVaciar.textContent = 'Vaciar carrito';

    contenedor.appendChild(titulo);
    contenedor.appendChild(descripcion);
    contenedor.appendChild(lista);
    contenedor.appendChild(total);
    contenedor.appendChild(botonVaciar);
    seccion.appendChild(contenedor);

    seccionProductos.insertAdjacentElement('afterend', seccion);
    renderizarCarrito(); // pinta el estado inicial ("carrito vacío")
}

/** Agrega un producto al carrito, o suma 1 a su cantidad si ya estaba. */
function agregarAlCarrito(producto) {
    const itemExistente = carrito.find((item) => item.id === producto.id);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    renderizarCarrito();
}

/** Suma o resta unidades de un producto; lo elimina si llega a 0. */
function cambiarCantidad(id, delta) {
    const item = carrito.find((item) => item.id === id);
    if (!item) return;

    item.cantidad += delta;
    if (item.cantidad <= 0) {
        carrito = carrito.filter((item) => item.id !== id);
    }

    renderizarCarrito();
}

/** Elimina por completo un producto del carrito. */
function quitarDelCarrito(id) {
    carrito = carrito.filter((item) => item.id !== id);
    renderizarCarrito();
}

/**
 * Reconstruye el resumen del carrito a partir del arreglo `carrito`.
 * Se llama después de cualquier cambio (agregar, quitar, vaciar).
 */
function renderizarCarrito() {
    const lista = document.getElementById('listaCarrito');
    const totalElemento = document.getElementById('totalCarrito');

    lista.innerHTML = ''; // limpiamos para reconstruir la lista completa

    if (carrito.length === 0) {
        const vacio = document.createElement('li');
        vacio.className = 'text-secondary fst-italic';
        vacio.textContent = 'Tu carrito está vacío.';
        lista.appendChild(vacio);
    } else {
        carrito.forEach((item) => {
            lista.appendChild(crearItemCarrito(item));
        });
    }

    const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    totalElemento.textContent = 'Total: ' + formatearPrecio(total);
}

/** Crea el <li> de un producto dentro del carrito, con sus controles de cantidad. */
function crearItemCarrito(item) {
    const li = document.createElement('li');
    li.className = 'item-carrito d-flex justify-content-between align-items-center py-2';

    const info = document.createElement('span');
    info.textContent = item.nombre + ' — ' + formatearPrecio(item.precio) +
        ' x ' + item.cantidad + ' = ' + formatearPrecio(item.precio * item.cantidad);

    const controles = document.createElement('span');
    controles.className = 'controles-carrito';

    const botonMenos = document.createElement('button');
    botonMenos.type = 'button';
    botonMenos.className = 'btn btn-sm btn-outline-light btn-menos';
    botonMenos.dataset.id = item.id;
    botonMenos.textContent = '-';

    const botonMas = document.createElement('button');
    botonMas.type = 'button';
    botonMas.className = 'btn btn-sm btn-outline-light btn-mas';
    botonMas.dataset.id = item.id;
    botonMas.textContent = '+';

    const botonQuitar = document.createElement('button');
    botonQuitar.type = 'button';
    botonQuitar.className = 'btn btn-sm btn-outline-danger btn-quitar-carrito';
    botonQuitar.dataset.id = item.id;
    botonQuitar.textContent = 'Quitar';

    controles.appendChild(botonMenos);
    controles.appendChild(botonMas);
    controles.appendChild(botonQuitar);

    li.appendChild(info);
    li.appendChild(controles);

    return li;
}


// ------------------------------------------------------------
// CATEGORÍAS: mouseover/mouseout + click para filtrar
// ------------------------------------------------------------

/**
 * Resalta cada categoría al pasar el mouse (mouseover/mouseout) y,
 * además, filtra los productos visibles al hacer click sobre ella.
 * También conecta el menú de categorías de la barra de navegación.
 */
function inicializarCategorias() {
    const categorias = document.querySelectorAll('.categoria');
    categorias.forEach((categoria) => {
        categoria.addEventListener('mouseover', () => categoria.classList.add('categoria-activa'));
        categoria.addEventListener('mouseout', () => categoria.classList.remove('categoria-activa'));
        categoria.addEventListener('click', () => filtrarProductosPorCategoria(categoria.dataset.categoria));
    });

    // Delegación en el menú desplegable "Categorías" de la barra de navegación
    const menuCategorias = document.getElementById('menuCategoriasDropdown').parentElement;
    menuCategorias.addEventListener('click', (evento) => {
        const item = evento.target.closest('[data-categoria]');
        if (!item) return;
        filtrarProductosPorCategoria(item.dataset.categoria);
    });
}

/** Muestra solo los productos de la categoría indicada ("todos" = sin filtro). */
function filtrarProductosPorCategoria(categoria) {
    aplicarFiltro((tarjeta) => categoria === 'todos' || tarjeta.dataset.categoria === categoria);
}


// ------------------------------------------------------------
// BÚSQUEDA: evento submit
// ------------------------------------------------------------

/**
 * Procesa el formulario de búsqueda: filtra los productos que ya están
 * en pantalla según el texto ingresado, sin recargar la página.
 */
function inicializarBusqueda() {
    const formulario = document.getElementById('formBusqueda');
    if (!formulario) return;

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        const texto = formulario.busqueda.value.trim().toLowerCase();

        if (texto === '') {
            aplicarFiltro(() => true); // campo vacío -> mostrar todos
            return;
        }

        aplicarFiltro((tarjeta) => tarjeta.dataset.nombre.toLowerCase().includes(texto));
    });
}

/**
 * Función reutilizable que usan tanto el filtro por categoría como la
 * búsqueda: recorre las tarjetas de productos y muestra/oculta cada
 * una según la condición recibida.
 */
function aplicarFiltro(condicion) {
    const tarjetas = document.querySelectorAll('#listaProductos .producto-item');
    let visibles = 0;

    tarjetas.forEach((tarjeta) => {
        const coincide = condicion(tarjeta);
        tarjeta.style.display = coincide ? '' : 'none';
        if (coincide) visibles++;
    });

    mostrarMensajeSinResultados(visibles === 0);
}

/** Crea o quita el mensaje de "sin resultados" según corresponda. */
function mostrarMensajeSinResultados(mostrar) {
    let mensaje = document.getElementById('sinResultados');

    if (mostrar && !mensaje) {
        mensaje = document.createElement('p');
        mensaje.id = 'sinResultados';
        mensaje.className = 'text-secondary fst-italic mt-3';
        mensaje.textContent = 'No se encontraron productos que coincidan con tu búsqueda.';
        document.getElementById('listaProductos').insertAdjacentElement('afterend', mensaje);
    }

    if (!mostrar && mensaje) {
        mensaje.remove();
    }
}


// ------------------------------------------------------------
// FORMULARIO DE BOLETÍN: evento submit (validación de nombre/correo)
// ------------------------------------------------------------

/**
 * Valida el formulario de suscripción al boletín y muestra un mensaje
 * de éxito o error de forma dinámica, sin recargar la página.
 */
function inicializarFormularioBoletin() {
    const formulario = document.getElementById('formBoletin');
    if (!formulario) return;

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const nombre = formulario.nombre.value.trim();
        const correo = formulario.correo.value.trim();
        const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        limpiarMensajeFormulario();

        if (nombre === '' || correo === '') {
            mostrarMensajeFormulario('Por favor completa todos los campos.', 'error');
            return;
        }

        if (!expresionCorreo.test(correo)) {
            mostrarMensajeFormulario('Ingresa un correo electrónico válido.', 'error');
            return;
        }

        mostrarMensajeFormulario('¡Gracias ' + nombre + '! Te suscribiste con ' + correo + '.', 'exito');
        formulario.reset();
    });
}

/** Elimina el mensaje anterior del formulario, si existe (evita duplicados). */
function limpiarMensajeFormulario() {
    const anterior = document.getElementById('mensajeFormulario');
    if (anterior) anterior.remove();
}

/** Crea y muestra un mensaje de éxito o error justo debajo del formulario. */
function mostrarMensajeFormulario(texto, tipo) {
    const formulario = document.getElementById('formBoletin');
    const mensaje = document.createElement('p');
    mensaje.id = 'mensajeFormulario';
    mensaje.className = tipo === 'exito' ? 'mensaje-exito mt-2 mb-0' : 'mensaje-error mt-2 mb-0';
    mensaje.textContent = texto;
    formulario.insertAdjacentElement('afterend', mensaje);
}