import { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer_Landing from "../../landing/components/Footer_Landing";
import "../styles/Carrito.css"; // Reutilizamos estilos para mantener consistencia

function EstadoPago({ estado }) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    
    // Mercado Pago devuelve estos datos en la URL
    const paymentId = searchParams.get("payment_id");
    const status = searchParams.get("status");
    const externalReference = searchParams.get("external_reference"); // Este es el ID del pedido

    // Recuperar la última tienda visitada para el botón de volver
    const ultimaTienda = localStorage.getItem("auth_tiendaActual");

    // Títulos y mensajes según el estado
    const config = {
        exito: {
            titulo: "¡Pago Exitoso!",
            mensaje: "Tu compra se procesó correctamente. Te enviamos un email con los detalles.",
            color: "#28a745",
            icono: "🎉"
        },
        fallo: {
            titulo: "Hubo un problema",
            mensaje: "El pago fue rechazado o cancelado. Por favor intenta nuevamente.",
            color: "#dc3545",
            icono: "❌"
        },
        pendiente: {
            titulo: "Pago Pendiente",
            mensaje: "Estamos procesando tu pago. Te avisaremos cuando se confirme.",
            color: "#ffc107",
            icono: "⏳"
        }
    };

    const info = config[estado] || config.exito;

    return (
        <div>
            <Header />
            <div className="main-carrito" style={{ justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <div className="cart-confirm" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
                        {info.icono}
                    </div>
                    
                    <h1 style={{ color: info.color, marginBottom: '15px' }}>{info.titulo}</h1>
                    
                    <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '20px' }}>
                        {info.mensaje}
                    </p>

                    <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '25px', textAlign: 'left' }}>
                        <p style={{ margin: '5px 0' }}><strong>ID de Pago:</strong> {paymentId || "-"}</p>
                        <p style={{ margin: '5px 0' }}><strong>N° Pedido:</strong> {externalReference || "-"}</p>
                        <p style={{ margin: '5px 0' }}><strong>Estado:</strong> {status || estado}</p>
                    </div>

                    {ultimaTienda ? (
                        <Link to={`/tienda/${ultimaTienda}/catalogo`} className="cart-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Volver a la Tienda
                        </Link>
                    ) : (
                        <Link to="/" className="cart-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Volver al Inicio
                        </Link>
                    )}
                </div>
            </div>
            <Footer_Landing />
        </div>
    );
}

export default EstadoPago;