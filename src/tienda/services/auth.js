import api from "./api";

/**
 * Servicios de autenticación
 * 
 * Maneja el registro y login de usuarios, devolviendo tokens JWT
 * según la documentación de la API v3
 */

/**
 * Registra un nuevo usuario y devuelve el token JWT
 * @param {Object} datos - Datos del usuario a registrar
 * @param {number} datos.dni - DNI del usuario
 * @param {string} datos.nombre - Nombre del usuario
 * @param {string} datos.apellido - Apellido del usuario
 * @param {string} datos.email - Email del usuario
 * @param {string} datos.password - Contraseña del usuario
 * @returns {Promise<Object>} Promesa que resuelve con { token: string }
 */
export async function register(datos) {
    const res = await api.post("auth/register", datos);
    return res.data; // Devuelve { token: "..." }
}

/**
 * Inicia sesión y devuelve el token JWT
 * @param {Object} credenciales - Credenciales de login
 * @param {string} credenciales.email - Email del usuario
 * @param {string} credenciales.password - Contraseña del usuario
 * @returns {Promise<Object>} Promesa que resuelve con { token: string }
 */
export async function login(credenciales) {
    const res = await api.post("auth/login", credenciales);
    return res.data; // Devuelve { token: "..." }
}

/**
 * Verifica la cuenta de usuario mediante un código
 * @param {string} codigo - Código de verificación
 * @returns {Promise<string>} Promesa que resuelve con un mensaje de confirmación
 */
export async function verifyAccount(codigo) {
    const res = await api.get(`auth/verify?code=${codigo}`);
    return res.data;
}

/**
 * Solicita la recuperación de contraseña
 * @param {Object} datos - Datos para recuperar contraseña
 * @param {number} datos.dni - DNI del usuario
 * @param {string} datos.email - Email del usuario
 * @returns {Promise<Object>} Promesa que resuelve con un mensaje de confirmación
 */
export async function forgotPassword(datos) {
    const res = await api.post("auth/forgot-password", datos);
    return res.data;
}

/**
 * Restablece la contraseña usando un token
 * @param {Object} datos - Datos para restablecer contraseña
 * @param {string} datos.token - Token de recuperación
 * @param {string} datos.newPassword - Nueva contraseña
 * @returns {Promise<Object>} Promesa que resuelve con un mensaje de confirmación
 */
export async function resetPassword(datos) {
    const res = await api.post("auth/reset-password", datos);
    return res.data;
}

/**
 * Cambia la contraseña desde el perfil (requiere contraseña actual)
 * @param {Object} datos - Datos para cambiar contraseña
 * @param {string} datos.currentPassword - Contraseña actual
 * @param {string} datos.newPassword - Nueva contraseña
 * @returns {Promise<Object>} Promesa que resuelve con un mensaje de confirmación
 */
export async function changePassword(datos) {
    const res = await api.post("auth/change-password", datos);
    return res.data;
}

