import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCarrito } from '../contexts/CarritoContext';

function EstadoPago({ estado }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { limpiarCarrito } = useCarrito();

    // 1. Obtener datos de Mercado Pago
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id') || '---';
    const paymentType = searchParams.get('payment_type') || 'MercadoPago';

    useEffect(() => {
        // Limpiamos carrito si la compra fue exitosa
        if (estado === 'exito' && limpiarCarrito) {
            limpiarCarrito();
        }

        // 2. Recuperar la tienda donde estábamos comprando
        let tiendaActual = localStorage.getItem("auth_tiendaActual");
        
        // Fallback de seguridad: si por alguna razón se borró el localStorage, 
        // redirigimos a una tienda por defecto o al landing general.
        // Si tienes una tienda principal, pon su nombre aquí en vez de 'tecnologia'.
        if (!tiendaActual || tiendaActual === 'undefined') {
            tiendaActual = 'tecnologia'; 
        }

        // 3. Construir la URL para activar el Popup en el Home
        const params = new URLSearchParams();
        params.set('mostrar_ticket', 'true');   // Esta es la clave que lee el Home
        params.set('estado', estado);           // exito, fallo, pendiente
        params.set('id_operacion', paymentId);
        params.set('metodo', paymentType);

        // 4. Redirigir al Home de la tienda
        navigate(`/tienda/${tiendaActual}/home?${params.toString()}`, { replace: true });

    }, [estado, navigate, limpiarCarrito, paymentId, paymentType]);

    // Spinner mientras redirige
    return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Procesando pago...</span>
            </div>
        </div>
    );
}

export default EstadoPago;