import { useEffect } from "react"; // <--- Importamos useEffect
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../tienda/contexts/AuthContext";
import Footer_Landing from "../components/Footer_Landing";
import { FaStore, FaUser, FaSignOutAlt, FaSignInAlt, FaArrowLeft } from "react-icons/fa";
import "../styles/InfoPages.css"; 
import "../../MainStyles.css";
import "../styles/Landing.css"; 

// Diccionario de contenido
const contenidoMock = {
    "acerca": {
        titulo: "Acerca de TradioGlobal",
        texto: "TradioGlobal es una plataforma de e-commerce multitienda diseñada para conectar vendedores y compradores en un entorno digital seguro y eficiente. Nuestra misión es democratizar el comercio electrónico, ofreciendo herramientas accesibles tanto para emprendedores que inician su negocio online como para compradores que buscan productos de calidad.",
        detalles: [
            "Fundada con la visión de simplificar el comercio electrónico para todos.",
            "Plataforma 100% en español, diseñada para el mercado latinoamericano.",
            "Equipo comprometido con la innovación y el soporte continuo.",
            "Tecnología de última generación para garantizar seguridad y rendimiento."
        ],
        contenidoAdicional: "Desde nuestros inicios, nos hemos enfocado en crear una experiencia de usuario excepcional. Trabajamos constantemente en mejorar nuestras funcionalidades, escuchando las necesidades de nuestros usuarios y adaptándonos a las tendencias del mercado digital."
    },
    "caracteristicas": {
        titulo: "Características del Producto",
        texto: "Nuestra plataforma multitienda ofrece gestión de inventario en tiempo real, pasarela de pagos integrada con Mercado Pago, y un panel administrativo intuitivo tanto para vendedores como para compradores. Diseñado para escalar tu negocio digital.",
        detalles: [
            "Gestión de inventario en tiempo real con actualizaciones instantáneas.",
            "Integración completa con Mercado Pago para transacciones seguras.",
            "Panel de administración intuitivo para vendedores y compradores.",
            "Sistema de categorías y búsqueda avanzada para facilitar la navegación.",
            "Carrito de compras inteligente con gestión de cantidades y precios dinámicos.",
            "Sistema de autenticación seguro con JWT y protección de datos."
        ],
        contenidoAdicional: "Nuestras características están diseñadas pensando en la usabilidad y la eficiencia. Cada herramienta ha sido probada y optimizada para ofrecer la mejor experiencia posible, tanto para quienes venden como para quienes compran."
    },
    "precios": {
        titulo: "Planes y Precios",
        texto: "Actualmente ofrecemos un plan gratuito para comenzar. Próximamente lanzaremos planes Premium con menores comisiones por venta y herramientas avanzadas de marketing y analítica.",
        detalles: [
            "Plan Gratuito: Ideal para comenzar, sin costos iniciales ni mensualidades.",
            "Comisiones competitivas por transacción para mantener la plataforma accesible.",
            "Próximamente: Plan Premium con comisiones reducidas y herramientas avanzadas.",
            "Sin costos ocultos ni tarifas sorpresa. Transparencia total en nuestros precios."
        ],
        contenidoAdicional: "Creemos que el comercio electrónico debe ser accesible para todos. Por eso, nuestro plan gratuito te permite comenzar a vender sin inversión inicial. A medida que tu negocio crezca, podrás acceder a planes premium con beneficios adicionales."
    },
    "ayuda": {
        titulo: "Centro de Ayuda",
        texto: "Si tienes problemas con tu cuenta, pagos o gestión de productos, por favor contáctanos. Nuestro equipo de soporte está disponible de Lunes a Viernes de 9hs a 18hs.",
        detalles: [
            "Horario de atención: Lunes a Viernes de 9:00 a 18:00 horas.",
            "Respuesta garantizada en menos de 24 horas hábiles.",
            "Soporte técnico especializado para resolver cualquier inconveniente.",
            "Base de conocimientos con guías paso a paso para funciones comunes.",
            "Asistencia para configuración inicial de tu tienda."
        ],
        contenidoAdicional: "Nuestro equipo de soporte está capacitado para ayudarte con cualquier consulta relacionada con la plataforma. Ya sea que necesites ayuda con la configuración de tu tienda, problemas con pagos, o cualquier otra inquietud, estamos aquí para asistirte."
    },
    "contacto": {
        titulo: "Contacto",
        texto: "Puedes escribirnos a soporte@tradioglobal.com o visitarnos en nuestras oficinas centrales. Estamos aquí para escuchar tus sugerencias y resolver tus dudas.",
        detalles: [
            "Email: soporte@tradioglobal.com",
            "Horario de atención: Lunes a Viernes de 9:00 a 18:00 horas.",
            "Respondemos todas las consultas en menos de 24 horas hábiles.",
            "Aceptamos sugerencias y feedback para mejorar continuamente la plataforma."
        ],
        contenidoAdicional: "Tu opinión es muy valiosa para nosotros. Si tienes sugerencias, comentarios o simplemente quieres ponerte en contacto, no dudes en escribirnos. Estamos comprometidos con brindar el mejor servicio posible y tu feedback nos ayuda a mejorar día a día."
    },
    "privacidad": {
        titulo: "Política de Privacidad",
        texto: "En TradioGlobal nos tomamos muy en serio la seguridad de tus datos. Utilizamos encriptación de extremo a extremo y no compartimos tu información personal con terceros sin tu consentimiento explícito. Cumplimos con todas las normativas de protección de datos vigentes.",
        detalles: [
            "Encriptación de extremo a extremo para proteger tus datos personales.",
            "No compartimos información con terceros sin tu consentimiento explícito.",
            "Cumplimiento total con normativas de protección de datos vigentes.",
            "Acceso limitado a tu información solo para personal autorizado.",
            "Derecho a solicitar eliminación de tus datos personales en cualquier momento."
        ],
        contenidoAdicional: "La privacidad y seguridad de tus datos es nuestra prioridad. Implementamos las mejores prácticas de seguridad informática y revisamos constantemente nuestros protocolos para garantizar que tu información esté siempre protegida."
    },
    "terminos": {
        titulo: "Términos de Servicio",
        texto: "Al utilizar nuestra plataforma, aceptas operar de buena fe. Está prohibida la venta de artículos ilegales. TradioGlobal actúa como intermediario y no se responsabiliza por la calidad final de los productos ofrecidos por terceros, aunque ofrecemos mecanismos de reembolso.",
        detalles: [
            "Prohibida la venta de artículos ilegales o que violen derechos de autor.",
            "TradioGlobal actúa como intermediario entre vendedores y compradores.",
            "Mecanismos de reembolso disponibles para proteger a los compradores.",
            "Los vendedores son responsables de la calidad y descripción de sus productos.",
            "Resolución de disputas mediante nuestro sistema de soporte."
        ],
        contenidoAdicional: "Al utilizar nuestra plataforma, aceptas estos términos y te comprometes a operar de manera ética y legal. Trabajamos continuamente para mantener un entorno seguro y confiable para todos nuestros usuarios."
    }
};

function InfoPages() {
    const { pagina } = useParams();
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    // Efecto para hacer scroll arriba cada vez que cambia la página
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pagina]); // Se ejecuta cuando cambia el parámetro 'pagina'

    const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
    };
    
    // Si la página no existe en el diccionario, mostramos un default
    const info = contenidoMock[pagina] || {
        titulo: "Página no encontrada",
        texto: "Lo sentimos, la sección que buscas no está disponible."
    };

    return (
        // Usamos la clase 'landing-page' para heredar estilos base si los hubiera
        <div className="landing-page info-page-wrapper">
            
            {/* --- HEADER ESTILO LANDING (Copiado y adaptado de Landing.jsx) --- */}
            <header className="landing-header">
                <nav className="landing-nav">
                    <Link to="/" className="landing-logo">
                        <FaStore />
                        <h1>TradioGlobal</h1>
                    </Link>
                    <div className="landing-nav-container">
                        {/* Links de navegación simples para volver a secciones de la landing */}
                        <div className="landing-nav-links-container">
                            <Link to="/" className="landing-nav-link">Inicio</Link>
                            <Link to="/tiendas" className="landing-nav-link">Tiendas</Link>
                        </div>
                        <div className="landing-nav-actions">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/perfil/compras" className="btn-primary-header">
                                        <FaUser /> Mi Cuenta
                                    </Link>
                                    <button onClick={handleLogout} className="btn-logout">
                                        <FaSignOutAlt /> Cerrar Sesión
                                    </button>
                                </>
                            ) : (
                                <Link to="/login" className="btn-primary-header">
                                    <FaSignInAlt /> Iniciar Sesión
                                </Link>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className="info-main-section">
                <div className="info-container">
                    <Link to="/" className="info-back-link">
                        <FaArrowLeft /> Volver al inicio
                    </Link>

                    <div className="info-card">
                        <h1 className="info-title">{info.titulo}</h1>
                        <div className="info-divider"></div>
                        
                        <div className="info-content-body">
                            <p className="info-highlight">
                                {info.texto}
                            </p>
                            
                            {info.detalles && info.detalles.length > 0 && (
                                <>
                                    <h3>Información Importante</h3>
                                    <ul>
                                        {info.detalles.map((detalle, index) => (
                                            <li key={index}>{detalle}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            
                            {info.contenidoAdicional && (
                                <p>
                                    {info.contenidoAdicional}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer_Landing />
        </div>
    );
}

export default InfoPages;