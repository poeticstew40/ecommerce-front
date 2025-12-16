import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getProductosByTienda, getProductosByCategoria } from "../services/productos";
import { getCategoriasByTienda } from "../services/categorias";
import { useTienda } from "../contexts/TiendaContext";
import { useCarrito } from "../contexts/CarritoContext";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import Header from "../components/Header.jsx";
import Footer_Landing from "../../landing/components/Footer_Landing.jsx";
import "../styles/Productos.css";
import "../styles/Filtros.css";

/**
 * Convierte un nombre de categoría a un slug para la URL
 * Reemplaza espacios con guiones y normaliza el texto
 */

function categoriaToSlug(nombre) {
    return nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
        .replace(/[^a-z0-9]+/g, "-") // Reemplazar espacios y caracteres especiales con guiones
        .replace(/^-+|-+$/g, ""); // Eliminar guiones al inicio y final
}

/**
 * Componente HomeCategoria
 * 
 * Muestra productos filtrados por categoría
 */
function HomeCategoria() {
    const { nombreTienda, categoriaNombre } = useParams();
    const {tienda, loading: tiendaLoading } = useTienda();
    const { agregarProducto } = useCarrito();
    const [productos, setProductos] = useState([]);
    const [productosOriginales, setProductosOriginales] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaActual, setCategoriaActual] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroOrden, setFiltroOrden] = useState('nuevos');
    const [productosAgregados, setProductosAgregados] = useState(new Set());

    // Función para obtener la imagen principal (misma lógica que en Home.jsx)
    const obtenerImagen = (prod) => {
        // 1. Si viene una lista (nueva logica Java: List<String>)
        if (prod.imagenes && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
            return prod.imagenes[0];
        }
        // 2. Si viene un string (logica vieja: String)
        if (prod.imagen && typeof prod.imagen === 'string' && prod.imagen.trim() !== "") {
            return prod.imagen;
        }
        // 3. Fallback
        return "/default-product.png";
    };

    /**
     * Función para formatear precios con puntos como separadores de miles
     */
    const formatearPrecio = (precio) => {
        const precioRedondeado = Math.round(precio || 0);
        return precioRedondeado.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    useEffect(() => {
        const cargarDatos = async () => {
            if (!nombreTienda) {
                setError("Nombre de tienda no disponible");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                
                // Cargar categorías
                const categoriasData = await getCategoriasByTienda(nombreTienda);
                setCategorias(categoriasData);

                // Buscar la categoría comparando el slug de la URL con el slug del nombre de la categoría
                const categoriaSlug = categoriaNombre || "";
                const categoria = categoriasData.find(
                    cat => categoriaToSlug(cat.nombre) === categoriaSlug
                );

                if (categoria) {
                    setCategoriaActual(categoria);
                    // Cargar productos de esa categoría
                    const productosData = await getProductosByCategoria(nombreTienda, categoria.id);
                    const productosArray = Array.isArray(productosData) ? productosData : [];
                    // Guardar productos originales y aplicar orden inicial
                    setProductosOriginales(productosArray);
                    aplicarFiltro(productosArray, filtroOrden);
                } else {
                    setError("Categoría no encontrada");
                    setProductos([]);
                    setProductosOriginales([]);
                }
            } catch (err) {
                console.error(err);
                setError(`Error cargando productos: ${err.response?.status} ${err.response?.statusText || err.message}`);
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [nombreTienda, categoriaNombre]);

    // Función para aplicar filtros de ordenamiento
    const aplicarFiltro = (productosData, tipoOrden) => {
        let productosOrdenados = [...productosData];
        
        switch(tipoOrden) {
            case 'a-z':
                productosOrdenados.sort((a, b) => {
                    const nombreA = (a.nombre || '').toLowerCase();
                    const nombreB = (b.nombre || '').toLowerCase();
                    return nombreA.localeCompare(nombreB);
                });
                break;
            case 'z-a':
                productosOrdenados.sort((a, b) => {
                    const nombreA = (a.nombre || '').toLowerCase();
                    const nombreB = (b.nombre || '').toLowerCase();
                    return nombreB.localeCompare(nombreA);
                });
                break;
            case 'precio-menor':
                productosOrdenados.sort((a, b) => (a.precio || 0) - (b.precio || 0));
                break;
            case 'precio-mayor':
                productosOrdenados.sort((a, b) => (b.precio || 0) - (a.precio || 0));
                break;
            case 'nuevos':
                productosOrdenados.sort((a, b) => (b.id || 0) - (a.id || 0));
                break;
            case 'viejos':
                productosOrdenados.sort((a, b) => (a.id || 0) - (b.id || 0));
                break;
            default:
                productosOrdenados.sort((a, b) => (b.id || 0) - (a.id || 0));
        }
        
        setProductos(productosOrdenados);
    };

    // Efecto para aplicar filtro cuando cambia
    useEffect(() => {
        if (productosOriginales.length > 0) {
            aplicarFiltro(productosOriginales, filtroOrden);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtroOrden]);

    if (tiendaLoading || loading) {
        return (
            <>
                <Header />
                <div className="main-catalogo" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <p>Cargando productos...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="main-catalogo">
                    <p style={{ color: "red" }}>{error}</p>
                </div>
            </>
        );
    }

    return (
        <div>
            <Header />
            <div className="main-catalogo" style={{ minHeight: "100vh" }}>
                <div style={{ maxWidth: "1200px", width: "100%", padding: "10px 0px 10px 0px", borderBottom: "1px solid var(--gray-400)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                    <h2 style={{ margin: "0px" }}>
                        {categoriaActual ? `Categoría: ${categoriaActual.nombre}` : "Categoría no encontrada"}
                    </h2>
                    {productos.length > 0 && (
                        <div className="filtros-container">
                            <label htmlFor="filtro-orden-categoria" style={{ fontSize: "var(--font-size-base)" }}>
                                Ordenar por:
                            </label>
                            <select 
                                id="filtro-orden-categoria"
                                value={filtroOrden}
                                onChange={(e) => setFiltroOrden(e.target.value)}
                                className="filtro-select"
                            >
                                <option value="nuevos">Más Nuevos</option>
                                <option value="viejos">Más Viejos</option>
                                <option value="a-z">Nombre A-Z</option>
                                <option value="z-a">Nombre Z-A</option>
                                <option value="precio-menor">Precio: Menor a Mayor</option>
                                <option value="precio-mayor">Precio: Mayor a Menor</option>
                            </select>
                        </div>
                    )}
                </div>
                {productos.length === 0 ? (
                    <p>No hay productos disponibles en esta categoría.</p>
                ) : (
                    <div className="grid-home-prod" style={{ marginTop: "20px" }}>
                        {productos.map((prod) => (
                            <div key={prod.id} className="prod-home-container">
                                <img 
                                    src={obtenerImagen(prod)} 
                                    alt={prod.nombre} 
                                    className="prod-home-image"
                                    onError={(e) => {
                                        // Si la imagen falla al cargar, evitar bucle infinito
                                        if (!e.target.dataset.fallback) {
                                            e.target.dataset.fallback = "true";
                                            // Usar una imagen placeholder SVG
                                            e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";
                                        }
                                    }}
                                />
                                <h2 className="prod-home-nombre">{prod.nombre}</h2>
                                <p className="prod-home-precio">Precio: ${formatearPrecio(prod.precio)}</p>
                                <p className="prod-home-stock">Stock: {prod.stock}</p>
                                <p className="prod-home-descripcion">Descripción: {prod.descripcion}</p>
                                <button 
                                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                                    className={`prod-home-btn-carrito ${productosAgregados.has(prod.id) ? 'agregado' : ''}`}
                                    onClick={() => {
                                        // Activar animación inmediatamente
                                        setProductosAgregados(prev => new Set(prev).add(prod.id));
                                        setTimeout(() => {
                                            setProductosAgregados(prev => {
                                                const nuevo = new Set(prev);
                                                nuevo.delete(prod.id);
                                                return nuevo;
                                            });
                                        }, 2000);
                                        // Llamar a la función de agregar (sin await para que sea instantáneo)
                                        agregarProducto(prod.id, 1);
                                    }}
                                >
                                    {productosAgregados.has(prod.id) ? '✓ Agregado' : <><MdOutlineAddShoppingCart size={25}/> Agregar al carrito</>}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Footer de la página */}
            <Footer_Landing />
        </div>
    );
}

export default HomeCategoria;

