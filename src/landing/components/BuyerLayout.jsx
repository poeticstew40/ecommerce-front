import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../tienda/contexts/AuthContext";
// Importamos los estilos del admin para mantener la consistencia visual
import "../../admin/styles/AdminLayout.css"; 

/**
 * Layout del panel del comprador (USUARIOS SIN TIENDA)
 * Ubicación: src/landing/components/BuyerLayout.jsx
 */
function BuyerLayout() {
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="admin-layout">
            {/* Sidebar con color distinto para diferenciar del vendedor */}
            <aside className="admin-sidebar" style={{ backgroundColor: '#2c3e50' }}>
                <div className="admin-sidebar-header">
                    <h2 className="admin-sidebar-title">
                        Mi Cuenta
                    </h2>
                </div>

                <nav className="admin-sidebar-nav">
                    <Link 
                        to="/perfil/compras"
                        className="admin-sidebar-link"
                    >
                        🛍️ Mis Compras
                    </Link>
             
                    <Link 
                        to="/perfil/seguridad"
                        className="admin-sidebar-link"
                    >
                        🔒 Seguridad
                    </Link>

                    {/* Separador */}
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 20px' }}></div>

                    <Link 
                        to="/admin/configuracion"
                        className="admin-sidebar-link"
                        style={{ color: '#60a5fa' }}
                    >
                        🚀 ¡Crear mi Tienda!
                    </Link>
                </nav>

                <div className="admin-sidebar-footer">
                    {usuario && (
                        <div className="admin-sidebar-footer-user">
                            <div className="admin-sidebar-footer-user-info">
                                <span className="admin-sidebar-footer-user-name">
                                    {usuario.nombre} {usuario.apellido}
                                </span>
                                {usuario.emailVerificado !== undefined && (
                                    <span 
                                        className={`admin-sidebar-footer-user-icon ${usuario.emailVerificado ? "verified" : "unverified"}`}
                                        title={usuario.emailVerificado ? "Email Verificado" : "Email No Verificado"}
                                    >
                                        {usuario.emailVerificado ? "✓" : "⚠️"}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="admin-sidebar-footer-logout"
                            >
                                Cerrar Sesión
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="btn-landing-link"
                            >
                                Volver al Inicio
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Contenido principal */}
            <div className="admin-content">
                {/* Navbar superior */}
                <header className="admin-header">
                    <h1 className="admin-header-title">
                        Panel de Usuario
                    </h1>
                    <Link 
                        to="/tiendas" 
                        className="btn-tienda-link"
                    >
                        Ir a Comprar
                    </Link>
                </header>

                {/* Contenido de la página */}
                <main className="admin-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default BuyerLayout;