import api from "./api";

/**
 * Servicios para interactuar con el endpoint de carrito de la API
 * Todas las operaciones de carrito requieren el nombreUrl (slug) de la tienda
 */

/**
 * Agrega un producto al carrito
 * @param {string} nombreTienda - El slug o identificador único de la tienda
 * @param {Object} request - Objeto con usuarioDni, productoId y cantidad
 * @returns {Promise} Promesa que resuelve con el item del carrito agregado
 */
export async function agregarAlCarrito(nombreTienda, request) {
    const res = await api.post(`tiendas/${nombreTienda}/carrito/agregar`, request);
    return res.data;
}

/**
 * Obtiene el carrito completo de un usuario
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} usuarioDni - DNI del usuario
 * @returns {Promise} Promesa que resuelve con la lista de items del carrito
 */
export async function obtenerCarrito(nombreTienda, usuarioDni) {
    const res = await api.get(`tiendas/${nombreTienda}/carrito/${usuarioDni}`);
    return res.data;
}

/**
 * Elimina un item específico del carrito
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} idItem - ID del item a eliminar
 * @returns {Promise} Promesa que se resuelve cuando el item es eliminado
 */
export async function eliminarItemCarrito(nombreTienda, idItem) {
    await api.delete(`tiendas/${nombreTienda}/carrito/item/${idItem}`);
}

/**
 * Vacía completamente el carrito de un usuario
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} usuarioDni - DNI del usuario
 * @returns {Promise} Promesa que se resuelve cuando el carrito es vaciado
 */
export async function vaciarCarrito(nombreTienda, usuarioDni) {
    await api.delete(`tiendas/${nombreTienda}/carrito/vaciar/${usuarioDni}`);
}

/**
 * Actualiza la cantidad de un item del carrito
 * Nota: Como el backend no tiene un endpoint específico para actualizar,
 * se elimina el item y se agrega uno nuevo con la cantidad actualizada
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} idItem - ID del item a actualizar
 * @param {number} productoId - ID del producto
 * @param {number} usuarioDni - DNI del usuario
 * @param {number} nuevaCantidad - Nueva cantidad del producto
 * @returns {Promise} Promesa que resuelve con el item actualizado
 */
export async function actualizarCantidadCarrito(nombreTienda, idItem, productoId, usuarioDni, nuevaCantidad) {
    // Eliminar el item actual
    await eliminarItemCarrito(nombreTienda, idItem);
    
    // Agregar uno nuevo con la cantidad actualizada
    return await agregarAlCarrito(nombreTienda, {
        usuarioDni: usuarioDni,
        productoId: productoId,
        cantidad: nuevaCantidad
    });
}

