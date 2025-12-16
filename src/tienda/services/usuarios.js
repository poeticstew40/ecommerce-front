import api from "./api";

/**
 * Servicios para interactuar con el endpoint de usuarios de la API
 */

export async function getUsuarios() {
    const res = await api.get("usuarios");
    return res.data;
}

export async function getUsuarioByDni(dni) {
    const res = await api.get(`usuarios/${dni}`);
    return res.data;
}

export async function createUsuario(data) {
    const res = await api.post("usuarios", data);
    return res.data;
}

export async function updateUsuario(dni, data) {
    const res = await api.patch(`usuarios/${dni}`, data);
    return res.data;
}

export async function deleteUsuario(dni) {
    await api.delete(`usuarios/${dni}`);
}