import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCarrito } from "../contexts/CarritoContext";
import { useNotifications } from "../../contexts/NotificationContext";
import { FaTrashCan } from "react-icons/fa6";
import { FaShoppingBasket } from "react-icons/fa";

import Footer_Landing from "../../landing/components/Footer_Landing.jsx";
import Header from "../components/Header.jsx";

import "../styles/Carrito.css";

/**
 * Función para acortar el nombre del producto
 * @param {string} nombre - Nombre completo del producto
 * @param {number} maxLength - Longitud máxima (por defecto 25)
 * @returns {string} Nombre acortado con "..."
 */
function acortarNombre(nombre, maxLength = 25) {
    if (!nombre || nombre.length <= maxLength) {
        return nombre;
    }
    return nombre.substring(0, maxLength - 3) + "...";
}

/**
 * Función para formatear precios con puntos como separadores de miles
 * @param {number} precio - Precio a formatear
 * @returns {string} Precio formateado (ej: $1.000, $10.000)
 */
function formatearPrecio(precio) {
    const precioRedondeado = Math.round(precio || 0);
    return precioRedondeado.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Función para obtener la imagen del producto
 */
function obtenerImagen(item) {
    if (item.imagenProducto && item.imagenProducto.trim() !== "") {
        return item.imagenProducto;
    }
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";
}

/**
* Componente Carrito
* 
* Muestra la página del carrito de compras del usuario.
* Renderiza una lista de productos agregados al carrito y un botón
* para realizar la compra.
*/

function Carrito() {
    const { nombreTienda } = useParams();
    const navigate = useNavigate();
    const { items, loading, eliminarItem, actualizarCantidad, calcularTotal } = useCarrito();
    const { isAuthenticated } = useAuth();
    const { error: showError, success: showSuccess } = useNotifications();
    
    // Estado local para las cantidades de cada item (para actualización visual inmediata)
    const [cantidadesLocales, setCantidadesLocales] = useState({});
    const timersRef = useRef({});

    // Sincronizar cantidades locales con items del carrito
    useEffect(() => {
        const nuevasCantidades = {};
        items.forEach(item => {
            nuevasCantidades[item.idItem] = item.cantidad;
        });
        setCantidadesLocales(nuevasCantidades);
    }, [items]);

    // Función para manejar la eliminación con confirmación
    const handleEliminarItem = async (idItem) => {
        if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;

        try {
            await eliminarItem(idItem);
            showSuccess("Eliminado", "Producto eliminado del carrito");
        } catch (error) {
            console.error("Error al eliminar item:", error);
            showError("Error", "No se pudo eliminar el producto.");
        }
    };

    // Si no está autenticado, mostrar mensaje
    if (!isAuthenticated) {
        return (
            <div>
                <Header />
                <div className="main-carrito" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <h2>Inicia sesión para ver tu carrito</h2>
                    <Link 
                        to={`/tienda/${nombreTienda}/login`} 
                        className="cart-btn" 
                        style={{ maxWidth: '200px', marginTop: '20px', textDecoration: 'none', display: 'inline-block' }}
                    >
                        Iniciar Sesión
                    </Link>
                </div>
                <Footer_Landing />
            </div>
        );
    }

    const total = calcularTotal();

    const handleCheckout = () => {
        // Validar que el carrito no esté vacío antes de proceder
        if (items.length === 0) {
            showError("Carrito vacío", "Agrega productos antes de realizar la compra.");
            return;
        }
        
        if (nombreTienda) {
            navigate(`/tienda/${nombreTienda}/checkout`);
        }
    };

    // Actualizar cantidad local inmediatamente
    const handleCantidadInputChange = (idItem, valor) => {
        setCantidadesLocales(prev => ({
            ...prev,
            [idItem]: valor
        }));
    };

    // Aplicar cambio de cantidad al backend (con debounce)
    const handleCantidadChange = async (idItem, productoId, nuevaCantidad) => {
        // Limpiar timer anterior si existe
        if (timersRef.current[idItem]) {
            clearTimeout(timersRef.current[idItem]);
        }

        // Validar que sea un número válido
        const cantidad = nuevaCantidad === '' ? null : parseInt(nuevaCantidad, 10);
        
        if (nuevaCantidad === '' || isNaN(cantidad)) {
            // Si está vacío o no es un número, no hacer nada todavía
            return;
        }

        if (cantidad < 1) {
            // Restaurar valor anterior si es menor a 1
            setCantidadesLocales(prev => ({
                ...prev,
                [idItem]: items.find(i => i.idItem === idItem)?.cantidad || 1
            }));
            return;
        }

        // Usar debounce para esperar a que el usuario termine de escribir
        timersRef.current[idItem] = setTimeout(async () => {
            try {
                await actualizarCantidad(idItem, productoId, cantidad);
            } catch (error) {
                // Si hay error, restaurar el valor anterior
                const itemOriginal = items.find(i => i.idItem === idItem);
                if (itemOriginal) {
                    setCantidadesLocales(prev => ({
                        ...prev,
                        [idItem]: itemOriginal.cantidad
                    }));
                }
            }
        }, 500); // Esperar 500ms después de que el usuario deje de escribir
    };

    const handleIncrement = async (idItem, productoId, cantidadActual) => {
        const nuevaCantidad = cantidadActual + 1;
        setCantidadesLocales(prev => ({
            ...prev,
            [idItem]: nuevaCantidad
        }));
        await actualizarCantidad(idItem, productoId, nuevaCantidad);
    };

    const handleDecrement = async (idItem, productoId, cantidadActual) => {
        if (cantidadActual > 1) {
            const nuevaCantidad = cantidadActual - 1;
            setCantidadesLocales(prev => ({
                ...prev,
                [idItem]: nuevaCantidad
            }));
            await actualizarCantidad(idItem, productoId, nuevaCantidad);
        }
    };

    const handleCantidadBlur = async (idItem, productoId, valor) => {
        // Limpiar timer si existe
        if (timersRef.current[idItem]) {
            clearTimeout(timersRef.current[idItem]);
            delete timersRef.current[idItem];
        }

        const cantidad = valor === '' ? null : parseInt(valor, 10);
        
        if (valor === '' || isNaN(cantidad) || cantidad < 1) {
            // Restaurar valor original si es inválido
            const itemOriginal = items.find(i => i.idItem === idItem);
            if (itemOriginal) {
                setCantidadesLocales(prev => ({
                    ...prev,
                    [idItem]: itemOriginal.cantidad
                }));
            }
            return;
        }

        // Aplicar cambio inmediatamente al hacer blur
        try {
            await actualizarCantidad(idItem, productoId, cantidad);
        } catch (error) {
            // Si hay error, restaurar el valor anterior
            const itemOriginal = items.find(i => i.idItem === idItem);
            if (itemOriginal) {
                setCantidadesLocales(prev => ({
                    ...prev,
                    [idItem]: itemOriginal.cantidad
                }));
            }
        }
    };

    return (
        <div>
            {/* Header de navegación de la aplicación */}
            <Header />

            {/* Sección de los items del carrito */}
            <div className="main-carrito" style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "" }}>
                <div className="items-cart-cont" style={{ margin: "0 auto", padding: "0" }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Tu Carrito</h1>
                    
                    {loading ? (
                        <div className="items-cart" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <p>Cargando carrito...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="items-cart" style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "50px" }}>
                            <h2>Tu carrito está vacío</h2>
                            <p>Agrega productos para continuar.</p>
                        </div>
                    ) : (
                        items.map((item) => {
                            const precio = item.precioUnitario || item.precio || 0;
                            const subtotal = item.subtotal || (precio * (item.cantidad || 1));
                            
                            return (
                                <div key={item.idItem} className="items-cart">
                                    <img 
                                        src={obtenerImagen(item)} 
                                        alt={item.nombreProducto}
                                        onError={(e) => {
                                            if (!e.target.dataset.fallback) {
                                                e.target.dataset.fallback = "true";
                                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ddd' width='200' height='200'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='14' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin imagen%3C/text%3E%3C/svg%3E";
                                            }
                                        }}
                                    />
                                    <div className="prod-cart-container">
                                        <div className="prod-cart-data-left">
                                            <h3 className="prod-cart-nombre">{item.nombreProducto}</h3>
                                            <div className="cantidad-controls">
                                                <label htmlFor={`cantidad-${item.idItem}`} className="cantidad-label">
                                                    Cantidad:
                                                </label>
                                                <div className="cantidad-input-group">
                                                    <button 
                                                        className="cantidad-btn cantidad-btn-decrement"
                                                        onClick={() => handleDecrement(item.idItem, item.productoId, item.cantidad)}
                                                        disabled={loading || item.cantidad <= 1}
                                                        type="button"
                                                    >
                                                        −
                                                    </button>
                                                    <input
                                                        id={`cantidad-${item.idItem}`}
                                                        type="number"
                                                        min="1"
                                                        value={cantidadesLocales[item.idItem] ?? item.cantidad}
                                                        onChange={(e) => {
                                                            handleCantidadInputChange(item.idItem, e.target.value);
                                                            handleCantidadChange(item.idItem, item.productoId, e.target.value);
                                                        }}
                                                        onBlur={(e) => {
                                                            handleCantidadBlur(item.idItem, item.productoId, e.target.value);
                                                        }}
                                                        required
                                                        disabled={loading}
                                                        className="prod-cart-cantidad-input"
                                                    />
                                                    <button 
                                                        className="cantidad-btn cantidad-btn-increment"
                                                        onClick={() => handleIncrement(item.idItem, item.productoId, item.cantidad)}
                                                        disabled={loading}
                                                        type="button"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="prod-cart-data-right">
                                            <p className="prod-cart-precio">${formatearPrecio(precio)}</p>
                                            <p className="prod-cart-subtotal">
                                                Subtotal: ${formatearPrecio(subtotal)}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleEliminarItem(item.idItem)}
                                        style={{
                                            padding: "8px 12px",
                                            backgroundColor: "var(--red-500)",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "0 var(--border-radius-lg) var(--border-radius-lg) 0",
                                            cursor: "pointer",
                                            fontSize: "17px",
                                        }}
                                    >
                                        <FaTrashCan />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>  
            
                {/* Sección de confirmación y botón para realizar compra */}
                {items.length > 0 && (
                    <div className="cart-confirm">
                        <h2 style={{ marginBottom: "20px" }}>Resumen de compra</h2>
                        
                        <div style={{ marginBottom: "20px" }}>
                            {items.map((item) => {
                                const precio = item.precioUnitario || item.precio || 0;
                                const subtotal = item.subtotal || (precio * (item.cantidad || 1));
                                const cantidad = item.cantidad || 1;
                                
                                return (
                                    <div 
                                        key={item.idItem}
                                        className="cart-item-summary"
                                    >
                                        <span className="cart-item-summary-name">
                                            {cantidad > 1 ? `${cantidad}x | ` : ""}{acortarNombre(item.nombreProducto)}
                                        </span>
                                        <span className="cart-item-summary-price">
                                            ${formatearPrecio(subtotal)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="cart-total">
                            <span>Total</span>
                            <span>${formatearPrecio(total)}</span>
                        </div>

                        <button 
                            className="cart-btn"
                            onClick={handleCheckout}
                            disabled={items.length === 0}
                            style={{ 
                                marginTop: "20px",
                                opacity: items.length === 0 ? 0.6 : 1,
                                cursor: items.length === 0 ? "not-allowed" : "pointer"
                            }}
                        >
                            Confirmar compra
                        </button>
                        
                        <Link 
                            to={`/tienda/${nombreTienda}/catalogo`} 
                            style={{ 
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center", 
                                marginTop: "15px", 
                                fontSize: "0.9rem", 
                                color: "#666",
                                gap: "5px",
                                textDecoration: "none",
                                width: "fit-content",
                                margin: "0 auto",
                            }}
                        >
                            <FaShoppingBasket /> Seguir comprando
                        </Link>
                    </div>
                )}
            </div>

            {/* Footer de la página */}
            <Footer_Landing />
        </div>
    );
};

export default Carrito;
