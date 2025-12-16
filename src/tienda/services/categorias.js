import api from "./api";

/**
 * Servicios para interactuar con el endpoint de categorías de la API
 * 
 * Todas las operaciones de categorías requieren el nombreUrl (slug) de la tienda
 */

/**
 * Obtiene todas las categorías de una tienda
 * @param {string} nombreTienda - El slug o identificador único de la tienda
 * @returns {Promise} Promesa que resuelve con la lista de categorías
 */
export async function getCategoriasByTienda(nombreTienda) {
    const res = await api.get(`tiendas/${nombreTienda}/categorias`);
    return res.data;
}

/**
 * Obtiene una categoría por su ID
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} id - ID de la categoría
 * @returns {Promise} Promesa que resuelve con los datos de la categoría
 */
export async function getCategoriaById(nombreTienda, id) {
    const res = await api.get(`tiendas/${nombreTienda}/categorias/${id}`);
    return res.data;
}

/**
 * Crea una nueva categoría
 * @param {string} nombreTienda - El slug de la tienda
 * @param {Object} data - Datos de la categoría (debe incluir 'nombre')
 * @returns {Promise} Promesa que resuelve con los datos de la categoría creada
 */
export async function createCategoria(nombreTienda, data) {
    const res = await api.post(`tiendas/${nombreTienda}/categorias`, data);
    return res.data;
}

/**
 * Actualiza una categoría existente
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} id - ID de la categoría a actualizar
 * @param {Object} data - Datos de la categoría a actualizar
 * @returns {Promise} Promesa que resuelve con los datos de la categoría actualizada
 */
export async function updateCategoria(nombreTienda, id, data) {
    const res = await api.patch(`tiendas/${nombreTienda}/categorias/${id}`, data);
    return res.data;
}

/**
 * Elimina una categoría
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} id - ID de la categoría a eliminar
 * @returns {Promise} Promesa que se resuelve cuando la categoría es eliminada
 */
export async function deleteCategoria(nombreTienda, id) {
    await api.delete(`tiendas/${nombreTienda}/categorias/${id}`);
}