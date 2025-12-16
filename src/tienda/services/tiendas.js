import api from "./api";

/**
 * Servicios para interactuar con el endpoint de tiendas de la API
 * Todas las operaciones de tiendas requieren el nombreUrl (slug) de la tienda
 */

/**
 * Obtiene todas las tiendas registradas (Para la página Explorar)
 * @returns {Promise} Promesa que resuelve con la lista de todas las tiendas
 */
export async function getAllTiendas() {
    const res = await api.get("tiendas");
    return res.data;
}

/**
 * Obtiene una tienda por su nombreUrl (slug)
 * @param {string} nombreUrl - El slug o identificador único de la tienda
 * @returns {Promise} Promesa que resuelve con los datos de la tienda
 */
export async function getTiendaBySlug(nombreUrl) {
    const res = await api.get(`tiendas/${nombreUrl}`);
    return res.data;
}

/**
 * Crea una nueva tienda (requiere multipart/form-data)
 * @param {FormData} formData - FormData con los campos 'tienda' (JSON string), 'file' (logo) y 'banners' (lista)
 * @returns {Promise} Promesa que resuelve con los datos de la tienda creada
 */
export async function createTienda(formData) {
    const res = await api.post("tiendas", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
}

/**
 * Actualiza una tienda existente (requiere multipart/form-data)
 * @param {string} nombreUrl - El slug de la tienda a actualizar
 * @param {FormData} formData - FormData con los campos 'tienda', 'file', 'banners'
 * @returns {Promise} Promesa que resuelve con los datos de la tienda actualizada
 */
export async function updateTienda(nombreUrl, formData) {
    const res = await api.patch(`tiendas/${nombreUrl}`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data;
}

/**
 * Obtiene la tienda de un vendedor por su DNI
 * Requiere estar autenticado y que el DNI coincida con el usuario logueado
 * @param {number} vendedorDni - DNI del vendedor
 * @returns {Promise<Object|null>} Promesa que resuelve con la tienda o null
 */
export async function getTiendaByVendedor(vendedorDni) {
    try {
        const res = await api.get(`tiendas/vendedor/${vendedorDni}`);
        return res.data;
    } catch (error) {
        // Si el endpoint no existe o el usuario no tiene tienda, retornar null
        if (error.response?.status === 404 || error.response?.status === 403) {
            return null;
        }
        // Si es un error de red o timeout, también retornar null para no bloquear
        if (!error.response) {
            console.warn("Error de red al obtener tienda por vendedor:", error.message);
            return null;
        }
        throw error;
    }
}

/**
 * Elimina una tienda y todo su contenido (productos, categorías, etc.)
 * @param {string} nombreUrl - El slug de la tienda a eliminar
 * @returns {Promise<void>} Promesa que se resuelve cuando la tienda es eliminada
 */
export async function deleteTienda(nombreUrl) {
    await api.delete(`tiendas/${nombreUrl}`);
}