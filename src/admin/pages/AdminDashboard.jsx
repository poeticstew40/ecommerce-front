import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../tienda/contexts/AuthContext";
import { getProductosByTienda } from "../../tienda/services/productos";
import { getPedidosByTienda } from "../../tienda/services/pedidos";
import "../styles/AdminDashboard.css";

/**
 * Función para formatear precios con puntos como separadores de miles
 * @param {number} precio - Precio a formatear
 * @returns {string} Precio formateado (ej: $1.000, $10.000)
 */
function formatearPrecio(precio) {
    const precioRedondeado = Math.round(precio || 0);
    return precioRedondeado.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Dashboard del panel administrativo
 * 
 * Muestra estadísticas y resumen de la tienda del vendedor
 */
function AdminDashboard() {
    const { usuario, tiendaUsuario } = useAuth();
    const { nombreTienda } = useParams();
    const navigate = useNavigate();
    const [tienda, setTienda] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados para las estadísticas
    const [totalProductos, setTotalProductos] = useState(0);
    const [pedidosPendientes, setPedidosPendientes] = useState(0);
    const [totalVendido, setTotalVendido] = useState(0);
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        // El contexto ya carga la tienda automáticamente al iniciar sesión
        // Solo necesitamos usar la tienda del contexto
        if (tiendaUsuario) {
            setTienda(tiendaUsuario);
        }
        setLoading(false);
    }, [tiendaUsuario]);

    // Cargar estadísticas cuando la tienda esté disponible
    useEffect(() => {
        const cargarEstadisticas = async () => {
            if (!tiendaUsuario?.nombreUrl) {
                setLoadingStats(false);
                return;
            }

            try {
                setLoadingStats(true);
                const nombreTiendaActual = tiendaUsuario.nombreUrl;

                // Cargar productos y pedidos en paralelo
                const [productosData, pedidosData] = await Promise.all([
                    getProductosByTienda(nombreTiendaActual),
                    getPedidosByTienda(nombreTiendaActual)
                ]);

                // Normalizar datos de productos
                let productos = [];
                if (Array.isArray(productosData)) {
                    productos = productosData;
                } else if (productosData && Array.isArray(productosData.content)) {
                    productos = productosData.content;
                }

                // Contar productos activos
                const productosActivos = productos.filter(p => p.activo !== false);
                setTotalProductos(productosActivos.length);

                // Normalizar datos de pedidos
                let pedidos = [];
                if (Array.isArray(pedidosData)) {
                    pedidos = pedidosData;
                } else if (pedidosData && Array.isArray(pedidosData.content)) {
                    pedidos = pedidosData.content;
                }

                // Contar pedidos pendientes (PENDIENTE o PAGADO)
                const pendientes = pedidos.filter(p => 
                    p.estado === 'PENDIENTE' || p.estado === 'PAGADO'
                );
                setPedidosPendientes(pendientes.length);

                // Calcular total vendido (suma de pedidos PAGADOS y ENTREGADOS)
                const vendidos = pedidos.filter(p => 
                    p.estado === 'PAGADO' || p.estado === 'ENTREGADO'
                );
                const total = vendidos.reduce((sum, pedido) => sum + (pedido.total || 0), 0);
                setTotalVendido(total);

            } catch (error) {
                console.error("Error cargando estadísticas:", error);
                // En caso de error, mantener valores en 0
                setTotalProductos(0);
                setPedidosPendientes(0);
                setTotalVendido(0);
            } finally {
                setLoadingStats(false);
            }
        };

        cargarEstadisticas();
    }, [tiendaUsuario]);

    if (loading) {
        return <div className="dashboard-loading">Cargando...</div>;
    }

    const getVerificationBadgeClass = () => {
        if (usuario?.emailVerificado === undefined) return "unknown";
        return usuario.emailVerificado ? "verified" : "unverified";
    };

    return (
        <div>
            <div className="dashboard-header">
                <h2 className="dashboard-title">Dashboard</h2>
                {usuario && (
                    <div className={`dashboard-verification-badge ${getVerificationBadgeClass()}`}>
                        <span className={`dashboard-verification-icon ${getVerificationBadgeClass()}`}>
                            {usuario.emailVerificado !== undefined
                                ? (usuario.emailVerificado ? "✓" : "⚠")
                                : "?"}
                        </span>
                        <span className={`dashboard-verification-text ${getVerificationBadgeClass()}`}>
                            {usuario.emailVerificado !== undefined
                                ? (usuario.emailVerificado 
                                    ? "Email Verificado" 
                                    : "Email No Verificado")
                                : "Estado de verificación de email desconocido"}
                        </span>
                    </div>
                )}
            </div>

            {tienda ? (
                <div>
                    <div className="dashboard-tienda-card">
                        <h3>Mi Tienda</h3>
                        <p><strong>Nombre:</strong> {tienda.nombreFantasia}</p>
                        <p><strong>URL:</strong> /tienda/{tienda.nombreUrl}</p>
                        {tienda.descripcion && (
                            <p><strong>Descripción:</strong> {tienda.descripcion}</p>
                        )}
                    </div>

                    <div className="dashboard-stats-grid">
                        <div className="dashboard-stat-card products">
                            <h4>Productos</h4>
                            {loadingStats ? (
                                <p className="dashboard-stat-value">...</p>
                            ) : (
                                <p className="dashboard-stat-value">{totalProductos}</p>
                            )}
                            <p className="dashboard-stat-label">Total de productos</p>
                        </div>

                        <div className="dashboard-stat-card orders">
                            <h4>Pedidos</h4>
                            {loadingStats ? (
                                <p className="dashboard-stat-value">...</p>
                            ) : (
                                <p className="dashboard-stat-value">{pedidosPendientes}</p>
                            )}
                            <p className="dashboard-stat-label">Pedidos pendientes</p>
                        </div>

                        <div className="dashboard-stat-card sales">
                            <h4>Ventas</h4>
                            {loadingStats ? (
                                <p className="dashboard-stat-value">...</p>
                            ) : (
                                <p className="dashboard-stat-value">${formatearPrecio(totalVendido)}</p>
                            )}
                            <p className="dashboard-stat-label">Total vendido</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="dashboard-empty">
                    <h3>Aún no tienes una tienda</h3>
                    <p>Crea tu tienda para comenzar a vender productos</p>
                    
                    <div className="dashboard-empty-actions">
                        <button
                            onClick={() => {
                                const tiendaActual = nombreTienda || "tienda";
                                navigate(`/admin/${tiendaActual}/configuracion`);
                            }}
                            className="dashboard-btn dashboard-btn-primary"
                        >
                            Crear Nueva Tienda
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;

