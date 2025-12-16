import { Link, useParams, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTienda } from "../contexts/TiendaContext";
import Nav_Categories from "./Nav_Category";

import "../styles/Header.css";

import { MdOutlineShoppingCart } from "react-icons/md";
import { VscAccount } from "react-icons/vsc";
import { FaSearch } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";

/**
* Componente Header
* * Renderiza el encabezado principal de la aplicación con navegación.
* Detecta automáticamente si está en una tienda para usar el login correcto.
*/

function Header() {
    const { nombreTienda } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { isAuthenticated, userType, tiendaUsuario, usuario } = useAuth();
    const { tienda } = useTienda();
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    
    // Si no hay nombreTienda en params, intentar extraerlo de la URL como fallback
    const tiendaSlug = nombreTienda || location.pathname.split("/")[2];
    const loginPath = tiendaSlug ? `/tienda/${tiendaSlug}/login` : "/login";
    
    // --- LÓGICA CORREGIDA DEL BOTÓN MI CUENTA ---
    let cuentaPath = loginPath;

    if (isAuthenticated) {
        // Caso 1: Es vendedor Y tiene una tienda creada -> Va al Admin
        if (userType === 'vendedor' && tiendaUsuario && tiendaUsuario.nombreUrl) {
            const adminSlug = tiendaUsuario.nombreUrl;
            cuentaPath = `/admin/${adminSlug}/dashboard`;
        } 
        // Caso 2: Es comprador O vendedor sin tienda -> Va al Perfil de Usuario
        else {
            cuentaPath = "/perfil/compras";
        }
    }

    // Obtener el nombre de la tienda (nombreFantasia) o usar un valor por defecto
    const nombreTiendaDisplay = tienda?.nombreFantasia || "TradioGlobal";
    
    // Obtener el nombre del usuario para mostrar
    const nombreUsuario = usuario?.nombre && usuario?.apellido 
        ? `${usuario.nombre} ${usuario.apellido}`
        : usuario?.nombre || usuario?.email || "Mi Cuenta";

    // Sincronizar el término de búsqueda con la URL
    useEffect(() => {
        const q = searchParams.get('q') || '';
        setTerminoBusqueda(q);
    }, [searchParams]);

    // Manejar búsqueda
    const handleBusqueda = (e) => {
        e.preventDefault();
        if (tiendaSlug && terminoBusqueda.trim() !== '') {
            navigate(`/tienda/${tiendaSlug}/catalogo?q=${encodeURIComponent(terminoBusqueda.trim())}`);
        }
    };

    // Limpiar búsqueda
    const handleLimpiarBusqueda = () => {
        setTerminoBusqueda('');
        if (location.pathname.includes('/catalogo') && tiendaSlug) {
            navigate(`/tienda/${tiendaSlug}/catalogo`);
        }
    };

    return (
        <>
            {/* Contenedor principal del header */}
            <div className="header-all-contenedor">
                <header className="header">

                    {/* Logo de la aplicación con enlace a la página principal */}
                    <Link to={tiendaSlug ? `/tienda/${tiendaSlug}/home` : "/"} className="link-logo">
                        <div className="header-logo">
                            {tienda?.logo ? (
                                <div className="header-logo-container">
                                    <img 
                                        src={tienda.logo} 
                                        alt={nombreTiendaDisplay}
                                        className="header-logo-img"
                                    />
                                    <h1 className="header-logo-text">{nombreTiendaDisplay}</h1>
                                </div>
                            ) : (
                                <h1 className="header-logo-text">{nombreTiendaDisplay}</h1>
                            )}
                        </div>
                    </Link>

                    {/* Sección central: Barra de búsqueda de productos */}
                    <div className="header-search">
                        <form className="search-box" onSubmit={handleBusqueda}>
                            <FaSearch className="lupa"/>
                            <p style={{ margin: "0 3px", fontSize: "1.5rem", fontWeight: "500", color: "var(--green-900)" }}>|</p>
                            <input 
                                type="text" 
                                className="buscador" 
                                placeholder="Buscar productos..."
                                aria-label="Buscar productos"
                                value={terminoBusqueda}
                                onChange={(e) => setTerminoBusqueda(e.target.value)}
                            />
                            {terminoBusqueda && (
                                <button
                                    type="button"
                                    onClick={handleLimpiarBusqueda}
                                    className="search-clear-btn"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </form>
                    </div>

                    {/* Sección derecha: Enlaces a cuenta y carrito */}
                    <div className="header-right">
                        {/* Enlace a la página de login/inicio de sesión */}
                        {!isAuthenticated ? (
                            <Link 
                                to={loginPath} 
                                className="link-login"
                                state={{ from: location.pathname }}
                            >
                                <div className="cuenta-box">
                                    <VscAccount className="logo-cuenta" size={24}/>
                                    <span>Iniciar Sesión</span>
                                </div>
                            </Link>
                        ) : (
                            <Link to={cuentaPath} className="link-login">
                                <div className="cuenta-box">
                                    <VscAccount className="logo-cuenta" size={26}/>
                                    <span>{nombreUsuario}</span>
                                </div>
                            </Link>
                        )}

                        {/* Enlace al carrito de compras */}
                        <Link 
                            to={tiendaSlug ? `/tienda/${tiendaSlug}/carrito` : "/"} 
                            className="link-carrito"
                        >
                            <div className="cart-icon">
                                <MdOutlineShoppingCart size={25}/>
                            </div>
                        </Link>
                    </div>
                </header>
            </div>

            {/* Componente de navegación por categorías */}
            <Nav_Categories />
        </>
    );
};
export default Header;