import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useCarrito } from "../contexts/CarritoContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { getProductosByTienda, buscarProductos } from "../services/productos.js";
import { MdOutlineAddShoppingCart } from "react-icons/md";
import Header from "../components/Header.jsx";
import Footer_Landing from "../../landing/components/Footer_Landing.jsx";
import "../styles/Productos.css";
import "../styles/Filtros.css";

/**
* Componente Catalogo
* * Renderiza la página del catálogo de todos los productos
* Mustras su Imagen, nombre, stock, precio y descripcion.
*/

function Catalogo() {
    const { nombreTienda } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const terminoBusqueda = searchParams.get('q') || '';
    const { agregarProducto } = useCarrito();
    const { usuario, isAuthenticated } = useAuth();
    const { error: showError } = useNotifications();
    // Estado para almacenar los productos obtenidos de la API
    const [productos, setProductos] = useState([]);
    const [productosOriginales, setProductosOriginales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroOrden, setFiltroOrden] = useState('nuevos');
    const [productosAgregados, setProductosAgregados] = useState(new Set());

    // --- FIX BACKEND: Función auxiliar para leer imagen ---
    const obtenerImagen = (prod) => {
        if (prod.imagenes && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) return prod.imagenes[0];
        if (prod.imagen && typeof prod.imagen === 'string' && prod.imagen.trim() !== "") return prod.imagen;
        return "/default-product.png";
    };
    // -----------------------------------------------------

    /**
     * Función para formatear precios con puntos como separadores de miles
     */
    const formatearPrecio = (precio) => {
        const precioRedondeado = Math.round(precio || 0);
        return precioRedondeado.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    useEffect(() => {
        if (!nombreTienda) {
            setError("Nombre de tienda no disponible");
            setLoading(false);
            return;
        }

        setLoading(true);
        
        const cargarProductos = async () => {
            try {
                let data;
                
                // Si hay término de búsqueda, buscar productos
                if (terminoBusqueda && terminoBusqueda.trim() !== '') {
                    data = await buscarProductos(nombreTienda, terminoBusqueda.trim());
                } else {
                    // Si no, cargar todos los productos
                    data = await getProductosByTienda(nombreTienda);
                }
                
                // Normalizar datos
                let productosData = [];
                if (Array.isArray(data)) {
                    productosData = data;
                } else if (data && Array.isArray(data.content)) {
                    productosData = data.content;
                } else {
                    productosData = data || [];
                }
                
                // Guardar productos originales y aplicar orden inicial
                setProductosOriginales(productosData);
                aplicarFiltro(productosData, filtroOrden);
            } catch (err) {
                console.error(err);
                setError(`Error cargando productos: ${err.response?.status} ${err.response?.statusText || err.message}`);
            } finally {
                setLoading(false);
            }
        };
        
        cargarProductos();
    }, [nombreTienda, terminoBusqueda]);

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

    return (
        <div>
            {/* Header de navegación de la aplicación */}
            <Header />

            {/* Contenedor principal del catálogo */}
            <div className="main-catalogo" style={{ minHeight: "100vh", maxWidth: "1270px", margin: "0 auto", display: "flex", flexFlow: "column", alignItems: "center" }}>
              
                <div style={{ maxWidth: "1200px", width: "100%", padding: "10px 0px 10px 0px", borderBottom: "1px solid var(--gray-400)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "15px" }}>
                    <h1 style={{ margin: "0px", fontSize: "var(--font-size-4xl)" }}>
                        {terminoBusqueda ? `Catálogo: "${terminoBusqueda}"` : "Catálogo"}
                    </h1>
                    <div className="filtros-container">
                        <label htmlFor="filtro-orden" style={{ marginRight: "10px", fontSize: "var(--font-size-base)" }}>
                            Ordenar por:
                        </label>
                        <select 
                            id="filtro-orden"
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
                </div>
                <div className="grid-home-prod" style={{ marginTop: "20px" }}>
                    {loading && <p style={{ margin: "0", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>Cargando productos...</p>}
         
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {!loading && !error && productos.length === 0 && (
                        <p>No hay productos disponibles.</p>
                    )}

        
                    {/* Renderiza los productos obtenidos de la API */}
                    {productos.map((prod) => (
                        <div key={prod.id} className="prod-home-container">
                            {/* Imagen del producto 
                            */}
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
                            {/* Nombre del producto */}
        
                            <h2 className="prod-home-nombre">{prod.nombre}</h2>
                            {/* Precio del producto */}
                            <p className="prod-home-precio">Precio: ${formatearPrecio(prod.precio)}</p>
                 
                            {/* Stock disponible del producto */}
                            <p className="prod-home-stock">Stock: {prod.stock}</p>
                            {/* Descripción del producto */}
                      
                            <p className="prod-home-descripcion">Descripción: {prod.descripcion}</p>
                            {/* Botón para agregar el producto al carrito */}
                            <button 
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                                className={`prod-home-btn-carrito ${productosAgregados.has(prod.id) ? 'agregado' : ''}`}
                                onClick={async () => {
                                    // Verificar si el usuario está autenticado
                                    if (!isAuthenticated || !usuario) {
                                        showError("Atención", "Debes iniciar sesión para comprar");
                                        navigate(`/tienda/${nombreTienda}/login`, { state: { from: location.pathname } });
                                        return;
                                    }

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
            </div>
            {/* Footer de la página */}
            <Footer_Landing />
        </div>
    );
}

export default Catalogo;
