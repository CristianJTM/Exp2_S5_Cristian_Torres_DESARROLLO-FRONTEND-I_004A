// ============================================================
// app.jsx
// Tienda de Videojuegos - Semana 7 (React: componentes funcionales)
// Sin herramientas de compilación: React y Babel se cargan por CDN
// y este archivo se transforma en el navegador (type="text/babel").
// ============================================================

const { useState, useEffect } = React;
const { createPortal } = ReactDOM;

/**
 * Da formato de precio en pesos chilenos a un número.
 * Función reutilizable, usada por varios componentes.
 */
function formatearPrecio(numero) {
    return Number(numero).toLocaleString('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    });
}


// ------------------------------------------------------------
// COMPONENTE: ProductoCard
// Muestra un único producto: imagen, nombre, categoría, precio
// (con oferta si corresponde), descripción y botón para comprar.
// ------------------------------------------------------------
function ProductoCard({ producto, onAgregarAlCarrito }) {
    // Renderizado condicional: si el producto tiene precioOferta,
    // mostramos el precio normal tachado + el precio de oferta.
    const tieneOferta = producto.precioOferta !== null && producto.precioOferta !== undefined;

    return (
        <div className="col-12 col-md-6 col-lg-4 producto-item">
            <article className="card producto h-100">
                <img
                    src={producto.imagen}
                    className="card-img-top"
                    alt={'Portada de ' + producto.nombre}
                />

                <div className="card-body d-flex flex-column">
                    <h3 className="card-title">{producto.nombre}</h3>

                    <span className="badge-categoria mb-2">{producto.categoria}</span>

                    <p className="card-text">{producto.descripcion}</p>

                    {/* Precio: normal, o normal tachado + oferta si existe */}
                    {tieneOferta ? (
                        <p className="mb-2">
                            <span className="precio-tachado">{formatearPrecio(producto.precio)}</span>
                            <span className="precio-oferta">{formatearPrecio(producto.precioOferta)}</span>
                            <span className="badge-oferta ms-2">Oferta</span>
                        </p>
                    ) : (
                        <p className="precio-producto mb-2">{formatearPrecio(producto.precio)}</p>
                    )}

                    <button
                        type="button"
                        className="btn btn-primary mt-auto"
                        onClick={() => onAgregarAlCarrito(producto)}
                    >
                        Agregar al carrito
                    </button>
                </div>
            </article>
        </div>
    );
}


// ------------------------------------------------------------
// COMPONENTE: Buscador
// Input controlado (useState en el padre) que filtra el catálogo
// mientras el usuario escribe, usando el evento onChange.
// ------------------------------------------------------------
function Buscador({ valor, onCambiar }) {
    return (
        <div className="row g-2 mb-3">
            <div className="col-12 col-md-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre..."
                    value={valor}
                    onChange={(evento) => onCambiar(evento.target.value)}
                />
            </div>
        </div>
    );
}


// ------------------------------------------------------------
// COMPONENTE: FiltroCategorias
// Muestra las categorías disponibles como botones; al hacer click
// se filtra el catálogo. Resalta la categoría seleccionada.
// ------------------------------------------------------------
function FiltroCategorias({ categorias, categoriaSeleccionada, onSeleccionar }) {
    return (
        <section id="categorias" className="seccion mb-4 p-4 rounded-3">
            <div className="container">
                <h2 className="fs-3">Categorías</h2>
                <p>Haz click en una categoría para filtrar el catálogo.</p>

                <div className="row g-3">
                    <div className="col-12 col-sm-6 col-lg-4">
                        <div
                            className={'categoria p-3 rounded text-center' + (categoriaSeleccionada === 'todos' ? ' categoria-seleccionada' : '')}
                            onClick={() => onSeleccionar('todos')}
                        >
                            Todos los productos
                        </div>
                    </div>

                    {categorias.map((categoria) => (
                        <div className="col-12 col-sm-6 col-lg-4" key={categoria}>
                            <div
                                className={'categoria p-3 rounded text-center' + (categoriaSeleccionada === categoria ? ' categoria-seleccionada' : '')}
                                onClick={() => onSeleccionar(categoria)}
                            >
                                {categoria}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}


// ------------------------------------------------------------
// COMPONENTE: MenuCategoriasNav
// Opciones de categoría que se renderizan dentro del dropdown del
// navbar (HTML estático) mediante un portal, para que el acceso
// rápido desde la barra de navegación use el mismo estado y la
// misma función de filtrado que la sección "Categorías" de la página.
// ------------------------------------------------------------
function MenuCategoriasNav({ categorias, categoriaSeleccionada, onSeleccionar }) {
    return (
        <>
            <li>
                <a
                    className={'dropdown-item' + (categoriaSeleccionada === 'todos' ? ' active' : '')}
                    href="#productos"
                    onClick={() => onSeleccionar('todos')}
                >
                    Todos los productos
                </a>
            </li>

            {categorias.map((categoria) => (
                <li key={categoria}>
                    <a
                        className={'dropdown-item' + (categoriaSeleccionada === categoria ? ' active' : '')}
                        href="#productos"
                        onClick={() => onSeleccionar(categoria)}
                    >
                        {categoria}
                    </a>
                </li>
            ))}
        </>
    );
}


// ------------------------------------------------------------
// COMPONENTE: ItemCarrito
// Una fila del resumen del carrito, con sus propios controles
// de cantidad. Reutilizable: se repite por cada producto agregado.
// ------------------------------------------------------------
function ItemCarrito({ item, onSumar, onRestar, onEliminar }) {
    return (
        <li className="item-carrito d-flex justify-content-between align-items-center py-2">
            <span>
                {item.nombre} — {formatearPrecio(item.precio)} x {item.cantidad} = {formatearPrecio(item.precio * item.cantidad)}
            </span>

            <span className="controles-carrito">
                <button type="button" className="btn btn-sm btn-outline-light" onClick={() => onRestar(item.id)}>-</button>
                <button type="button" className="btn btn-sm btn-outline-light" onClick={() => onSumar(item.id)}>+</button>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onEliminar(item.id)}>Quitar</button>
            </span>
        </li>
    );
}


// ------------------------------------------------------------
// COMPONENTE: Carrito
// Muestra el resumen de compra: contador de productos, listado
// y total. Renderizado condicional cuando el carrito está vacío.
// ------------------------------------------------------------
function Carrito({ carrito, onSumar, onRestar, onEliminar, onVaciar }) {
    // Valores derivados del estado del carrito (no son estado en sí mismos)
    const cantidadTotal = carrito.reduce((suma, item) => suma + item.cantidad, 0);
    const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

    return (
        <section id="carrito" className="seccion mb-4 p-4 rounded-3">
            <div className="container">
                <h2 className="fs-3">Carrito de compras</h2>
                <p>Tienes {cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'} en tu carrito.</p>

                {/* Renderizado condicional: carrito vacío vs. con productos */}
                {carrito.length === 0 ? (
                    <p className="text-secondary fst-italic">Tu carrito está vacío.</p>
                ) : (
                    <>
                        <ul className="lista-carrito list-unstyled mt-3 mb-3">
                            {carrito.map((item) => (
                                <ItemCarrito
                                    key={item.id}
                                    item={item}
                                    onSumar={onSumar}
                                    onRestar={onRestar}
                                    onEliminar={onEliminar}
                                />
                            ))}
                        </ul>

                        <p id="totalCarrito" className="fs-5 fw-bold mb-3">Total: {formatearPrecio(total)}</p>

                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={onVaciar}>
                            Vaciar carrito
                        </button>
                    </>
                )}
            </div>
        </section>
    );
}


// ------------------------------------------------------------
// COMPONENTE: SeccionProductos
// Agrupa el buscador y la grilla de productos. Maneja los tres
// estados posibles de la carga: cargando, error, o datos listos.
// ------------------------------------------------------------
function SeccionProductos({ cargando, error, productos, busqueda, onCambiarBusqueda, onAgregarAlCarrito }) {
    return (
        <section id="productos" className="seccion mb-4 p-4 rounded-3">
            <div className="container">
                <h2 className="fs-3">Productos destacados</h2>
                <p>Conoce algunos de los videojuegos más destacados disponibles en nuestra tienda.</p>

                <Buscador valor={busqueda} onCambiar={onCambiarBusqueda} />

                {/* Renderizado condicional según el estado de la carga */}
                {cargando && (
                    <p className="text-secondary fst-italic">Cargando productos...</p>
                )}

                {!cargando && error && (
                    <p className="mensaje-error">No se pudieron cargar los productos. Intenta nuevamente más tarde.</p>
                )}

                {!cargando && !error && productos.length === 0 && (
                    <p className="text-secondary fst-italic mt-3">No se encontraron productos que coincidan con tu búsqueda.</p>
                )}

                {!cargando && !error && productos.length > 0 && (
                    <div className="row g-4 mt-2">
                        {productos.map((producto) => (
                            <ProductoCard
                                key={producto.id}
                                producto={producto}
                                onAgregarAlCarrito={onAgregarAlCarrito}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}


// ------------------------------------------------------------
// COMPONENTE: App (raíz de la tienda)
// Guarda el estado principal (productos, carrito, filtros) y
// coordina los componentes hijos pasándoles props y funciones.
// ------------------------------------------------------------
function App() {
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(false);
    const [carrito, setCarrito] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todos');

    // Carga el catálogo una sola vez, al montar el componente (Fetch API + Hooks)
    useEffect(() => {
        fetch('assets/data/productos.json')
            .then((respuesta) => {
                if (!respuesta.ok) {
                    throw new Error('No se pudo obtener el catálogo (' + respuesta.status + ')');
                }
                return respuesta.json();
            })
            .then((datos) => {
                setProductos(datos);
                setCargando(false);
            })
            .catch((err) => {
                console.error('Error al cargar productos.json:', err);
                setError(true);
                setCargando(false);
            });
    }, []);

    /** Agrega un producto al carrito, o suma 1 si ya estaba agregado. */
    function agregarAlCarrito(producto) {
        const precioFinal = producto.precioOferta ?? producto.precio;

        setCarrito((carritoActual) => {
            const yaExiste = carritoActual.find((item) => item.id === producto.id);

            if (yaExiste) {
                return carritoActual.map((item) =>
                    item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
                );
            }

            return [...carritoActual, { id: producto.id, nombre: producto.nombre, precio: precioFinal, cantidad: 1 }];
        });
    }

    /** Suma una unidad a un producto que ya está en el carrito. */
    function sumarUnidad(id) {
        setCarrito((carritoActual) =>
            carritoActual.map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item))
        );
    }

    /** Resta una unidad; si llega a 0, el producto se elimina del carrito. */
    function restarUnidad(id) {
        setCarrito((carritoActual) =>
            carritoActual
                .map((item) => (item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item))
                .filter((item) => item.cantidad > 0)
        );
    }

    /** Elimina por completo un producto del carrito. */
    function eliminarDelCarrito(id) {
        setCarrito((carritoActual) => carritoActual.filter((item) => item.id !== id));
    }

    /** Vacía todo el carrito. */
    function vaciarCarrito() {
        setCarrito([]);
    }

    // Lista de categorías únicas, calculada a partir del catálogo cargado
    const categorias = [...new Set(productos.map((producto) => producto.categoria))];

    // Productos visibles según el texto buscado y la categoría seleccionada
    const productosFiltrados = productos.filter((producto) => {
        const coincideNombre = producto.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideCategoria = categoriaSeleccionada === 'todos' || producto.categoria === categoriaSeleccionada;
        return coincideNombre && coincideCategoria;
    });

    // Nodo del navbar (HTML estático) donde se "teletransportan" las
    // opciones de categoría, manteniendo el estado en este componente.
    const nodoMenuNav = document.getElementById('listaCategoriasNav');

    return (
        <>
            {nodoMenuNav && createPortal(
                <MenuCategoriasNav
                    categorias={categorias}
                    categoriaSeleccionada={categoriaSeleccionada}
                    onSeleccionar={setCategoriaSeleccionada}
                />,
                nodoMenuNav
            )}

            <SeccionProductos
                cargando={cargando}
                error={error}
                productos={productosFiltrados}
                busqueda={busqueda}
                onCambiarBusqueda={setBusqueda}
                onAgregarAlCarrito={agregarAlCarrito}
            />

            <Carrito
                carrito={carrito}
                onSumar={sumarUnidad}
                onRestar={restarUnidad}
                onEliminar={eliminarDelCarrito}
                onVaciar={vaciarCarrito}
            />

            <FiltroCategorias
                categorias={categorias}
                categoriaSeleccionada={categoriaSeleccionada}
                onSeleccionar={setCategoriaSeleccionada}
            />
        </>
    );
}


// ------------------------------------------------------------
// COMPONENTE: BoletinForm
// Formulario de suscripción con inputs controlados (useState) y
// validación al enviar. Se monta como una segunda raíz de React,
// independiente de la tienda.
// ------------------------------------------------------------
function BoletinForm() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [mensaje, setMensaje] = useState(null); // { texto, tipo: 'exito' | 'error' }

    function manejarEnvio(evento) {
        evento.preventDefault();
        const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (nombre.trim() === '' || correo.trim() === '') {
            setMensaje({ texto: 'Por favor completa todos los campos.', tipo: 'error' });
            return;
        }

        if (!expresionCorreo.test(correo)) {
            setMensaje({ texto: 'Ingresa un correo electrónico válido.', tipo: 'error' });
            return;
        }

        setMensaje({ texto: '¡Gracias ' + nombre + '! Te suscribiste con ' + correo + '.', tipo: 'exito' });
        setNombre('');
        setCorreo('');
    }

    return (
        <form onSubmit={manejarEnvio} className="mt-4" noValidate>
            <h3 className="fs-5">Suscríbete a nuestro boletín</h3>

            <div className="mb-3">
                <label htmlFor="nombreBoletin" className="form-label">Nombre</label>
                <input
                    type="text"
                    className="form-control"
                    id="nombreBoletin"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={(evento) => setNombre(evento.target.value)}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="correoBoletin" className="form-label">Correo electrónico</label>
                <input
                    type="email"
                    className="form-control"
                    id="correoBoletin"
                    placeholder="tucorreo@ejemplo.com"
                    value={correo}
                    onChange={(evento) => setCorreo(evento.target.value)}
                />
            </div>

            <button type="submit" className="btn btn-primary">Suscribirme</button>

            {/* Renderizado condicional: solo se muestra si hay un mensaje que informar */}
            {mensaje && (
                <p className={(mensaje.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error') + ' mt-2 mb-0'}>
                    {mensaje.texto}
                </p>
            )}
        </form>
    );
}


// ------------------------------------------------------------
// MONTAJE: dos raíces independientes de React en la misma página
// ------------------------------------------------------------
ReactDOM.createRoot(document.getElementById('raiz-tienda')).render(<App />);
ReactDOM.createRoot(document.getElementById('raiz-boletin')).render(<BoletinForm />);