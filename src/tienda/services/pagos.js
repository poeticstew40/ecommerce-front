import api from "./api";

/**
 * Servicios para interactuar con el endpoint de pagos (Mercado Pago)
 */

/**
 * Crea una preferencia de pago en Mercado Pago para un pedido existente
 * @param {number} pedidoId - ID del pedido creado
 * @returns {Promise<Object>} Objeto con la URL de pago { url: "..." }
 */
export async function crearPreferenciaPago(pedidoId) {
    const res = await api.post(`pagos/crear/${pedidoId}`);
    return res.data; 
}