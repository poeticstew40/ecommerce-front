import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../tienda/contexts/AuthContext";
import { getPedidosGlobalesUsuario } from "../../tienda/services/pedidos";
// Reutilizamos estilos de la tabla de pedidos del admin para no duplicar CSS
import "../../admin/styles/AdminPedidos.css"; 

function BuyerCompras() {
    const { usuario } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (usuario?.dni) {
            cargarCompras();
        }
    }, [usuario]);

    const cargarCompras = async () => {
        try {
            const data = await getPedidosGlobalesUsuario(usuario.dni);
            // Ordenar por fecha descendente (más reciente primero)
            const ordenados = Array.isArray(data) 
                ? data.sort((a, b) => new Date(b.fechaPedido) - new Date(a.fechaPedido))
                : [];
            setPedidos(ordenados);
        } catch (error) {
            console.error("Error cargando compras:", error);
        } finally {
            setLoading(false);
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
        if (!estado) return "Desconocido";
        const texto = estado.replace(/_/g, ' ');
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    };

    if (loading) {
        return (
            <div className="pedidos-loading">
                <div className="spinner"></div>
                <p>Cargando tus compras...</p>
            </div>
        );
    }

    return (
        <div className="pedidos-container">
            <h2 className="pedidos-title">Historial de Compras</h2>

            {pedidos.length === 0 ? (
                <div className="pedidos-loading">
                    <p>No has realizado ninguna compra todavía.</p>
                    <Link to="/tiendas" style={{ 
                        marginTop: '15px', 
                        display: 'inline-block',
                        padding: '10px 20px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold'
                    }}>
                        Explorar Tiendas
                    </Link>
                </div>
            ) : (
                <div className="pedidos-list-container">
                    <table className="pedidos-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Tienda</th>
                                <th>Estado</th>
                                <th>Total</th>
                                <th>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map((pedido) => (
                                <tr key={pedido.id}>
                                    <td>{formatearFecha(pedido.fechaPedido)}</td>
                                    <td>
                                        {/* Enlace a la tienda si existe la URL, sino solo texto */}
                                        {pedido.tiendaUrl ? (
                                            <Link 
                                                to={`/tienda/${pedido.tiendaUrl}/home`}
                                                style={{ color: '#2563eb', fontWeight: 'bold' }}
                                            >
                                                {pedido.tiendaNombre || "Tienda"}
                                            </Link>
                                        ) : (
                                            <span>{pedido.tiendaNombre || "Tienda"}</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`estado-${pedido.estado}`}>
                                            {formatearEstado(pedido.estado)}
                                        </span>
                                    </td>
                                    <td>${pedido.total?.toFixed(2)}</td>
                                    <td>
                                        <ul style={{ 
                                            margin: 0, 
                                            paddingLeft: '15px', 
                                            fontSize: '0.85rem',
                                            color: '#666',
                                            listStyleType: 'disc'
                                        }}>
                                            {pedido.items?.map((item, idx) => (
                                                <li key={idx}>
                                                    {item.cantidad}x {item.nombreProducto}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BuyerCompras;