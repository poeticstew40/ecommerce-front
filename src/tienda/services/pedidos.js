import api from "./api";

/**
 * Servicios para interactuar con el endpoint de pedidos de la API
 */

/**
 * Crea un nuevo pedido
 * @param {string} nombreTienda - Slug de la tienda
 * @param {Object} data - Datos del pedido (usuarioDni, direccionEnvio, items, etc)
 */
export async function createPedido(nombreTienda, data) {
    // MODIFICADO: Se agrega nombreTienda a la URL para coincidir con el backend
    const res = await api.post(`tiendas/${nombreTienda}/pedidos`, data);
    return res.data;
}

/**
 * Obtiene todos los pedidos de una tienda
 * @param {string} nombreTienda - Slug de la tienda
 * @returns {Promise<Array>} Lista de pedidos
 */
export async function getPedidosByTienda(nombreTienda) {
    const res = await api.get(`tiendas/${nombreTienda}/pedidos`);
    return res.data;
}

export async function getPedidoById(nombreTienda, id) {
    const res = await api.get(`tiendas/${nombreTienda}/pedidos/${id}`);
    return res.data;
}

/**
 * Actualiza un pedido existente
 * @param {string} nombreTienda - Slug de la tienda
 * @param {number} id - ID del pedido
 * @param {Object} data - Datos del pedido a actualizar (ej: { estado: 'NUEVO_ESTADO' })
 * @returns {Promise<Object>} Pedido actualizado
 */
export async function updatePedido(nombreTienda, id, data) {
    const res = await api.patch(`tiendas/${nombreTienda}/pedidos/${id}`, data);
    return res.data;
}

export async function deletePedido(nombreTienda, id) {
    await api.delete(`tiendas/${nombreTienda}/pedidos/${id}`);
}

export async function getPedidosByUsuario(nombreTienda, dni) {
    const res = await api.get(`tiendas/${nombreTienda}/pedidos/usuario/${dni}`);
    return res.data;
}

/**
 * Obtiene todos los pedidos realizados por un usuario (Historial global sin importar tienda)
 * @param {number} dni - DNI del usuario
 * @returns {Promise<Array>} Lista de pedidos
 */
export async function getPedidosGlobalesUsuario(dni) {
    const res = await api.get(`usuarios/${dni}/pedidos`);
    return res.data;
}