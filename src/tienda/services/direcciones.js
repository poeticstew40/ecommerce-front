import api from "./api";

/**
 * Obtiene todas las direcciones guardadas de un usuario
 */
export async function getDireccionesByUsuario(dni) {
    const res = await api.get(`usuarios/direcciones/${dni}`);
    return res.data;
}

/**
 * Guarda una nueva dirección para el usuario
 */
export async function createDireccion(data) {
    const res = await api.post(`usuarios/direcciones`, data);
    return res.data;
}