import { Link, useLocation } from "react-router-dom";
import "../styles/Footer_Landing.css";
import { LuExternalLink } from "react-icons/lu";

/**
 * Componente Landing
 * * Página inicial de la aplicación.
 * Muestra información general
 * y permite navegar a las tiendas o iniciar sesión.
 * * Diseño basado en landing
 */

function Footer_Landing() {
    const location = useLocation();
    const isLandingPage = location.pathname === "/";
    const isTiendasPage = location.pathname === "/tiendas";

    const scrollToFeatures = (e) => {
        // Si no estamos en la landing, no prevenimos el default para que navegue, 
        // pero aquí manejamos la lógica condicional en el render
        e.preventDefault();
        const featuresSection = document.getElementById("features");
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <>
        {/* Footer */}
            <div className="footer">
                <div className="footer-container">
                    <div className="footer-section">
                        <h3>E-commerce Multitienda</h3>
                        <p>
                            La solución integral para crear y gestionar tu tienda online.
                            Diseñada para vendedores y para compradores.
                        </p>
                        {!isLandingPage && !isTiendasPage && (
                            <Link to="/" className="link-to-landing">
                                <LuExternalLink /> Volver a la página principal
                            </Link>
                        )}
                    </div>
              
                    <div className="footer-section">
                        <h3>Producto</h3>
                        {/* Lógica condicional: Scroll si es landing, Link si es otra página */}
                        {isLandingPage ? (
                            <p><a href="#features" onClick={scrollToFeatures}>Características</a></p>
                        ) : (
                            <p><Link to="/info/caracteristicas">Características</Link></p>
                        )}
                        <p><Link to="/info/precios">Precios</Link></p>
                    </div>
                    <div className="footer-section">
                        <h3>Soporte</h3>
                        <p><Link to="/info/ayuda">Centro de Ayuda</Link></p>
                        <p><Link to="/info/contacto">Contacto</Link></p>
                    </div>
                    <div className="footer-section">
                        <h3>Legal</h3>
                        <p><Link to="/info/privacidad">Política de Privacidad</Link></p>
                        <p><Link to="/info/terminos">Términos de Servicio</Link></p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 TradioGlobal | E-commerce Multitienda. Todos los derechos reservados.</p>
                </div>
            </div>
        </>
    );
}

export default Footer_Landing;