import api from "./api";

/**
 * Servicios para interactuar con el endpoint de productos de la API
 * * Todas las operaciones de productos requieren el nombreUrl (slug) de la tienda
 */

/**
 * Obtiene todos los productos de una tienda
 * @param {string} nombreTienda - El slug o identificador único de la tienda
 * @param {string} sort - Ordenamiento opcional (ej: "precio", "nombre")
 * @returns {Promise} Promesa que resuelve con la lista de productos
 */
export async function getProductosByTienda(nombreTienda, sort = null) {
    const params = sort ? { sort } : {};
    const res = await api.get(`tiendas/${nombreTienda}/productos`, { params });
    return res.data;
}

/**
 * Obtiene un producto por su ID
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} id - ID del producto
 * @returns {Promise} Promesa que resuelve con los datos del producto
 */
export async function getProductoById(nombreTienda, id) {
    const res = await api.get(`tiendas/${nombreTienda}/productos/${id}`);
    return res.data;
}

/**
 * Crea un nuevo producto (requiere multipart/form-data)
 * @param {string} nombreTienda - El slug de la tienda
 * @param {FormData} formData - FormData con los campos 'producto' (JSON string) y 'files' (lista de imagenes)
 * @returns {Promise} Promesa que resuelve con los datos del producto creado
 */
export async function createProducto(nombreTienda, formData) {
    const res = await api.post(`tiendas/${nombreTienda}/productos`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
}

/**
 * Actualiza un producto existente
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} id - ID del producto a actualizar
 * @param {FormData} formData - Datos del producto a actualizar (FormData para soportar imágenes)
 * @returns {Promise} Promesa que resuelve con los datos del producto actualizado
 */
export async function updateProducto(nombreTienda, id, formData) {
    const res = await api.patch(`tiendas/${nombreTienda}/productos/${id}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
}

/**
 * Elimina un producto
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} id - ID del producto a eliminar
 * @returns {Promise} Promesa que se resuelve cuando el producto es eliminado
 */
export async function deleteProducto(nombreTienda, id) {
    await api.delete(`tiendas/${nombreTienda}/productos/${id}`);
}

/**
 * Busca productos por nombre
 * @param {string} nombreTienda - El slug de la tienda
 * @param {string} termino - Término de búsqueda
 * @returns {Promise} Promesa que resuelve con la lista de productos encontrados
 */
export async function buscarProductos(nombreTienda, termino) {
    const res = await api.get(`tiendas/${nombreTienda}/productos/buscar`, {
        params: { q: termino }
    });
    return res.data;
}

/**
 * Obtiene productos por categoría
 * @param {string} nombreTienda - El slug de la tienda
 * @param {number} categoriaId - ID de la categoría
 * @returns {Promise} Promesa que resuelve con la lista de productos de la categoría
 */
export async function getProductosByCategoria(nombreTienda, categoriaId) {
    const res = await api.get(`tiendas/${nombreTienda}/productos/categoria/${categoriaId}`);
    return res.data;
}