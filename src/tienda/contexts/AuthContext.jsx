import { createContext, useContext, useState, useEffect } from "react";
import { login as loginService, register as registerService } from "../services/auth";
import { getUsuarioByDni } from "../services/usuarios";
import { getTiendaByVendedor, getTiendaBySlug } from "../services/tiendas";

/**
 * Contexto de Autenticación
 * 
 * Proporciona el estado y funciones relacionadas con la autenticación del usuario.
 * Gestiona el token JWT y la información del usuario autenticado.
 * 
 * Funcionalidades:
 * - Almacenar token JWT en localStorage
 * - Gestionar estado de autenticación
 * - Proporcionar funciones de login, register y logout
 * - Cargar información del usuario autenticado
 * - Verificar si el usuario está autenticado
 */

const AuthContext = createContext(null);

/**
 * Hook personalizado para usar el contexto de autenticación
 * @returns {Object} Objeto con el estado y funciones de autenticación
 * @throws {Error} Si se usa fuera del AuthProvider
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
}

/**
 * Provider del contexto de autenticación
 * 
 * @param {React.ReactNode} children - Componentes hijos
 */
export function AuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [tiendaUsuario, setTiendaUsuario] = useState(null); // Tienda del usuario si es vendedor
    const [userType, setUserType] = useState(null); // 'vendedor' | 'comprador' | null
    const [tiendaActual, setTiendaActual] = useState(null); // Tienda actual donde está el comprador
    const [loading, setLoading] = useState(true);

    /**
     * Efecto que verifica si hay un token guardado al cargar la aplicación
     */
    useEffect(() => {
        const tokenGuardado = localStorage.getItem("auth_token");
        const usuarioGuardado = localStorage.getItem("auth_user");
        const tiendaGuardada = localStorage.getItem("auth_tienda");
        const userTypeGuardado = localStorage.getItem("auth_userType");
        const tiendaActualGuardada = localStorage.getItem("auth_tiendaActual");

        if (tokenGuardado) {
            setToken(tokenGuardado);
            
            // Cargar tipo de usuario
            if (userTypeGuardado) {
                setUserType(userTypeGuardado);
            }
            
            // Cargar tienda actual (para compradores)
            if (tiendaActualGuardada) {
                setTiendaActual(tiendaActualGuardada);
            }
            
            if (usuarioGuardado) {
                try {
                    const usuarioData = JSON.parse(usuarioGuardado);
                    
                    // Verificar que el usuario tenga DNI
                    if (!usuarioData?.dni) {
                        // Intentar obtener el DNI del token
                        try {
                            const payload = JSON.parse(atob(tokenGuardado.split('.')[1]));
                            const dni = payload.dni || payload.sub || payload.userId || payload.id;
                            if (dni) {
                                // Intentar obtener el usuario completo desde el servidor
                                getUsuarioByDni(dni)
                                    .then(usuarioCompleto => {
                                        guardarUsuario(usuarioCompleto);
                                    })
                                    .catch(() => {
                                        // Si falla, usar el usuario guardado pero agregar el DNI del token
                                        usuarioData.dni = dni;
                                        setUsuario(usuarioData);
                                        localStorage.setItem("auth_user", JSON.stringify(usuarioData));
                                    });
                            } else {
                                setUsuario(usuarioData);
                            }
                        } catch (error) {
                            setUsuario(usuarioData);
                        }
                    } else {
                        setUsuario(usuarioData);
                    }
                    
                    // Verificar tienda en localStorage primero (para vendedores)
                    const dniParaTienda = usuarioData?.dni;
                    if (dniParaTienda && tiendaGuardada) {
                        try {
                            const tienda = JSON.parse(tiendaGuardada);
                            // Verificar que la tienda pertenezca al usuario actual
                            // vendedorDni puede ser número o string, normalizar para comparar
                            const tiendaVendedorDni = typeof tienda.vendedorDni === 'string' 
                                ? parseInt(tienda.vendedorDni) 
                                : tienda.vendedorDni;
                            const usuarioDni = typeof dniParaTienda === 'string' 
                                ? parseInt(dniParaTienda) 
                                : dniParaTienda;
                            
                            if (tiendaVendedorDni === usuarioDni || 
                                (tienda.vendedor && tienda.vendedor.dni === usuarioDni)) {
                                // Si la tienda tiene nombreUrl, obtener la versión actualizada del servidor
                                if (tienda.nombreUrl) {
                                    getTiendaBySlug(tienda.nombreUrl)
                                        .then(tiendaActualizada => {
                                            // Verificar que la tienda actualizada pertenezca al usuario
                                            const tiendaActualizadaVendedorDni = typeof tiendaActualizada.vendedorDni === 'string'
                                                ? parseInt(tiendaActualizada.vendedorDni)
                                                : tiendaActualizada.vendedorDni;
                                            
                                            if (tiendaActualizadaVendedorDni === usuarioDni) {
                                                setTiendaUsuario(tiendaActualizada);
                                                localStorage.setItem("auth_tienda", JSON.stringify(tiendaActualizada));
                                                setUserType('vendedor');
                                                localStorage.setItem("auth_userType", "vendedor");
                                            } else {
                                                // La tienda no pertenece a este usuario, limpiar
                                                console.warn("Tienda actualizada no pertenece al usuario actual");
                                                localStorage.removeItem("auth_tienda");
                                                setTiendaUsuario(null);
                                                if (!userTypeGuardado) {
                                                    setUserType('comprador');
                                                    localStorage.setItem("auth_userType", "comprador");
                                                }
                                            }
                                        })
                                        .catch((error) => {
                                            // Si falla obtener la tienda del servidor (404, etc.), usar la de localStorage
                                            console.warn("No se pudo obtener la tienda actualizada del servidor, usando la de localStorage:", error);
                                            // Asegurarse de que la tienda de localStorage se mantenga
                                            if (tienda) {
                                                setTiendaUsuario(tienda);
                                                localStorage.setItem("auth_tienda", JSON.stringify(tienda));
                                                setUserType('vendedor');
                                                localStorage.setItem("auth_userType", "vendedor");
                                            }
                                        });
                                } else {
                                    // Si no tiene nombreUrl, usar la tienda de localStorage directamente
                                    setTiendaUsuario(tienda);
                                    setUserType('vendedor');
                                    localStorage.setItem("auth_userType", "vendedor");
                                }
                            } else {
                                // La tienda no pertenece a este usuario, limpiar
                                console.warn("Tienda en localStorage no pertenece al usuario actual, limpiando...");
                                localStorage.removeItem("auth_tienda");
                                setTiendaUsuario(null);
                                if (!userTypeGuardado) {
                                    setUserType('comprador');
                                    localStorage.setItem("auth_userType", "comprador");
                                }
                            }
                        } catch (e) {
                            console.error("Error parseando tienda guardada:", e);
                            localStorage.removeItem("auth_tienda");
                            setTiendaUsuario(null);
                        }
                    } else if (dniParaTienda) {
                        // Siempre intentar obtener la tienda del servidor para tener la versión más actualizada
                        getTiendaByVendedor(dniParaTienda)
                            .then(tienda => {
                                if (tienda) {
                                    setTiendaUsuario(tienda);
                                    localStorage.setItem("auth_tienda", JSON.stringify(tienda));
                                    setUserType('vendedor');
                                    localStorage.setItem("auth_userType", "vendedor");
                                } else {
                                    // Si no tiene tienda y no hay tipo guardado, puede ser comprador
                                    setTiendaUsuario(null);
                                    localStorage.removeItem("auth_tienda");
                                    if (!userTypeGuardado) {
                                        setUserType('comprador');
                                        localStorage.setItem("auth_userType", "comprador");
                                    }
                                }
                            })
                            .catch((error) => {
                                // Si el endpoint devuelve 404 o 403, el usuario no tiene tienda
                                if (error.response?.status === 404 || error.response?.status === 403) {
                                    setTiendaUsuario(null);
                                    localStorage.removeItem("auth_tienda");
                                    if (!userTypeGuardado) {
                                        setUserType('comprador');
                                        localStorage.setItem("auth_userType", "comprador");
                                    }
                                } else {
                                    // Para otros errores, mantener la tienda de localStorage si existe
                                    if (tiendaGuardada) {
                                        try {
                                            const tienda = JSON.parse(tiendaGuardada);
                                            const tiendaVendedorDni = typeof tienda.vendedorDni === 'string' 
                                                ? parseInt(tienda.vendedorDni) 
                                                : tienda.vendedorDni;
                                            const usuarioDni = typeof dniParaTienda === 'string' 
                                                ? parseInt(dniParaTienda) 
                                                : dniParaTienda;
                                            
                                            if (tiendaVendedorDni === usuarioDni) {
                                                setTiendaUsuario(tienda);
                                                setUserType('vendedor');
                                                localStorage.setItem("auth_userType", "vendedor");
                                            } else {
                                                setTiendaUsuario(null);
                                                localStorage.removeItem("auth_tienda");
                                            }
                                        } catch (e) {
                                            console.error("Error parseando tienda guardada:", e);
                                            setTiendaUsuario(null);
                                            localStorage.removeItem("auth_tienda");
                                        }
                                    } else {
                                        setTiendaUsuario(null);
                                        if (!userTypeGuardado) {
                                            setUserType('comprador');
                                            localStorage.setItem("auth_userType", "comprador");
                                        }
                                    }
                                }
                            });
                    }
                } catch (error) {
                    console.error("Error parseando usuario guardado:", error);
                    localStorage.removeItem("auth_user");
                }
            }
        }
        setLoading(false);
    }, []);

    const guardarUsuario = (usuarioData) => {
        localStorage.setItem("auth_user", JSON.stringify(usuarioData));
        setUsuario(usuarioData);
        
        // Siempre intentar obtener la tienda del servidor usando el DNI del vendedor
        // Esto asegura que siempre tengamos la versión más actualizada
        if (usuarioData?.dni) {
            getTiendaByVendedor(usuarioData.dni)
                .then(tienda => {
                    if (tienda) {
                        setTiendaUsuario(tienda);
                        localStorage.setItem("auth_tienda", JSON.stringify(tienda));
                        setUserType('vendedor');
                        localStorage.setItem("auth_userType", "vendedor");
                    } else {
                        // El usuario no tiene tienda
                        setTiendaUsuario(null);
                        localStorage.removeItem("auth_tienda");
                        const tipoGuardado = localStorage.getItem("auth_userType");
                        if (!tipoGuardado) {
                            setUserType('comprador');
                            localStorage.setItem("auth_userType", "comprador");
                        }
                    }
                })
                .catch((error) => {
                    // Si el endpoint devuelve 404 o 403, el usuario no tiene tienda
                    if (error.response?.status === 404 || error.response?.status === 403) {
                        setTiendaUsuario(null);
                        localStorage.removeItem("auth_tienda");
                        const tipoGuardado = localStorage.getItem("auth_userType");
                        if (!tipoGuardado) {
                            setUserType('comprador');
                            localStorage.setItem("auth_userType", "comprador");
                        }
                    } else {
                        // Para otros errores (red, timeout, etc.), mantener el estado actual
                        // pero intentar usar localStorage como respaldo
                        const tiendaGuardada = localStorage.getItem("auth_tienda");
                        if (tiendaGuardada) {
                            try {
                                const tienda = JSON.parse(tiendaGuardada);
                                const tiendaVendedorDni = typeof tienda.vendedorDni === 'string' 
                                    ? parseInt(tienda.vendedorDni) 
                                    : tienda.vendedorDni;
                                const usuarioDni = typeof usuarioData.dni === 'string' 
                                    ? parseInt(usuarioData.dni) 
                                    : usuarioData.dni;
                                
                                if (tiendaVendedorDni === usuarioDni) {
                                    setTiendaUsuario(tienda);
                                    setUserType('vendedor');
                                    localStorage.setItem("auth_userType", "vendedor");
                                } else {
                                    setTiendaUsuario(null);
                                    localStorage.removeItem("auth_tienda");
                                }
                            } catch (e) {
                                console.error("Error parseando tienda guardada:", e);
                                setTiendaUsuario(null);
                                localStorage.removeItem("auth_tienda");
                            }
                        } else {
                            setTiendaUsuario(null);
                            const tipoGuardado = localStorage.getItem("auth_userType");
                            if (!tipoGuardado) {
                                setUserType('comprador');
                                localStorage.setItem("auth_userType", "comprador");
                            }
                        }
                    }
                });
        } else {
            // Si no hay DNI, el usuario no puede tener tienda
            setTiendaUsuario(null);
            const tipoGuardado = localStorage.getItem("auth_userType");
            if (!tipoGuardado) {
                setUserType('comprador');
                localStorage.setItem("auth_userType", "comprador");
            }
        }
    };

    const cargarUsuarioDesdeToken = async (tokenJWT) => {
        try {
            const payload = JSON.parse(atob(tokenJWT.split('.')[1]));
            // Intentar obtener el DNI de diferentes campos posibles
            const dni = payload.dni || payload.sub || payload.userId || payload.id;
            
            if (dni) {
                try {
                    const usuarioCompleto = await getUsuarioByDni(dni);
                    guardarUsuario(usuarioCompleto);
                } catch (error) {
                    // Si falla obtener el usuario, intentar usar el payload directamente
                    if (payload.email || payload.nombre) {
                        guardarUsuario({
                            dni: dni,
                            email: payload.email,
                            nombre: payload.nombre,
                            apellido: payload.apellido
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error cargando usuario desde token:", error);
        }
    };

    const procesarAutenticacion = async (token, dni = null) => {
        if (!token) {
            throw new Error("No se recibió token del servidor");
        }

        localStorage.setItem("auth_token", token);
        setToken(token);

        // Si se proporciona el DNI, intentar obtener el usuario completo directamente
        if (dni) {
            try {
                const usuarioCompleto = await getUsuarioByDni(dni);
                guardarUsuario(usuarioCompleto);
                return; // Salir temprano si se obtuvo el usuario por DNI
            } catch (err) {
                // Si falla, intentar desde el token
            }
        }

        // Si no se proporcionó DNI o falló, intentar desde el token
        try {
            await cargarUsuarioDesdeToken(token);
        } catch (error) {
            console.error("Error cargando usuario desde token:", error);
            // Si también falla y tenemos DNI, intentar una vez más
            if (dni) {
                try {
                    const usuarioCompleto = await getUsuarioByDni(dni);
                    guardarUsuario(usuarioCompleto);
                } catch (err) {
                    console.error("Error final cargando usuario:", err);
                }
            }
        }
    };

    const login = async (credenciales, dni = null) => {
        try {
            const response = await loginService(credenciales);
            
            // Primero guardar el token para que esté disponible en las siguientes peticiones
            localStorage.setItem("auth_token", response.token);
            setToken(response.token);
            
            // Si se proporciona el DNI, validar que corresponda al email
            if (dni) {
                try {
                    // Ahora que el token está guardado, podemos obtener el usuario por DNI
                    const usuarioPorDni = await getUsuarioByDni(dni);
                    
                    // Normalizar emails para comparación (trim y case-insensitive)
                    const emailUsuario = (usuarioPorDni.email || '').trim().toLowerCase();
                    const emailLogin = (credenciales.email || '').trim().toLowerCase();
                    
                    // Verificar que el email del usuario obtenido por DNI coincida con el email usado para login
                    if (emailUsuario !== emailLogin) {
                        // Limpiar el token si la validación falla
                        localStorage.removeItem("auth_token");
                        setToken(null);
                        throw new Error("El DNI no corresponde al email ingresado. Verifique los datos.");
                    }
                    // Si coincide, procesar autenticación con el DNI correcto
                    await procesarAutenticacion(response.token, dni);
                } catch (error) {
                    // Limpiar el token si la validación falla
                    localStorage.removeItem("auth_token");
                    setToken(null);
                    
                    // Si el error ya es sobre email no coincidente, lanzarlo directamente
                    if (error.message && error.message.includes("no corresponde")) {
                        throw error;
                    }
                    // Si es un error 404 (usuario no encontrado), indicar que el DNI no es válido
                    if (error.response?.status === 404 || error.message?.includes('404')) {
                        throw new Error("El DNI ingresado no es válido. Verifique los datos.");
                    }
                    // Si es un error 403, puede ser que el DNI no corresponda o no tenga permisos
                    if (error.response?.status === 403 || error.message?.includes('403')) {
                        throw new Error("El DNI ingresado no es válido o no corresponde al email. Verifique los datos.");
                    }
                    // Si hay otro error, también lanzar error
                    throw new Error("El DNI ingresado no es válido o no corresponde al email. Verifique los datos.");
                }
            } else {
                // Si no se proporciona DNI, procesar autenticación normalmente
                await procesarAutenticacion(response.token);
            }
            return { success: true };
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    };

    const register = async (datos) => {
        try {
            const response = await registerService(datos);
            await procesarAutenticacion(response.token, datos.dni);
            return { success: true };
        } catch (error) {
            console.error("Error en registro:", error);
            throw error;
        }
    };

    /**
     * Función para cerrar sesión
     */
    const logout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_tienda");
        localStorage.removeItem("auth_userType");
        localStorage.removeItem("auth_tiendaActual");
        setToken(null);
        setUsuario(null);
        setTiendaUsuario(null);
        setUserType(null);
        setTiendaActual(null);
    };

    const value = {
        token,
        usuario,
        tiendaUsuario, // Tienda del usuario si es vendedor
        userType, // 'vendedor' | 'comprador' | null
        tiendaActual, // Tienda actual donde está el comprador
        isVendedor: !!tiendaUsuario || userType === 'vendedor', // Indica si el usuario es vendedor
        isComprador: userType === 'comprador', // Indica si el usuario es comprador
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        setUsuario,
        setUserType, // Función para establecer el tipo de usuario manualmente
        setTiendaActual, // Función para establecer la tienda actual
        setTiendaUsuario, // Función para establecer la tienda del usuario
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;

