import { useParams, useLocation } from "react-router-dom";
import { TiendaProvider } from "./TiendaContext";

/**
 * Componente Wrapper para el TiendaProvider
 * 
 * Este componente obtiene el nombreTienda de la URL y lo pasa al TiendaProvider.
 * Detecta el nombreTienda de dos formas:
 * 1. Desde los parámetros de la ruta (cuando la ruta es /tienda/:nombreTienda/...)
 * 2. Desde la ubicación actual (para compatibilidad con rutas antiguas)
 * 
 * @param {React.ReactNode} children - Componentes hijos que necesitan acceso al contexto de tienda
 */
export function TiendaWrapper({ children }) {
    // Intenta obtener el nombreTienda de los parámetros de la ruta
    const { nombreTienda } = useParams();
    
    // Si no está en los params, intenta extraerlo de la URL
    const location = useLocation();
    let nombreTiendaFromUrl = nombreTienda;
    
    // Si no hay nombreTienda en params, intenta extraerlo de la ruta
    // Ejemplo: /tienda/laferreteria/catalogo -> nombreTienda = "laferreteria"
    if (!nombreTiendaFromUrl && location.pathname.startsWith("/tienda/")) {
        const pathParts = location.pathname.split("/");
        if (pathParts.length >= 3 && pathParts[1] === "tienda") {
            nombreTiendaFromUrl = pathParts[2];
        }
    }
    
    // Si aún no hay nombreTienda, puede ser null (para rutas que no requieren tienda)
    // Por ejemplo: /login, /register, etc.

    return (
        <TiendaProvider nombreTienda={nombreTiendaFromUrl || null}>
            {children}
        </TiendaProvider>
    );
}

