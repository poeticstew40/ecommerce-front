import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../tienda/contexts/AuthContext.jsx";
import { FaStore, FaShoppingBag, FaUser, FaSignOutAlt, FaSignInAlt, FaRocket, FaBox, FaShoppingCart, FaChartLine, FaCreditCard, FaShieldAlt, FaUserPlus } from "react-icons/fa";
import "../styles/Footer_Landing.css";
import "../../MainStyles.css";
import "../styles/Landing.css";

import Footer_Landing from "../components/Footer_Landing.jsx";

/**
 * Componente Landing
 * 
 * Página inicial de la aplicación. Muestra información general
 * y permite navegar a las tiendas o iniciar sesión.
 * Diseño basado en landing
 */
function Landing() {
    const { isAuthenticated, usuario, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };

    const scrollToFeatures = (e) => {
        e.preventDefault();
        const featuresSection = document.getElementById("features");
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="landing-page">
            {/* Header de navegación */}
            <header className="landing-header">
                <nav className="landing-nav">
                    <Link to="/" className="landing-logo">
                        <FaStore />
                        <h1>TradioGlobal</h1>
                    </Link>
                    <div className="landing-nav-container">
                        <div className="landing-nav-links-container">
                            <a href="#features" onClick={scrollToFeatures} className="landing-nav-link">
                                Características
                            </a>
                            <Link to="/info/acerca" className="landing-nav-link">Acerca de</Link>
                            <Link to="/info/ayuda" className="landing-nav-link">Soporte</Link>
                        </div>
                        <div className="landing-nav-actions">
                            <Link to="/tiendas" className="btn-secondary-header">
                                <FaShoppingBag />
                                Explorar Tiendas
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <Link to="/login" className="btn-primary-header">
                                        <FaUser />
                                        Mi Cuenta
                                    </Link>
                                    <button onClick={handleLogout} className="btn-logout">
                                        <FaSignOutAlt />
                                        Cerrar Sesión
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="btn-primary-header">
                                    <FaSignInAlt />
                                    Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>
            </header>
            {/* -------------- Header de navegación mobile -------------- */}
            <div className="landing-header-mobile">
                <div className="landing-nav-actions">
                    <Link to="/tiendas" className="btn-secondary-header-mobile">
                        <FaShoppingBag />
                        Explorar Tiendas
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/login" className="btn-primary-header-mobile">
                                <FaUser />
                                Mi Cuenta
                            </Link>
                            <button onClick={handleLogout} className="btn-logout-mobile">
                                <FaSignOutAlt />
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn-primary-header-mobile">
                            <FaSignInAlt />
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>

            {/* Sección Hero */}
            <main>
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Plataforma Multitienda para Vendedores</h1>
                        <p className="hero-subtitle">
                            Crea tu propia tienda online y vende tus productos. 
                            Descubrí productos increíbles de múltiples tiendas en un solo lugar.
                            Gestiona tu negocio de manera eficiente y profesional.
                        </p>
                        <div className="hero-actions">
                            <Link to="/tiendas" className="btn-primary">
                                <FaShoppingBag />
                                Explorar Tiendas
                            </Link>
                            <Link to="/login" className="btn-secondary">
                                {isAuthenticated ? <FaUser /> : <FaRocket />}
                                {isAuthenticated ? "Mi Cuenta" : "Comenzar Gratis"}
                            </Link>
                        </div>
                        <div className="hero-image">
                            <div className="hero-dashboard-preview">
                                <div className="preview-header">
                                    <div className="preview-logo">
                                        <FaStore />
                                        <span>TradioGlobal</span>
                                    </div>
                                    <span>Dashboard</span>
                                </div>
                                <div className="preview-stats">
                                    <div className="preview-stat">
                                        <span className="preview-stat-number">10</span>
                                        <span className="preview-stat-label">Tiendas</span>
                                    </div>
                                    <div className="preview-stat">
                                        <span className="preview-stat-number">50</span>
                                        <span className="preview-stat-label">Usuarios</span>
                                    </div>
                                    <div className="preview-stat">
                                        <span className="preview-stat-number">120</span>
                                        <span className="preview-stat-label">Productos</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Características */}
                <section className="features-section" id="features">
                    <div className="features-container">
                        <h2 className="section-title">¿Por qué elegir nuestra plataforma?</h2>
                        <p className="section-subtitle">
                            Nuestra plataforma está diseñada para vendedores y compradores
                            ofreciendo herramientas poderosas y fáciles de usar.
                        </p>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <FaStore />
                                </div>
                                <h3 className="feature-title">Tu Propia Tienda</h3>
                                <p className="feature-description">
                                    Crea y personaliza tu tienda online con tu logo, 
                                    nombre y descripción. Totalmente personalizable.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <FaBox />
                                </div>
                                <h3 className="feature-title">Gestión de Productos</h3>
                                <p className="feature-description">
                                    Administra tu catálogo de productos, categorías, 
                                    precios y stock de manera intuitiva.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <FaShoppingCart />
                                </div>
                                <h3 className="feature-title">Gestión de Pedidos</h3>
                                <p className="feature-description">
                                    Recibe y gestiona pedidos en tiempo real. 
                                    Controla el estado de cada venta desde tu panel.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <FaChartLine />
                                </div>
                                <h3 className="feature-title">Estadísticas y Reportes</h3>
                                <p className="feature-description">
                                    Visualiza tus ventas, productos más vendidos 
                                    y rendimiento de tu tienda con gráficos detallados.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <FaCreditCard />
                                </div>
                                <h3 className="feature-title">Pagos Integrados</h3>
                                <p className="feature-description">
                                    Integración con Mercado Pago para recibir pagos 
                                    de forma segura y rápida.
                                </p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <FaShieldAlt />
                                </div>
                                <h3 className="feature-title">Seguridad</h3>
                                <p className="feature-description">
                                    Protección de datos con autenticación JWT 
                                    y encriptación avanzada.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Call to Action */}
                <section className="cta-section">
                    <div className="cta-container">
                        <h2 className="cta-title">¿Listo para comenzar a vender?</h2>
                        <p className="cta-description">
                            Unite a cientos de vendedores que ya confían en nuestra plataforma
                            para gestionar sus tiendas online de manera eficiente.
                        </p>
                        <div className="cta-actions">
                            <Link to="/tiendas" className="btn-primary-inverse">
                                <FaShoppingBag />
                                Explorar Tiendas
                            </Link>
                            <Link to="/login" className="btn-secundary-inverse">
                                {isAuthenticated ? <FaUser /> : <FaUserPlus />}
                                {isAuthenticated ? "Mi Cuenta" : "Crear Cuenta Gratis"}
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer_Landing />
        </div>
    );
}

export default Landing;
