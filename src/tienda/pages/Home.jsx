import { useTienda } from "../contexts/TiendaContext";
import { useCarrito } from "../contexts/CarritoContext";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { getProductosByTienda } from "../services/productos";
import { useState, useEffect } from "react";
// IMPORTANTE: Agregamos useSearchParams
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"; 

import { MdOutlineAddShoppingCart } from "react-icons/md";

import Header from "../components/Header.jsx";
import CarouselImg from "../components/CarouselImg.jsx"; 
import Footer_Landing from "../../landing/components/Footer_Landing.jsx";
// IMPORTANTE: Importamos el Modal
import ReciboModal from "../components/ReciboModal.jsx"; 

import "../styles/Home.css";
import "../styles/Productos.css";

const homeImages = [
    "/img/slider1.jpg",
    "/img/slider2.jpg",
    "/img/slider3.jpg",
    "/img/slider4.jpg",
    "/img/slider5.jpg"
];

function Home() {
    const { tienda, loading, error } = useTienda();
    const { agregarProducto, limpiarCarrito } = useCarrito(); // Traemos limpiarCarrito
    const { usuario, isAuthenticated } = useAuth();
    const { error: showError } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Hook para leer la URL
    const [searchParams, setSearchParams] = useSearchParams();

    const [productos, setProductos] = useState([]);
    const [cargandoProductos, setCargandoProductos] = useState(true);
    const [errorProductos, setErrorProductos] = useState(null);
    const [productosAgregados, setProductosAgregados] = useState(new Set());

    // --- ESTADOS PARA EL TICKET POPUP ---
    const [showTicket, setShowTicket] = useState(false);
    const [ticketData, setTicketData] = useState(null);

    // =========================================================
    // LÓGICA DEL TICKET (NUEVO)
    // =========================================================
    useEffect(() => {
        // 1. Buscamos parámetros típicos de Mercado Pago o nuestros personalizados
        const statusMP = searchParams.get('collection_status') || searchParams.get('status');
        const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
        const showFlag = searchParams.get('mostrar_ticket');

        // 2. Si hay status 'approved' o la bandera explícita, mostramos ticket
        if (statusMP || showFlag === 'true') {
            
            // Determinamos el estado visual
            let estadoVisual = 'pending';
            if (statusMP === 'approved' || searchParams.get('estado') === 'exito') estadoVisual = 'approved';
            else if (statusMP === 'rejected' || searchParams.get('estado') === 'fallo') estadoVisual = 'rejected';

            // Preparamos datos
            setTicketData({
                estado: estadoVisual,
                id: paymentId || searchParams.get('id_operacion') || '---',
                metodo: searchParams.get('payment_type') || 'MercadoPago',
                fecha: new Date().toLocaleDateString()
            });

            // Mostramos el popup
            setShowTicket(true);

            // Si fue aprobado, limpiamos el carrito (Opcional, pero recomendado)
            if (estadoVisual === 'approved' && limpiarCarrito) {
                limpiarCarrito();
            }
        }
    }, [searchParams, limpiarCarrito]);

    // Función para cerrar el ticket y limpiar la URL
    const handleCloseTicket = () => {
        setShowTicket(false);
        
        // Limpiamos la URL para que no salga de nuevo al recargar
        // Mantenemos solo params ajenos al pago si los hubiera
        const newParams = new URLSearchParams(searchParams);
        const keysToDelete = ['collection_status', 'collection_id', 'payment_id', 'status', 'payment_type', 'merchant_order_id', 'preference_id', 'site_id', 'processing_mode', 'merchant_account_id', 'mostrar_ticket', 'estado', 'id_operacion', 'external_reference'];
        
        keysToDelete.forEach(key => newParams.delete(key));
        setSearchParams(newParams);
    };
    // =========================================================

    
    // --- FIX BACKEND: Función para obtener la imagen principal ---
    const obtenerImagen = (prod) => {
        if (prod.imagenes && Array.isArray(prod.imagenes) && prod.imagenes.length > 0) {
            return prod.imagenes[0];
        }
        if (prod.imagen && typeof prod.imagen === 'string' && prod.imagen.trim() !== "") {
            return prod.imagen;
        }
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
                const productosData = await getProductosByTienda(tienda.nombreUrl);
                
                const productosOrdenados = Array.isArray(productosData)
                    ? [...productosData].sort((a, b) => (b.id || 0) - (a.id || 0))
                    : [];
                
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

    if (loading) return <><Header /><main className="main-home-contenedor"><p>Cargando tienda...</p></main><Footer_Landing /></>;

    if (error) return <><Header /><main className="main-home-contenedor"><div style={{ textAlign: "center", padding: "40px" }}><h2>Tienda no encontrada</h2><p>{error}</p></div></main><Footer_Landing /></>;

    if (!tienda) return <><Header /><main className="main-home-contenedor"><div style={{ textAlign: "center", padding: "40px" }}><h2>Tienda no encontrada</h2><p>La tienda que buscas no existe o no está disponible.</p></div></main><Footer_Landing /></>;

    const bannersAMostrar = (tienda.banners && Array.isArray(tienda.banners) && tienda.banners.length > 0) ? tienda.banners : homeImages;

    return (
        <>
            <Header />

            {/* AQUÍ VA EL TICKET - SE MUESTRA ENCIMA DE TODO SI showTicket ES TRUE */}
            <ReciboModal 
                show={showTicket} 
                onHide={handleCloseTicket} 
                datos={ticketData} 
            />
            
            <CarouselImg images={bannersAMostrar} />
            
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
                                    {imagenes.length > 1 ? (
                                        <div className="prod-home-image-wrapper">
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
                                                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";
                                                }
                                            }}
                                        />
                                    )}
                                    <h2 className="prod-home-nombre">{prod.nombre}</h2>
                                    <p className="prod-home-precio">Precio: ${formatearPrecio(prod.precio)}</p>
                                    <p className="prod-home-stock">Stock: {prod.stock}</p>
                                    <p className="prod-home-descripcion">{prod.descripcion || "Sin descripción"}</p>
                                    <button
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
                                        className={`prod-home-btn-carrito ${productosAgregados.has(prod.id) ? 'agregado' : ''}`}
                                        onClick={async () => {
                                            if (!isAuthenticated || !usuario) {
                                                showError("Atención", "Debes iniciar sesión para comprar");
                                                navigate(`/tienda/${tienda.nombreUrl}/login`, { state: { from: location.pathname } });
                                                return;
                                            }
                                            setProductosAgregados(prev => new Set(prev).add(prod.id));
                                            setTimeout(() => {
                                                setProductosAgregados(prev => {
                                                    const nuevo = new Set(prev);
                                                    nuevo.delete(prod.id);
                                                    return nuevo;
                                                });
                                            }, 2000);
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
            <Footer_Landing />
        </>
    );
}

export default Home;