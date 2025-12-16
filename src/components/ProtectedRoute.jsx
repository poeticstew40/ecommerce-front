import { Navigate } from "react-router-dom";
import { useAuth } from "../tienda/contexts/AuthContext";

/**
 * Componente para proteger rutas que requieren autenticación
 * 
 * @param {React.ReactNode} children - Componentes hijos a renderizar si está autenticado
 * @param {boolean} requireVendedor - Si es true, requiere que el usuario sea vendedor
 */
function ProtectedRoute({ children, requireVendedor = false }) {
    const { isAuthenticated, isVendedor, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireVendedor && !isVendedor) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;

