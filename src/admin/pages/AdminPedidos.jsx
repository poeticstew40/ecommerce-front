import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../tienda/contexts/AuthContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { getPedidosByTienda, updatePedido } from "../../tienda/services/pedidos";
import "../styles/AdminPedidos.css"; 

/**
 * Página de gestión de pedidos
 * * Permite ver y actualizar el estado de los pedidos para la tienda
 * del vendedor autenticado.
 */
function AdminPedidos() {
    const { usuario, tiendaUsuario, loading: authLoading, isAuthenticated } = useAuth();
    const { nombreTienda } = useParams();
    const navigate = useNavigate();
    const { success: showSuccess, error: showError } = useNotifications();

    const [loading, setLoading] = useState(true);
    const [pedidos, setPedidos] = useState([]);
    const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
    const [cargandoPedidos, setCargandoPedidos] = useState(true);

    // Estados de filtros
    const [filtroEstado, setFiltroEstado] = useState("");
    const [busquedaId, setBusquedaId] = useState("");

    // Estados del modal de detalle/edición
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [nuevoEstado, setNuevoEstado] = useState("");
    const [actualizandoEstado, setActualizandoEstado] = useState(false);
    
    // Lista de estados posibles
    const estadosPosibles = useMemo(() => [
        "PENDIENTE", 
        "PAGADO", 
        "EN_PREPARACION", 
        "EN_CAMINO", 
        "ENTREGADO", 
        "CANCELADO"
    ], []);

    // Redirigir si no está autenticado o si aún está cargando
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login");
        }
    }, [authLoading, isAuthenticated, navigate]);
    
    // Función para cargar pedidos
    const cargarPedidos = useCallback(async () => {
        if (!tiendaUsuario?.nombreUrl) {
            setCargandoPedidos(false);
            setLoading(false);
            return;
        }

        try {
            setCargandoPedidos(true);
            const pedidosData = await getPedidosByTienda(tiendaUsuario.nombreUrl);
            setPedidos(pedidosData);
            setPedidosFiltrados(pedidosData); 
        } catch (error) {
            console.error("Error cargando pedidos:", error);
            showError("Error", "No se pudieron cargar los pedidos.");
        } finally {
            setCargandoPedidos(false);
            setLoading(false);
        }
    }, [tiendaUsuario?.nombreUrl, showError]);

    // Cargar pedidos de la tienda
    useEffect(() => {
        if (tiendaUsuario?.nombreUrl) {
            cargarPedidos();
        }
    }, [tiendaUsuario?.nombreUrl, cargarPedidos]);
    
    // Aplicar filtros
    useEffect(() => {
        let listaFiltrada = [...pedidos];

        if (filtroEstado) {
            listaFiltrada = listaFiltrada.filter(p => 
                p.estado.toUpperCase() === filtroEstado.toUpperCase()
            );
        }

        if (busquedaId.trim()) {
            const idBusqueda = busquedaId.trim().toLowerCase();
            listaFiltrada = listaFiltrada.filter(p => 
                p.id.toString().includes(idBusqueda)
            );
        }

        setPedidosFiltrados(listaFiltrada);
    }, [filtroEstado, busquedaId, pedidos]);

    // Función para abrir modal de detalle
    const abrirModalDetalle = (pedido) => {
        setPedidoSeleccionado(pedido);
        setNuevoEstado(pedido.estado);
        setModalAbierto(true);
    };

    // Función para cerrar modal
    const cerrarModal = () => {
        setModalAbierto(false);
        setPedidoSeleccionado(null);
        setNuevoEstado("");
    };

    // Función para actualizar estado del pedido
    const handleActualizarEstado = async () => {
        if (!pedidoSeleccionado || !nuevoEstado) return;
        
        if (nuevoEstado === pedidoSeleccionado.estado) {
            showError("Atención", "El estado seleccionado es el mismo que el actual.");
            return;
        }

        setActualizandoEstado(true);
        try {
            const pedidoActualizado = await updatePedido(tiendaUsuario.nombreUrl, pedidoSeleccionado.id, {
                estado: nuevoEstado
            });
            
            // Actualizar la lista de pedidos con el nuevo estado
            setPedidos(prev => prev.map(p => 
                p.id === pedidoSeleccionado.id ? pedidoActualizado : p
            ));
            
            showSuccess("Estado Actualizado", `El pedido #${pedidoSeleccionado.id} ha pasado a estado ${nuevoEstado}`);
            setPedidoSeleccionado(pedidoActualizado);
            setNuevoEstado(pedidoActualizado.estado); 
            
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            showError("Error", error.response?.data?.message || "No se pudo actualizar el estado del pedido.");
        } finally {
            setActualizandoEstado(false);
        }
    };
    
    const formatearFecha = (fechaString) => {
        if (!fechaString) return "N/A";
        const date = new Date(fechaString);
        return date.toLocaleDateString("es-AR", {
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatearEstado = (estado) => {
        const texto = estado.replace(/_/g, ' ');
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    }

    if (authLoading || loading) {
        return (
            <div className="pedidos-loading">
                <p>Cargando información de la tienda...</p>
            </div>
        );
    }

    if (!usuario || !usuario.dni || !isAuthenticated) {
        return (
            <div className="pedidos-error">
                <h2>Error de Autenticación</h2>
                <p>No se pudo obtener la información del usuario.</p>
            </div>
        );
    }
    
    if (!tiendaUsuario) {
        return (
            <div className="pedidos-error">
                <h2>Tienda no encontrada</h2>
                <p>No tienes una tienda asociada.</p>
            </div>
        );
    }

    return (
        <div className="pedidos-container">
            <h2 className="pedidos-title">Gestión de Pedidos</h2>

            {/* Filtros y búsqueda */}
            <div className="pedidos-filtros">
                <div className="pedidos-filtro-grupo">
                    <label className="pedidos-label">Filtrar por Estado:</label>
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="pedidos-select"
                    >
                        <option value="">Todos los estados</option>
                        {estadosPosibles.map((estado) => (
                            <option key={estado} value={estado}>
                                {formatearEstado(estado)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="pedidos-filtro-grupo">
                    <label className="pedidos-label">Buscar por ID de Pedido:</label>
                    <input
                        type="text"
                        value={busquedaId}
                        onChange={(e) => setBusquedaId(e.target.value)}
                        placeholder="Buscar ID de pedido..."
                        className="pedidos-input-busqueda"
                    />
                </div>
            </div>

            {/* Lista de pedidos */}
            <div className="pedidos-list-container">
                {cargandoPedidos ? (
                    <div className="pedidos-loading">
                        <p>Cargando pedidos...</p>
                    </div>
                ) : pedidosFiltrados.length === 0 ? (
                    <div className="pedidos-loading">
                        <p>No se encontraron pedidos.</p>
                    </div>
                ) : (
                    <table className="pedidos-table">
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidosFiltrados.map((pedido) => (
                                <tr key={pedido.id}>
                                    <td>#{pedido.id}</td>
                                    <td>{formatearFecha(pedido.fechaPedido)}</td>
                                    <td>${(pedido.total || 0).toFixed(2)}</td> 
                                    <td>
                                        <span className={`estado-${pedido.estado.toUpperCase().replace(/\s/g, '_')}`}>
                                            {formatearEstado(pedido.estado)}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => abrirModalDetalle(pedido)}
                                            className="pedidos-btn pedidos-btn-detalle"
                                        >
                                            Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de Detalle/Edición */}
            {modalAbierto && pedidoSeleccionado && (
                <div className="pedidos-modal-overlay" onClick={cerrarModal}>
                    <div className="pedidos-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="pedidos-modal-header">
                            <h3>Detalle de Pedido #{pedidoSeleccionado.id}</h3>
                            <button className="pedidos-modal-cerrar" onClick={cerrarModal}>
                                &times;
                            </button>
                        </div>

                        <div className="pedidos-modal-content">
                            
                            {/* Información General */}
                            <div className="pedidos-detalle-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>Estado: </strong> 
                                        <span className={`estado-${pedidoSeleccionado.estado.toUpperCase().replace(/\s/g, '_')}`}>
                                            {formatearEstado(pedidoSeleccionado.estado)}
                                        </span>
                                    </div>
                                    <div>
                                        <strong>Fecha: </strong> {formatearFecha(pedidoSeleccionado.fechaPedido)}
                                    </div>
                                </div>
                                <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '10px 0' }}/>
                                
                                {/* MOSTRAR NOMBRE DEL COMPRADOR O DNI */}
                                <p style={{ margin: '5px 0' }}>
                                    <strong>Comprador: </strong> 
                                    {pedidoSeleccionado.usuarioNombre ? (
                                        <span>{pedidoSeleccionado.usuarioNombre} {pedidoSeleccionado.usuarioApellido} (DNI: {pedidoSeleccionado.usuarioDni})</span>
                                    ) : (
                                        <span>DNI: {pedidoSeleccionado.usuarioDni || 'N/A'}</span>
                                    )}
                                </p>
                            </div>
                            
                            {/* Información de Envío - AHORA MUESTRA LA DIRECCIÓN CORRECTAMENTE */}
                            <div className="pedidos-detalle-group">
                                <p style={{ margin: '5px 0' }}><strong>Método de Envío:</strong> {pedidoSeleccionado.metodoEnvio || 'N/A'}</p>
                                <p style={{ margin: '5px 0' }}><strong>Dirección:</strong> {pedidoSeleccionado.direccionEnvio || 'No especificada'}</p>
                                <p style={{ margin: '5px 0' }}><strong>Costo de Envío:</strong> ${Number(pedidoSeleccionado.costoEnvio || 0).toFixed(2)}</p> 
                            </div>

                            {/* Items del Pedido */}
                            <h4 style={{ margin: '20px 0 10px 0' }}>Productos Comprados:</h4>
                            <div className="pedidos-detalle-items">
                                {(pedidoSeleccionado.items && Array.isArray(pedidoSeleccionado.items) && pedidoSeleccionado.items.length > 0) ? (
                                    pedidoSeleccionado.items.map((item, index) => (
                                        <div key={index} className="pedidos-item-card">
                                            <div className="pedidos-item-info">
                                                <div className="pedidos-item-nombre">{item.nombreProducto}</div>
                                                <div className="pedidos-item-precio">{item.cantidad} x ${Number(item.precioUnitario || 0).toFixed(2)}</div> 
                                            </div>
                                            <div style={{ fontWeight: 'bold' }}>
                                                ${(Number(item.cantidad || 0) * Number(item.precioUnitario || 0)).toFixed(2)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-gray-4)' }}>No se encontraron detalles de productos.</p>
                                )}
                            </div>

                            {/* Totales */}
                            <div className="pedidos-total" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ fontSize: '1rem', fontWeight: 'normal' }}>Subtotal Productos: ${(Number(pedidoSeleccionado.total || 0) - Number(pedidoSeleccionado.costoEnvio || 0)).toFixed(2)}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 'normal' }}>Envío: ${Number(pedidoSeleccionado.costoEnvio || 0).toFixed(2)}</div>
                                <div style={{ marginTop: '5px', borderTop: '1px solid #ddd', paddingTop: '5px' }}>Total Final: ${Number(pedidoSeleccionado.total || 0).toFixed(2)}</div>
                            </div>
                            
                            {/* Actualizar Estado */}
                            <h4 style={{ margin: '30px 0 10px 0' }}>Actualizar Estado</h4>
                            <div className="pedidos-filtro-grupo" style={{ flexDirection: 'row', alignItems: 'center', gap: '15px' }}>
                                <label className="pedidos-label" style={{ margin: 0, flexShrink: 0 }}>Nuevo Estado:</label>
                                <select
                                    value={nuevoEstado}
                                    onChange={(e) => setNuevoEstado(e.target.value)}
                                    className="pedidos-select"
                                    disabled={actualizandoEstado || pedidoSeleccionado.estado === 'CANCELADO' || pedidoSeleccionado.estado === 'ENTREGADO'}
                                >
                                    {estadosPosibles.map((estado) => (
                                        <option 
                                            key={estado} 
                                            value={estado}
                                            disabled={
                                                (pedidoSeleccionado.estado === 'PAGADO' && (estado === 'PENDIENTE' || estado === 'PAGADO')) ||
                                                (pedidoSeleccionado.estado === 'EN_PREPARACION' && (estado === 'PENDIENTE' || estado === 'PAGADO' || estado === 'EN_PREPARACION')) ||
                                                (pedidoSeleccionado.estado === 'EN_CAMINO' && (estado === 'PENDIENTE' || estado === 'PAGADO' || estado === 'EN_PREPARACION' || estado === 'EN_CAMINO')) ||
                                                (pedidoSeleccionado.estado === 'ENTREGADO' && estado !== 'ENTREGADO') ||
                                                (pedidoSeleccionado.estado === 'CANCELADO' && estado !== 'CANCELADO')
                                            }
                                        >
                                            {formatearEstado(estado)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {(pedidoSeleccionado.estado === 'CANCELADO' || pedidoSeleccionado.estado === 'ENTREGADO') && (
                                <p style={{ color: 'var(--red-600)', fontSize: '0.9rem', marginTop: '10px' }}>No se puede modificar el estado de un pedido {formatearEstado(pedidoSeleccionado.estado)}.</p>
                            )}
                        </div>

                        <div className="pedidos-modal-footer">
                            <button
                                onClick={handleActualizarEstado}
                                disabled={actualizandoEstado || nuevoEstado === pedidoSeleccionado.estado || pedidoSeleccionado.estado === 'CANCELADO' || pedidoSeleccionado.estado === 'ENTREGADO'}
                                className="pedidos-btn pedidos-btn-update"
                            >
                                {actualizandoEstado ? "Actualizando..." : "Guardar Estado"}
                            </button>
                            <button
                                onClick={cerrarModal}
                                disabled={actualizandoEstado}
                                className="pedidos-btn pedidos-btn-cancelar"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminPedidos;