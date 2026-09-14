// Tienda de Videojuegos - Semana 5

// Punto de entrada
document.addEventListener('DOMContentLoaded', () => {
    inicializarFavoritos();
    inicializarHoverCategorias();
    inicializarFormularioBoletin();
    cargarJuegosDestacados();
});

// PASO 1 y 2: Sección "Mis favoritos" + evento click

function inicializarFavoritos() {
    const seccionProductos = document.getElementById('productos');
    if (!seccionProductos) return;

    const seccionFavoritos = document.createElement('section');
    seccionFavoritos.id = 'favoritos';
    seccionFavoritos.className = 'seccion mb-4 p-4 rounded-3';

    const contenedor = document.createElement('div');
    contenedor.className = 'container';

    const titulo = document.createElement('h2');
    titulo.className = 'fs-3';
    titulo.textContent = 'Mis favoritos';

    const descripcion = document.createElement('p');
    descripcion.textContent = 'Los juegos que agregues aparecerán aquí. Usa el botón "Agregar a favoritos" en cualquier producto.';

    const lista = document.createElement('ul');
    lista.id = 'listaFavoritos';
    lista.className = 'lista-favoritos list-unstyled mt-3 mb-0';

    const mensajeVacio = document.createElement('li');
    mensajeVacio.id = 'favoritosVacio';
    mensajeVacio.className = 'text-secondary fst-italic';
    mensajeVacio.textContent = 'Todavía no has agregado juegos favoritos.';
    lista.appendChild(mensajeVacio);

    contenedor.appendChild(titulo);
    contenedor.appendChild(descripcion);
    contenedor.appendChild(lista);
    seccionFavoritos.appendChild(contenedor);

    // Insertamos la nueva sección justo después de "Productos destacados"
    seccionProductos.insertAdjacentElement('afterend', seccionFavoritos);

    // --- Agregar el botón "Agregar a favoritos" en cada tarjeta existente ---
    const tarjetas = document.querySelectorAll('.producto');
    tarjetas.forEach((tarjeta) => {
        const cuerpo = tarjeta.querySelector('.card-body');
        const tituloJuego = tarjeta.querySelector('.card-title').textContent.trim();

        const botonFavorito = document.createElement('button');
        botonFavorito.type = 'button';
        botonFavorito.className = 'btn btn-outline-light btn-sm btn-favorito mt-2';
        botonFavorito.textContent = '♡ Agregar a favoritos';

        // Evento click: agrega o quita el juego de la lista de favoritos
        botonFavorito.addEventListener('click', () => {
            alternarFavorito(tituloJuego, botonFavorito);
        });

        cuerpo.appendChild(botonFavorito);
    });
}

/**
 * Agrega o elimina un juego de la lista de favoritos según su estado
 * actual. Se reutiliza tanto desde el botón de la tarjeta como desde
 * el botón "Quitar" de la propia lista, evitando código repetido.
 */
function alternarFavorito(nombreJuego, boton) {
    const lista = document.getElementById('listaFavoritos');
    const mensajeVacio = document.getElementById('favoritosVacio');
    const idItem = 'fav-' + nombreJuego.replace(/\s+/g, '-').toLowerCase();
    const itemExistente = document.getElementById(idItem);

    if (itemExistente) {
        // Ya estaba en favoritos -> se elimina de la lista
        itemExistente.remove();
        boton.textContent = '♡ Agregar a favoritos';
        boton.classList.remove('btn-favorito-activo');
    } else {
        // No estaba en favoritos -> se crea y se agrega el elemento
        const item = document.createElement('li');
        item.id = idItem;
        item.className = 'item-favorito d-flex justify-content-between align-items-center py-2';

        const texto = document.createElement('span');
        texto.textContent = '🎮 ' + nombreJuego;

        const botonQuitar = document.createElement('button');
        botonQuitar.type = 'button';
        botonQuitar.className = 'btn btn-sm btn-outline-danger';
        botonQuitar.textContent = 'Quitar';
        botonQuitar.addEventListener('click', () => alternarFavorito(nombreJuego, boton));

        item.appendChild(texto);
        item.appendChild(botonQuitar);
        lista.appendChild(item);

        boton.textContent = '♥ En favoritos';
        boton.classList.add('btn-favorito-activo');
    }

    // Mostramos u ocultamos el mensaje de "lista vacía" según corresponda
    mensajeVacio.style.display = lista.children.length > 1 ? 'none' : 'list-item';
}

// PASO 2: Evento mouseover / mouseout en las categorías

function inicializarHoverCategorias() {
    const categorias = document.querySelectorAll('.categoria');
    categorias.forEach((categoria) => {
        categoria.addEventListener('mouseover', () => {
            categoria.classList.add('categoria-activa');
        });
        categoria.addEventListener('mouseout', () => {
            categoria.classList.remove('categoria-activa');
        });
    });
}

// PASO 2: Evento submit en el formulario de boletín

function inicializarFormularioBoletin() {
    const formulario = document.getElementById('formBoletin');
    if (!formulario) return;

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault(); // evita que la página se recargue

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

        mostrarMensajeFormulario(`¡Gracias ${nombre}! Te suscribiste con ${correo}.`, 'exito');
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

// PASO 3: Fetch API para cargar juegos externos

async function cargarJuegosDestacados() {
    const seccionCategorias = document.getElementById('categorias');
    if (!seccionCategorias) return;

    // --- Crear la sección donde se mostrarán los juegos ---
    const seccion = document.createElement('section');
    seccion.id = 'juegos-externos';
    seccion.className = 'seccion mb-4 p-4 rounded-3';

    const contenedor = document.createElement('div');
    contenedor.className = 'container';

    const titulo = document.createElement('h2');
    titulo.className = 'fs-3';
    titulo.textContent = 'Más juegos que te pueden interesar';

    const listaJuegos = document.createElement('div');
    listaJuegos.id = 'listaJuegosExternos';
    listaJuegos.className = 'row g-4 mt-2';

    // Mensaje que se muestra mientras se obtienen los datos
    const cargando = document.createElement('p');
    cargando.id = 'estadoCarga';
    cargando.className = 'text-secondary fst-italic';
    cargando.textContent = 'Cargando juegos...';

    contenedor.appendChild(titulo);
    contenedor.appendChild(cargando);
    contenedor.appendChild(listaJuegos);
    seccion.appendChild(contenedor);
    seccionCategorias.insertAdjacentElement('afterend', seccion);

    // --- Fetch API con manejo de promesas (async/await) y errores ---
    try {
        const respuesta = await fetch('data/juegos.json');

        if (!respuesta.ok) {
            throw new Error('No se pudo obtener la información (' + respuesta.status + ')');
        }

        const juegos = await respuesta.json();
        renderizarJuegosExternos(juegos, listaJuegos);
        cargando.remove();

    } catch (error) {
        cargando.textContent = 'No se pudieron cargar los juegos. Intenta nuevamente más tarde.';
        cargando.className = 'mensaje-error';
        console.error('Error al cargar juegos.json:', error);
    }
}


function renderizarJuegosExternos(juegos, contenedorLista) {
    juegos.forEach((juego) => {
        const columna = document.createElement('div');
        columna.className = 'col-12 col-md-6 col-lg-4';

        const tarjeta = document.createElement('article');
        tarjeta.className = 'card producto-externo h-100 p-3';

        // Usamos innerHTML para construir el contenido interno de la tarjeta
        tarjeta.innerHTML = `
            <h3 class="card-title">${juego.titulo}</h3>
            <span class="badge-genero mb-2">${juego.genero}</span>
            <p class="card-text">${juego.descripcion}</p>
        `;

        columna.appendChild(tarjeta);
        contenedorLista.appendChild(columna);
    });
}
