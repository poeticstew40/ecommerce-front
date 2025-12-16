import { useTienda } from "../contexts/TiendaContext";
import { useCarrito } from "../contexts/CarritoContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { getProductosByTienda } from "../services/productos";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { MdOutlineAddShoppingCart } from "react-icons/md";

import Header from "../components/Header.jsx";
import CarouselImg from "../components/CarouselImg.jsx"; // Importamos el carrusel
import Footer_Landing from "../../landing/components/Footer_Landing.jsx";

import "../styles/Home.css";
import "../styles/Productos.css";

/**
* Componente Home
* Renderiza la página principal del ecommerce.
* Muestra un grid de productos utilizando el componente ProductoHome
* con diferentes IDs para cada producto.
* * Esta página es pública - no requiere autenticación para ver la tienda.
*/
const homeImages = [
    "/img/slider1.jpg",
    "/img/slider2.jpg",
    "/img/slider3.jpg",
    "/img/slider4.jpg",
    "/img/slider5.jpg"
];

function Home() {
    const { tienda, loading, error } = useTienda();
    const { agregarProducto } = useCarrito();
    const { usuario, isAuthenticated } = useAuth();
    const { error: showError } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const [productos, setProductos] = useState([]);
    const [cargandoProductos, setCargandoProductos] = useState(true);
    const [errorProductos, setErrorProductos] = useState(null);
    const [productosAgregados, setProductosAgregados] = useState(new Set());

    // --- FIX BACKEND: Función para obtener la imagen principal ---
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
    
    // --- NUEVA FUNCIÓN: Obtener lista de imágenes o default ---
    const obtenerListaImagenes = (prod) => {
        if (prod.imagenes && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
            return prod.imagenes;
        }
        if (prod.imagen && typeof prod.imagen === 'string' && prod.imagen.trim() !== "") {
            return [prod.imagen];
        }
        return ["/default-product.png"];
    };
    // -------------------------------------------------------------

    /**
     * Función para formatear precios con puntos como separadores de miles
     */
    const formatearPrecio = (precio) => {
        const precioRedondeado = Math.round(precio || 0);
        return precioRedondeado.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Cargar productos de la tienda
    useEffect(() => {
        if (!tienda?.nombreUrl) {
            setCargandoProductos(false);
            return;
        }

        const cargarProductos = async () => {
            try {
                setCargandoProductos(true);
                setErrorProductos(null);
                // Debug: verificar qué se está cargando
                console.log("Cargando productos para tienda:", tienda.nombreUrl);
                const productosData = await getProductosByTienda(tienda.nombreUrl);
                console.log("Productos cargados:", productosData);
        
                // Ordenar productos de más nuevos a más viejos (por ID descendente)
                const productosOrdenados = Array.isArray(productosData)
                    ? [...productosData].sort((a, b) => (b.id || 0) - (a.id || 0))
                    : [];
                
                // Mostrar solo los primeros 6 productos en la home
                setProductos(productosOrdenados.slice(0, 6));
            } catch (err) {
                console.error("Error cargando productos:", err);
                setErrorProductos(err.message || "Error al cargar productos");
       
            } finally {
                setCargandoProductos(false);
            }
        };

        cargarProductos();
    }, [tienda?.nombreUrl]);

    // Mostrar estado de carga mientras se obtiene la tienda
    if (loading) {
        return (
            <>
                <Header />
                <main className="main-home-contenedor">
                    <p>Cargando tienda...</p>
         
                </main>
                <Footer_Landing />
            </>
        );
    }

    // Mostrar error si la tienda no se encuentra
    if (error) {
        return (
            <>
                <Header />
                <main className="main-home-contenedor">
                    <div style={{ textAlign: "center", padding: "40px" }}>
 
                        <h2>Tienda no encontrada</h2>
                        <p>{error}</p>
                    </div>
                </main>
                <Footer_Landing />
            </>
   
        );
    }

    // Si no hay tienda cargada, mostrar mensaje
    if (!tienda) {
        return (
            <>
                <Header />
                <main className="main-home-contenedor">
                    <div style={{ 
                        textAlign: "center", padding: "40px" }}>
                        <h2>Tienda no encontrada</h2>
                        <p>La tienda que buscas no existe o no está disponible.</p>
                    </div>
                </main>
                <Footer_Landing />
            </>
        );
    }

    // Determinar qué banners mostrar: los de la tienda o los por defecto
    const bannersAMostrar = (tienda.banners && Array.isArray(tienda.banners) && tienda.banners.length > 0) 
        ? tienda.banners 
        : homeImages;

    return (
        <>
            {/* Header de navegación de la aplicación */}
            <Header />
            
            {/*Carousel*/}
            <CarouselImg images={bannersAMostrar} />
            
     
            {/* Grid principal que contiene todos los productos */}
            <main className="main-home-contenedor">
                {cargandoProductos ? (
                    <p>Cargando productos...</p>
                ) : errorProductos ? (
        
                    <p style={{ color: "red" }}>Error: {errorProductos}</p>
                ) : productos.length === 0 ? (
                    <p>No hay productos disponibles en esta tienda.</p>
                ) : (
                    <div className="grid-home-prod">
 
                        {productos.map((prod) => {
                            const imagenes = obtenerListaImagenes(prod);
                            return (
                                <div key={prod.id} className="prod-home-container">
                                    {/* IMAGEN: Usar Carrusel si hay más de una imagen, si no, usar <img> normal */}
                                    {imagenes.length > 1 ? (
                                        <div className="prod-home-image-wrapper"> {/* Nuevo contenedor para el carrusel */}
                                            <CarouselImg images={imagenes} isProduct={true} />
                                        </div>
                                    ) : (
                                        <img 
                                            src={imagenes[0]} 
                                            alt={prod.nombre} 
                                            className="prod-home-image"
                                            onError={(e) => {
                                                if (!e.target.dataset.fallback) {
                                                    e.target.dataset.fallback = "true";
                                                    // Usar una imagen placeholder SVG
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";
                                                }
                                            }}
                                        />
                                    )}
                                    
                                    {/* Nombre del producto */}
                                    <h2 className="prod-home-nombre">{prod.nombre}</h2>
                                
                                    {/* Precio del producto */}
                                
                                    <p className="prod-home-precio">Precio: ${formatearPrecio(prod.precio)}</p>
                                    {/* Stock disponible del producto */}
                                    <p className="prod-home-stock">Stock: {prod.stock}</p>
                        
                                    {/* Descripción del producto - SE ELIMINA 'Descripción: ' */}
                                    <p className="prod-home-descripcion">{prod.descripcion ||
                                    "Sin descripción"}</p>
                                    {/* Botón para agregar el producto al carrito */}
                                    <button
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                                        className={`prod-home-btn-carrito ${productosAgregados.has(prod.id) ? 'agregado' : ''}`}
                                        onClick={async () => {
                                            // Verificar si el usuario está autenticado
                                            if (!isAuthenticated || !usuario) {
                                                showError("Atención", "Debes iniciar sesión para comprar");
                                                navigate(`/tienda/${tienda.nombreUrl}/login`, { state: { from: location.pathname } });
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
                            );
                        })}
                    </div>
                )}
            </main>
            {/* Footer de la página */}
       
            <Footer_Landing />
        </>
    );
}

export default Home;