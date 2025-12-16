import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../../tienda/contexts/AuthContext.jsx";
import { useNotifications } from "../../contexts/NotificationContext.jsx";
import Header from "../components/Header.jsx";
import "../../landing/styles/Login.css";
import "../../landing/styles/Landing.css";
import "../../MainStyles.css";
import { IoPerson } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { FaAddressCard } from "react-icons/fa6";

import Footer_Landing from "../../landing/components/Footer_Landing.jsx";

/**
 * Componente Login Unificado
 * 
 * Componente único que maneja tanto login de vendedores como de compradores.
 * Detecta automáticamente el contexto según la ruta:
 * - /login -> vendedor (redirige a /admin/{nombreTienda})
 * - /tienda/:nombreTienda/login -> comprador (permanece en la tienda)
 * 
 * Mantiene el diseño y funcionalidad original del Login.jsx
 */
function LoginComprador() {
    const { login, register: registerUser, setUserType, isAuthenticated, tiendaUsuario } = useAuth();
    const { success: showSuccess, error: showError } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const { nombreTienda } = useParams();
    
    // Detectar automáticamente el tipo de usuario según la ruta
    const isComprador = location.pathname.includes('/tienda/') && nombreTienda;
    const userType = isComprador ? 'comprador' : 'vendedor';
    
    const [isRegisterActive, setIsRegisterActive] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    
    // Estados para el formulario de login
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });
    const [loginError, setLoginError] = useState(null);
    const [loginLoading, setLoginLoading] = useState(false);
    
    // Estados para el formulario de registro
    const [registerForm, setRegisterForm] = useState({
        dni: '',
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [registerError, setRegisterError] = useState(null);
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            if (userType === 'vendedor') {
                // Vendedor: redirigir al admin
                if (tiendaUsuario) {
                    const nombreTiendaAdmin = tiendaUsuario.nombreUrl || tiendaUsuario.nombreTienda;
                    if (nombreTiendaAdmin) {
                        navigate(`/admin/${nombreTiendaAdmin}`, { replace: true });
                    } else {
                        navigate("/admin/dashboard", { replace: true });
                    }
                } else {
                    navigate("/admin/dashboard", { replace: true });
                }
            } else if (userType === 'comprador' && nombreTienda) {
                // Comprador dentro de una tienda: volver a donde estaba o al catálogo
                const returnPath = location.state?.from || `/tienda/${nombreTienda}/catalogo`;
                navigate(returnPath, { replace: true });
            } else if (userType === 'comprador' && !nombreTienda) {
                // Comprador en /login: redirigir al landing
                navigate("/", { replace: true });
            } else {
                // Si está autenticado pero no tiene tipo definido, redirigir al landing
                navigate("/", { replace: true });
            }
        }
    }, [isAuthenticated, userType, tiendaUsuario, nombreTienda, navigate, location]);

    // Manejador para los cambios en los inputs del login
    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejador para el envío del formulario de login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError(null);
        setLoginLoading(true);
        
        try {
            // Validaciones básicas
            if (!loginForm.email || !loginForm.email.includes('@')) {
                throw new Error("Email inválido");
            }
            if (!loginForm.password || loginForm.password.length < 6) {
                throw new Error("La contraseña debe tener al menos 6 caracteres");
            }

            // Guardar tipo de usuario
            if (setUserType) {
                setUserType(userType);
            }
            localStorage.setItem("auth_userType", userType);
            
            // Preparar datos de login (solo email y password para la API)
            const credencialesLogin = {
                email: loginForm.email,
                password: loginForm.password
            };
            
            // Llamada al contexto de autenticación (sin DNI para compradores)
            const dniParaLogin = null;
            await login(credencialesLogin, dniParaLogin);
            
            // Mostrar notificación de éxito (persistirá entre navegaciones)
            showSuccess('Inicio de sesión exitoso', '¡Bienvenido de nuevo!');
            
            // Redirección según tipo de usuario
            setTimeout(() => {
                if (userType === 'vendedor') {
                    // Para vendedores: redirigir al admin de su tienda
                    const tiendaGuardada = localStorage.getItem("auth_tienda");
                    if (tiendaGuardada) {
                        try {
                            const tienda = JSON.parse(tiendaGuardada);
                            const nombreTiendaAdmin = tienda.nombreUrl || tienda.nombreTienda;
                            navigate(`/admin/${nombreTiendaAdmin}`, { replace: true });
                        } catch {
                            navigate("/admin/dashboard", { replace: true });
                        }
                    } else {
                        navigate("/admin/dashboard", { replace: true });
                    }
                } else if (userType === 'comprador') {
                    // Para compradores: volver a donde estaban o a la tienda
                    if (nombreTienda) {
                        localStorage.setItem("auth_tiendaActual", nombreTienda);
                        const returnPath = location.state?.from || `/tienda/${nombreTienda}/catalogo`;
                        navigate(returnPath, { replace: true });
                    } else {
                        navigate("/", { replace: true });
                    }
                }
            }, 500);
            
        } catch (error) {
            console.error("Error en login:", error);
            
            // Mensajes de error más específicos
            let errorMessage = "Error al iniciar sesión. Verifica tus credenciales.";
            
            if (error.message) {
                if (error.message.includes('timeout') || error.message.includes('tardó demasiado')) {
                    errorMessage = "La petición tardó demasiado. Verifica tu conexión a internet.";
                } else if (error.message.includes('conexión') || error.message.includes('Network Error')) {
                    errorMessage = "Error de conexión. Verifica que el servidor esté disponible o tu conexión a internet.";
                } else if (error.message.includes('401') || error.message.includes('403')) {
                    errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
                } else {
                    errorMessage = error.message;
                }
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 401 || error.response?.status === 403) {
                errorMessage = "Credenciales incorrectas. Verifica tu email y contraseña.";
            } else if (error.response?.status >= 500) {
                errorMessage = "Error del servidor. Intenta nuevamente más tarde.";
            }
            
            setLoginError(errorMessage);
            
            // Mostrar notificación de error (persistirá entre navegaciones)
            showError('Error al iniciar sesión', errorMessage);
        } finally {
            setLoginLoading(false);
        }
    };

    // Manejador para los cambios en los inputs del registro
    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejador para el envío del formulario de registro
    const handleRegister = async (e) => {
        e.preventDefault();
        setRegisterError(null);
        setRegisterLoading(true);
        
        try {
            // Validaciones básicas
            if (!registerForm.dni || registerForm.dni.length < 7) {
                throw new Error("DNI inválido (debe tener al menos 7 dígitos)");
            }
            if (!registerForm.nombre || registerForm.nombre.trim().length === 0) {
                throw new Error("El nombre es requerido");
            }
            if (!registerForm.apellido || registerForm.apellido.trim().length === 0) {
                throw new Error("El apellido es requerido");
            }
            if (!registerForm.email || !registerForm.email.includes('@')) {
                throw new Error("Email inválido");
            }
            // Validación de contraseña: mínimo 6 caracteres, al menos una mayúscula y un número
            if (registerForm.password.length < 6) {
                throw new Error("La contraseña debe tener al menos 6 caracteres");
            }
            if (!/[A-Z]/.test(registerForm.password)) {
                throw new Error("La contraseña debe contener al menos una letra mayúscula");
            }
            if (!/[0-9]/.test(registerForm.password)) {
                throw new Error("La contraseña debe contener al menos un número");
            }
            
            // Validar que las contraseñas coincidan
            if (registerForm.password !== registerForm.confirmPassword) {
                throw new Error("Las contraseñas no coinciden");
            }

            // Convertir DNI a número
            const datosRegistro = {
                ...registerForm,
                dni: parseInt(registerForm.dni)
            };

            // Guardar tipo de usuario
            if (setUserType) {
                setUserType(userType);
            }
            localStorage.setItem("auth_userType", userType);
            
            if (userType === 'comprador' && nombreTienda) {
                localStorage.setItem("auth_tiendaActual", nombreTienda);
            }

            // Llamada al contexto de autenticación
            await registerUser(datosRegistro);
            
            // Mostrar notificación de éxito (persistirá entre navegaciones)
            showSuccess(
                'Cuenta creada con éxito',
                userType === 'vendedor' 
                    ? '¡Bienvenido! Redirigiendo al dashboard...' 
                    : '¡Bienvenido! Redirigiendo...'
            );
            
            // Redirección según tipo de usuario
            if (userType === 'vendedor') {
                // Para vendedores: redirigir al dashboard después de 2 segundos
                setRegisterSuccess(true);
                setRegisterForm({
                    dni: '',
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                
                setTimeout(() => {
                    setIsRegisterActive(false);
                    setRegisterSuccess(false);
                    navigate("/admin/dashboard", { replace: true });
                }, 2000);
            } else if (userType === 'comprador') {
                // Para compradores: redirigir al catálogo después de 2 segundos
                setRegisterSuccess(true);
                setRegisterForm({
                    dni: '',
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                
                setTimeout(() => {
                    setIsRegisterActive(false);
                    setRegisterSuccess(false);
                    if (nombreTienda) {
                        navigate(`/tienda/${nombreTienda}/catalogo`, { replace: true });
                    } else {
                        navigate("/", { replace: true });
                    }
                }, 2000);
            } else {
                // Por defecto: cambiar al formulario de login
                setRegisterSuccess(true);
                setRegisterForm({
                    dni: '',
                    nombre: '',
                    apellido: '',
                    email: '',
                    password: '',
                    confirmPassword: ''
                });
                
                setTimeout(() => {
                    setIsRegisterActive(false);
                    setRegisterSuccess(false);
                }, 2000);
            }

        } catch (error) {
            console.error("Error en registro:", error);
            const errorMessage = error.response?.data?.message || 
                error.message || 
                "Error al registrar usuario";
            
            setRegisterError(errorMessage);
            
            // Mostrar notificación de error (persistirá entre navegaciones)
            showError('Error al registrar', errorMessage);
        } finally {
            setRegisterLoading(false);
        }
    };

    // Textos personalizados según el tipo de usuario
    const getWelcomeText = () => {
        if (userType === 'comprador') {
            return {
                register: {
                    title: "¡Bienvenido!",
                    message: `¿Aún no tienes una cuenta en ${nombreTienda || 'esta tienda'}? Regístrate y comienza a comprar.`,
                    button: "Regístrate"
                },
                login: {
                    title: "¡Nos alegra verte de nuevo!",
                    message: "¿Ya tienes una cuenta?",
                    button: "Inicia sesión"
                }
            };
        } else {
            return {
                register: {
                    title: "¡Bienvenido!",
                    message: "¿Aún no tienes una cuenta? Regístrate y comienza tu experiencia como vendedor.",
                    button: "Regístrate"
                },
                login: {
                    title: "¡Nos alegra verte de nuevo!",
                    message: "¿Ya tienes una cuenta?",
                    button: "Inicia sesión"
                }
            };
        }
    };

    const welcomeTexts = getWelcomeText();

    return (
        <div>
            {/* Header de navegación */}
            <Header />

            {/* Contenedor principal del login */}
            <div className="main-login-tienda">
                <div className={`all-login-container ${isRegisterActive ? "active" : ""}`}>

                    {/* FORM LOGIN */}
                    <div className="login-box">
                        <form onSubmit={handleLogin}>
                            <h2>Iniciar Sesión</h2>
                            <div className="input-box-tienda">
                                <span className="icon">
                                    <IoMail name="mail-outline" size={20}/>
                                </span>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={loginForm.email}
                                    onChange={handleLoginChange}
                                    required 
                                />
                                <label>Email</label>
                            </div>
                            <div className="input-box-tienda">
                                <span className="icon">
                                    <FaLock name="lock-closed-outline" size={18}/>
                                </span>
                                <input 
                                    type={showLoginPassword ? "text" : "password"}
                                    name="password"
                                    value={loginForm.password}
                                    onChange={handleLoginChange}
                                    required 
                                />
                                <label>Contraseña</label>
                            </div>
                            <div className="password-details">
                                <label>
                                    <input 
                                        type="checkbox"
                                        checked={showLoginPassword}
                                        onChange={(e) => setShowLoginPassword(e.target.checked)}
                                    />
                                    Mostrar contraseña
                                </label>
                            </div>
                            <div className="submit-button-contenedor-tienda">
                                <button type="submit" disabled={loginLoading}>
                                    {loginLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                                </button>
                                {loginError && (
                                    <div className="error-message" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
                                        {loginError}
                                    </div>
                                )}
                            </div>
                                <Link to="/forgot-password" className="password-forgot-tienda">
                                ¿Olvidaste tu contraseña?
                                </Link>
                        </form>
                    </div>

                    {/* FORM REGISTRO */}
                    <div className="register-box">
                        <form onSubmit={handleRegister}>
                            <h2>Registrarse</h2>
                            <div className="input-box-tienda">
                                <span className="icon">
                                    <FaAddressCard name="dni-outline" size={20}/>
                                </span>
                                <input 
                                    type="text" 
                                    name="dni"
                                    value={registerForm.dni}
                                    onChange={handleRegisterChange}
                                    pattern="^[0-9]{7,8}$" 
                                    inputMode="numeric" 
                                    maxLength="8"
                                    title="Ingrese un DNI válido (solo números, entre 7 y 8 dígitos)"
                                    required 
                                />
                                <label>DNI</label>
                            </div>
                            <div className="input-box-tienda">
                                <span className="icon">
                                    <IoPerson name="mail-outline" size={20}/>
                                </span>
                                <input 
                                    type="text" 
                                    name="nombre"
                                    value={registerForm.nombre}
                                    onChange={handleRegisterChange}
                                    required
                                />
                                <label>Nombre</label>
                            </div>
                            <div className="input-box-tienda">
                                <span className="icon">
                                    <IoPerson name="mail-outline" size={20}/>
                                </span>
                                <input 
                                    type="text" 
                                    name="apellido"
                                    value={registerForm.apellido}
                                    onChange={handleRegisterChange}
                                    required
                                />
                                <label>Apellido</label>
                            </div>
                            <div className="input-box-tienda">
                                <span className="icon">
                                    <IoMail name="mail-outline" size={20}/>
                                </span>
                                <input 
                                    type="email" 
                                    name="email"
                                    value={registerForm.email}
                                    onChange={handleRegisterChange}
                                    required 
                                />
                                <label>Email</label>
                            </div>
                            <div className="input-box-tienda">
                                <span className="icon">
                                    <FaLock name="lock-closed-outline" size={18}/>
                                </span>
                                <input 
                                    type={showRegisterPassword ? "text" : "password"}
                                    name="password"
                                    value={registerForm.password}
                                    onChange={handleRegisterChange}
                                    required 
                                />
                                <label>Contraseña</label>
                            </div>
                            <div className="input-box-tienda">
                                <span className="icon">
                                    <FaLock name="lock-closed-outline" size={18}/>
                                </span>
                                <input 
                                    type={showRegisterPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={registerForm.confirmPassword}
                                    onChange={handleRegisterChange}
                                    required 
                                />
                                <label>Confirmar Contraseña</label>
                            </div>
                            <div className="password-details">
                                <label>
                                    <input 
                                        type="checkbox"
                                        checked={showRegisterPassword}
                                        onChange={(e) => setShowRegisterPassword(e.target.checked)}
                                    />
                                    Mostrar contraseña
                                </label>
                            </div>
                            <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '-10px', marginBottom: '10px', display: 'block' }}>
                                La contraseña debe tener mínimo 6 caracteres, al menos una letra mayúscula y un número.
                            </small>
                            <div className="submit-button-contenedor-tienda">
                                <button type="submit" disabled={registerLoading}>
                                    {registerLoading ? "Registrando..." : "Registrarse"}
                                </button>

                                {registerError && (
                                    <div className="error-message" style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>
                                        {registerError}
                                    </div>
                                )}
                                {registerSuccess && (
                                    <div className="success-message" style={{ color: 'green', marginTop: '10px', textAlign: 'center' }}>
                                        ¡Registro exitoso! {userType === 'vendedor' ? 'Redirigiendo al dashboard...' : 'Redirigiendo...'}
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* CONTENEDOR DE BIENVENIDA */}
                    <div className="container-welcome-tienda">
                        {/* Panel para el registro */}
                        <div className={`welcome-panel-tienda welcome-register ${isRegisterActive ? "hidden" : "visible"}`} aria-hidden={isRegisterActive}>
                            <h2>{welcomeTexts.register.title}</h2>
                            <p>{welcomeTexts.register.message}</p>
                            <button type="button" className="welcome-btn-tienda" onClick={() => setIsRegisterActive(true)}>
                                {welcomeTexts.register.button}
                            </button>
                        </div>
                        {/* Panel para el login */}
                        <div className={`welcome-panel-tienda welcome-login ${isRegisterActive ? "visible" : "hidden"}`} aria-hidden={!isRegisterActive}>
                            <h2>{welcomeTexts.login.title}</h2>
                            <p>{welcomeTexts.login.message}</p>
                            <button type="button" className="welcome-btn-tienda" onClick={() => setIsRegisterActive(false)}>
                                {welcomeTexts.login.button}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Botón móvil para cambiar entre login y registro (fuera del contenedor) */}
                <div className="mobile-toggle-btn-container">
                    <p className="mobile-toggle-text">
                        {isRegisterActive ? welcomeTexts.login.message : welcomeTexts.register.message}
                    </p>
                    <button 
                        type="button" 
                        className="mobile-toggle-btn-tienda"
                        onClick={() => setIsRegisterActive(!isRegisterActive)}
                    >
                        {isRegisterActive ? welcomeTexts.login.button : welcomeTexts.register.button}
                    </button>
                </div>
            </div>
            <Footer_Landing />
        </div>
    );
}

export default LoginComprador;

