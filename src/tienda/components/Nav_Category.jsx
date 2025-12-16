import { useEffect, useState } from "react";
import { getCategoriasByTienda } from "../services/categorias";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import "../styles/Nav_Category.css";
import "../styles/Header.css";
import { FaBars } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";

/**
 * Convierte un nombre de categoría a un slug para la URL
 */
function categoriaToSlug(nombre) {
    return nombre
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

/**
* Componente Nav_Categories
*/
function Nav_Categories() {
    const { nombreTienda } = useParams();
    const [categorias, setCategorias] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [error, setError] = useState(null);

    const ordenarCategorias = (categorias) => {
        const otras = categorias.filter(cat => 
            cat.nombre.toLowerCase().trim() === 'otros'
        );
        const resto = categorias.filter(cat => 
            cat.nombre.toLowerCase().trim() !== 'otros'
        );
        return [...resto, ...otras];
    };

    useEffect(() => {
        if (!nombreTienda) {
            setError("Nombre de tienda no disponible");
            return;
        }

        getCategoriasByTienda(nombreTienda)
            .then(data => {
                let categoriasData = [];
                if (Array.isArray(data)) {
                    categoriasData = data;
                } else if (data && Array.isArray(data.content)) {
                    categoriasData = data.content;
                }
                setCategorias(ordenarCategorias(categoriasData));
            })
            .catch(err => {
                console.error("Error cargando categorías:", err);
                setError("Error cargando categorías");
            });
    }, [nombreTienda]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Función para cerrar el menú explícitamente
    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <div className="main-nav"> 
            <div className="nav-cont-categ">

                {/* Sección izquierda: Botón de menú hamburguesa */}
                {/* FIX: Quitamos onMouseEnter/Leave y usamos onClick para móvil */}
                <div className="nav-menu">
                    <div 
                        className="faBar-icon" 
                        onClick={toggleMenu} // Evento click funciona en web y móvil
                    >
                        <FaBars size={20}/>
                        <span>Categorías</span>
                    </div>
                    
                    {/* Menú desplegable */}
                    {isMenuOpen && (
                        <>
                            {/* Overlay transparente para cerrar al hacer clic afuera */}
                            <div className="menu-overlay" onClick={closeMenu}></div>
                            
                            <div className="menu-desplegable">
                                <Link 
                                    to={`/tienda/${nombreTienda}/catalogo`} 
                                    className="menu-item" 
                                    onClick={closeMenu}
                                >
                                    Todas las categorías <FaChevronRight style={{fontSize: '0.8em', marginLeft: 'auto'}}/>
                                </Link>
                                
                                {categorias.map((categoria) => (
                                    <Link 
                                        key={categoria.id} 
                                        to={`/tienda/${nombreTienda}/categoria/${categoriaToSlug(categoria.nombre)}`}
                                        className="menu-item categoria"
                                        onClick={closeMenu}
                                    >
                                        {categoria.nombre}
                                    </Link>
                                ))}

                                {error && <p className="menu-error">{error}</p>}
                            </div>
                        </>
                    )}
                </div>

                {/* Renderiza las categorías horizontales (Se ocultarán en móvil vía CSS) */}
                <div className="desktop-categories">
                    {categorias.map((cat) => (
                        <Link 
                            key={cat.id} 
                            to={`/tienda/${nombreTienda}/categoria/${categoriaToSlug(cat.nombre)}`}
                            className="categoria-link"
                        >
                            <span className="categoria-item">{cat.nombre}</span>
                        </Link>
                    ))} 
                </div>
            </div>
        </div>
    );
}
export default Nav_Categories;