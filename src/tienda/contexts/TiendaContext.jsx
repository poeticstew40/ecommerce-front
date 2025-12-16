import { createContext, useContext, useState, useEffect } from "react";
import { getTiendaBySlug } from "../services/tiendas";

/**
 * Contexto de Tienda
 * 
 * Proporciona el estado y funciones relacionadas con la tienda actual.
 * Almacena el nombreTienda (slug) y la información completa de la tienda.
 * 
 * Funcionalidades:
 * - Almacenar el nombreTienda actual (slug)
 * - Cargar información de la tienda desde la API
 * - Proporcionar estado de carga y errores
 * - Actualizar la tienda cuando cambia el slug
 */

const TiendaContext = createContext(null);

/**
 * Hook personalizado para usar el contexto de tienda
 * @returns {Object} Objeto con el estado y funciones de la tienda
 * @throws {Error} Si se usa fuera del TiendaProvider
 */
export function useTienda() {
    const context = useContext(TiendaContext);
    if (!context) {
        throw new Error("useTienda debe ser usado dentro de un TiendaProvider");
    }
    return context;
}

/**
 * Provider del contexto de tienda
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Componentes hijos
 * @param {string} props.nombreTienda - El slug de la tienda actual (obtenido de la URL)
 */
export function TiendaProvider({ children, nombreTienda }) {
    // Estado de la información de la tienda
    const [tienda, setTienda] = useState(null);
    
    // Estado de carga
    const [loading, setLoading] = useState(true);
    
    // Estado de errores
    const [error, setError] = useState(null);

    /**
     * Carga la información de la tienda desde la API
     * @param {string} slug - El slug de la tienda a cargar
     */
    const cargarTienda = async (slug) => {
        if (!slug) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const datosTienda = await getTiendaBySlug(slug);
            setTienda(datosTienda);
        } catch (err) {
            console.error("Error cargando tienda:", err);
            setError(
                err.response?.status === 404
                    ? "Tienda no encontrada"
                    : `Error al cargar la tienda: ${err.message}`
            );
            setTienda(null);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Efecto que carga la tienda cuando cambia el nombreTienda
     */
    useEffect(() => {
        if (nombreTienda) {
            cargarTienda(nombreTienda);
        } else {
            setTienda(null);
            setLoading(false);
            setError(null);
        }
    }, [nombreTienda]);

    /**
     * Función para recargar la tienda manualmente
     */
    const recargarTienda = () => {
        if (nombreTienda) {
            cargarTienda(nombreTienda);
        }
    };

    // Valor del contexto
    const value = {
        // Estado
        nombreTienda, // Slug de la tienda actual
        tienda, // Información completa de la tienda
        loading, // Estado de carga
        error, // Mensaje de error si existe

        // Funciones
        recargarTienda, // Función para recargar la tienda
    };

    return (
        <TiendaContext.Provider value={value}>
            {children}
        </TiendaContext.Provider>
    );
}

export default TiendaContext;

