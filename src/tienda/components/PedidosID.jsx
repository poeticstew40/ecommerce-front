import { useEffect, useState } from "react";
import { getPedidoById } from "../services/pedidos";

/**
* Componente PedidoDetalle
* 
* Muestra los detalles de un pedido específico obtenido por su ID.
* Obtiene la información del pedido desde la API cuando el componente
* se monta o cuando cambia el ID del pedido.
*/

function PedidoDetalle({ id }) {
    // Estado para almacenar los datos del pedido
    const [pedido, setPedido] = useState(null);

    // Efecto que obtiene el pedido por ID cuando cambia el id
    useEffect(() => {
        getPedidoById(id)
        .then(setPedido)
        .catch(console.error);
    }, [id]);

    // Muestra mensaje de carga mientras se obtienen los datos
    if (!pedido) return <p>Cargando...</p>;

    return (
        <div>
            {/* Muestra el ID del pedido */}
            <h2>Pedido #{pedido.id}</h2>
            {/* Muestra la fecha del pedido */}
            <p>Fecha: {pedido.fecha}</p>
            {/* Muestra el total del pedido */}
            <p>Total: ${pedido.total}</p>
        </div>
    );
}

export default PedidoDetalle;
