import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useTienda } from "./TiendaContext";
import { agregarAlCarrito, obtenerCarrito, eliminarItemCarrito, actualizarCantidadCarrito } from "../services/carrito";
import { useNotifications } from "../../contexts/NotificationContext";

const CarritoContext = createContext(null);

/**
 * Hook personalizado para usar el contexto del carrito
 */
export function useCarrito() {
    const context = useContext(CarritoContext);
    if (!context) {
        throw new Error("useCarrito debe ser usado dentro de un CarritoProvider");
    }
    return context;
}

/**
 * Provider del contexto del carrito
 */
export function CarritoProvider({ children }) {
    const { isAuthenticated, usuario } = useAuth();
    const { tienda } = useTienda();
    const { error: showError, success: showSuccess } = useNotifications();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Cargar carrito al iniciar si el usuario está autenticado
    useEffect(() => {
        if (isAuthenticated && usuario?.dni && tienda?.nombreUrl) {
            cargarCarrito();
        } else {
            setItems([]);
        }
    }, [isAuthenticated, usuario?.dni, tienda?.nombreUrl]);

    /**
     * Carga el carrito del usuario desde la API
     */
    const cargarCarrito = async () => {
        if (!isAuthenticated || !usuario?.dni || !tienda?.nombreUrl) {
            return;
        }

        try {
            setLoading(true);
            const data = await obtenerCarrito(tienda.nombreUrl, usuario.dni);
            // Ordenar productos A-Z por nombre
            const itemsOrdenados = Array.isArray(data) 
                ? [...data].sort((a, b) => {
                    const nombreA = (a.nombreProducto || '').toLowerCase();
                    const nombreB = (b.nombreProducto || '').toLowerCase();
                    return nombreA.localeCompare(nombreB);
                })
                : [];
            setItems(itemsOrdenados);
        } catch (error) {
            console.error("Error cargando carrito:", error);
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Agrega un producto al carrito
     */
    const agregarProducto = async (productoId, cantidad = 1) => {
        if (!isAuthenticated || !usuario?.dni || !tienda?.nombreUrl) {
            showError("Error", "Debes iniciar sesión para agregar productos al carrito");
            return;
        }

        // Validar que el usuario no sea el vendedor de la tienda
        if (tienda?.vendedorDni && usuario.dni === tienda.vendedorDni) {
            showError("Acción no permitida", "No puedes comprar productos de tu propia tienda");
            return;
        }

        try {
            await agregarAlCarrito(tienda.nombreUrl, {
                usuarioDni: usuario.dni,
                productoId: productoId,
                cantidad: cantidad
            });
            
            // Recargar el carrito
            await cargarCarrito();
            showSuccess("Éxito", "Producto agregado al carrito");
        } catch (error) {
            console.error("Error agregando al carrito:", error);
            const mensaje = error.response?.data?.message || "Error al agregar producto al carrito";
            showError("Error", mensaje);
        }
    };

    /**
     * Elimina un item del carrito
     */
    const eliminarItem = async (idItem) => {
        if (!tienda?.nombreUrl) return;

        try {
            await eliminarItemCarrito(tienda.nombreUrl, idItem);
            await cargarCarrito();
            showSuccess("Éxito", "Producto eliminado del carrito");
        } catch (error) {
            console.error("Error eliminando item:", error);
            showError("Error", "Error al eliminar producto");
        }
    };

    /**
     * Actualiza la cantidad de un item del carrito
     */
    const actualizarCantidad = async (idItem, productoId, nuevaCantidad) => {
        if (!isAuthenticated || !usuario?.dni || !tienda?.nombreUrl) {
            return;
        }

        // Validar que la cantidad sea válida
        if (!nuevaCantidad || nuevaCantidad < 1) {
            showError("Error", "La cantidad debe ser al menos 1");
            // No recargar el carrito, solo mostrar el error
            return;
        }

        try {
            await actualizarCantidadCarrito(
                tienda.nombreUrl,
                idItem,
                productoId,
                usuario.dni,
                nuevaCantidad
            );
            await cargarCarrito();
        } catch (error) {
            console.error("Error actualizando cantidad:", error);
            const mensaje = error.response?.data?.message || "Error al actualizar la cantidad";
            showError("Error", mensaje);
            // No recargar el carrito automáticamente, dejar que el componente maneje la restauración
            throw error; // Lanzar el error para que el componente pueda manejarlo
        }
    };

    /**
     * Calcula el total del carrito
     */
    const calcularTotal = () => {
        return items.reduce((total, item) => {
            // El backend puede enviar precioUnitario o precio, y también puede enviar subtotal
            const precio = item.precioUnitario || item.precio || 0;
            const subtotal = item.subtotal || (precio * (item.cantidad || 1));
            return total + subtotal;
        }, 0);
    };

    /**
     * Obtiene la cantidad total de items en el carrito
     */
    const cantidadTotal = items.reduce((total, item) => total + item.cantidad, 0);

    return (
        <CarritoContext.Provider
            value={{
                items,
                loading,
                agregarProducto,
                eliminarItem,
                actualizarCantidad,
                cargarCarrito,
                calcularTotal,
                cantidadTotal
            }}
        >
            {children}
        </CarritoContext.Provider>
    );
}

