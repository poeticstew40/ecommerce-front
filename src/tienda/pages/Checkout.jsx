import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTienda } from "../contexts/TiendaContext";
import { createPedido } from "../services/pedidos.js";
import { crearPreferenciaPago } from "../services/pagos.js";
import { getDireccionesByUsuario, createDireccion } from "../services/direcciones.js";
import { useNotifications } from "../../contexts/NotificationContext.jsx";
import Header from "../components/Header";
import Footer_Landing from "../../landing/components/Footer_Landing.jsx";
import "../styles/Carrito.css";

/**
* Componente Checkout
* Permite seleccionar direcciones guardadas, crear nuevas, 
* y ajusta el costo de envío según el método seleccionado.
*/
function Checkout() {
    const { nombreTienda } = useParams();
    const { usuario } = useAuth();
    const { tienda } = useTienda(); 
    const { error: showError, success: showSuccess } = useNotifications();

    const [loading, setLoading] = useState(false);
    
    // --- ESTADOS DE DIRECCIÓN ---
    const [direccionesGuardadas, setDireccionesGuardadas] = useState([]);
    const [selectedDireccionId, setSelectedDireccionId] = useState("nueva"); // "nueva" o ID de la dirección
    const [guardarNuevaDireccion, setGuardarNuevaDireccion] = useState(false); // Checkbox para guardar

    // Estados del formulario manual (Nueva Dirección)
    const [calle, setCalle] = useState("");
    const [numero, setNumero] = useState("");
    const [piso, setPiso] = useState("");
    const [depto, setDepto] = useState("");
    const [localidad, setLocalidad] = useState("");
    const [codigoPostal, setCodigoPostal] = useState("");
    const [provincia, setProvincia] = useState("");

    // --- ESTADOS DE ENVÍO ---
    const [metodoEnvio, setMetodoEnvio] = useState("Envío a Domicilio");
    const [costoEnvioBase, setCostoEnvioBase] = useState(0); // El costo que define la tienda
    const [costoEnvioFinal, setCostoEnvioFinal] = useState(0); // El costo que paga el usuario (0 si es retiro)

    // 1. Cargar costo de envío base desde la tienda
    useEffect(() => {
        if (tienda && tienda.costoEnvio !== undefined) {
            const costo = Number(tienda.costoEnvio);
            setCostoEnvioBase(costo);
            setCostoEnvioFinal(costo); // Por defecto aplicamos el costo
        }
    }, [tienda]);

    // 2. Cargar direcciones guardadas del usuario
    useEffect(() => {
        if (usuario && usuario.dni) {
            getDireccionesByUsuario(usuario.dni)
                .then(data => {
                    setDireccionesGuardadas(data || []);
                    // Si tiene direcciones, seleccionamos la primera por defecto
                    if (data && data.length > 0) {
                        setSelectedDireccionId(data[0].id);
                    }
                })
                .catch(err => console.error("Error cargando direcciones:", err));
        }
    }, [usuario]);

    // 3. Manejar cambio de método de envío (Lógica de costo 0)
    useEffect(() => {
        if (metodoEnvio === "Retiro en Tienda") {
            setCostoEnvioFinal(0);
        } else {
            setCostoEnvioFinal(costoEnvioBase);
        }
    }, [metodoEnvio, costoEnvioBase]);


    const handlePagar = async () => {
        if (!usuario || !usuario.dni) {
            showError("Error", "Usuario no identificado.");
            return;
        }

        let direccionString = "";

        // LÓGICA DE DIRECCIÓN
        if (metodoEnvio === "Envío a Domicilio") {
            
            if (selectedDireccionId === "nueva") {
                // VALIDAR CAMPOS NUEVOS
                if (!calle.trim() || !numero.trim() || !localidad.trim() || !codigoPostal.trim() || !provincia.trim()) {
                    showError("Falta información", "Por favor completa los campos obligatorios de la dirección.");
                    return;
                }
                
                // Construir string
                direccionString = `${calle} ${numero}${piso ? `, Piso ${piso}` : ''}${depto ? ` Dpto ${depto}` : ''}, ${localidad}, ${provincia}, CP: ${codigoPostal}`;

                // GUARDAR DIRECCIÓN SI EL CHECKBOX ESTÁ ACTIVO
                if (guardarNuevaDireccion) {
                    try {
                        await createDireccion({
                            usuarioDni: usuario.dni,
                            calle, numero, piso, departamento: depto, localidad, provincia, codigoPostal
                        });
                        // No esperamos a recargar la lista, seguimos con el pago
                    } catch (err) {
                        console.error("No se pudo guardar la dirección nueva:", err);
                        // No bloqueamos la compra si falla el guardado de dirección
                    }
                }

            } else {
                // USAR DIRECCIÓN GUARDADA
                const dir = direccionesGuardadas.find(d => d.id === parseInt(selectedDireccionId));
                if (!dir) {
                    showError("Error", "La dirección seleccionada no es válida.");
                    return;
                }
                direccionString = `${dir.calle} ${dir.numero}${dir.piso ? `, Piso ${dir.piso}` : ''}${dir.departamento ? ` Dpto ${dir.departamento}` : ''}, ${dir.localidad}, ${dir.provincia}, CP: ${dir.codigoPostal}`;
            }

        } else {
            // RETIRO EN TIENDA
            direccionString = "Retiro en Tienda - " + (tienda.nombreFantasia || nombreTienda);
        }

        setLoading(true);
        try {
            const pedidoData = {
                usuarioDni: usuario.dni,
                direccionEnvio: direccionString,
                metodoEnvio: metodoEnvio,
                costoEnvio: costoEnvioFinal,
                items: [] 
            };
            
            const pedidoCreado = await createPedido(nombreTienda, pedidoData);
            const respuestaPago = await crearPreferenciaPago(pedidoCreado.id);
            
            if (respuestaPago && respuestaPago.url) {
                window.location.href = respuestaPago.url;
            } else {
                throw new Error("No se recibió la URL de pago.");
            }

        } catch (error) {
            console.error("Error en checkout:", error);
            const msg = error.response?.data?.message || "Hubo un error al procesar el pedido.";
            showError("Error", msg);
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div className="main-carrito">
         
                {/* Columna izquierda: Datos */}
                <div className="items-cart-cont">
                    <div className="items-cart" style={{ flexDirection: 'column', alignItems: 'flex-start', height: 'auto', gap: '20px', padding: '30px' }}>
                       
                        <h2 style={{ margin: 0, color: 'var(--text-gray-1)' }}>Opciones de Entrega</h2>
                        
                        {/* 1. SELECCIONAR MÉTODO DE ENVÍO */}
                        <div style={{ width: '100%' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>¿Cómo quieres recibir tu compra?</label>
                            <select 
                                value={metodoEnvio}
                                onChange={(e) => setMetodoEnvio(e.target.value)}
                                style={selectStyle}
                            >
                                <option value="Envío a Domicilio">Envío a Domicilio {costoEnvioBase > 0 ? `($${costoEnvioBase})` : '(Gratis)'}</option>
                                <option value="Retiro en Tienda">Retiro en Tienda (Gratis)</option>
                            </select>
                        </div>

                        {/* 2. LÓGICA DE DIRECCIONES (Solo si es Envío a Domicilio) */}
                        {metodoEnvio === "Envío a Domicilio" && (
                            <div style={{ width: '100%', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Selecciona una dirección:</label>
                                    <select 
                                        value={selectedDireccionId}
                                        onChange={(e) => setSelectedDireccionId(e.target.value)}
                                        style={selectStyle}
                                    >
                                        {direccionesGuardadas.map(dir => (
                                            <option key={dir.id} value={dir.id}>
                                                {dir.calle} {dir.numero}, {dir.localidad} ({dir.provincia})
                                            </option>
                                        ))}
                                        <option value="nueva">+ Agregar Nueva Dirección</option>
                                    </select>
                                </div>

                                {/* FORMULARIO PARA NUEVA DIRECCIÓN (Solo si seleccionó "nueva") */}
                                {selectedDireccionId === "nueva" && (
                                    <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                        <h4 style={{ marginTop: 0, marginBottom: '15px', color: '#4b5563' }}>Nueva Dirección de Envío</h4>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <div style={{ flex: 3 }}>
                                                    <input type="text" value={calle} onChange={(e) => setCalle(e.target.value)} placeholder="Calle *" style={inputStyle} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número *" style={inputStyle} />
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <input type="text" value={piso} onChange={(e) => setPiso(e.target.value)} placeholder="Piso" style={inputStyle} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <input type="text" value={depto} onChange={(e) => setDepto(e.target.value)} placeholder="Depto" style={inputStyle} />
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <div style={{ flex: 1 }}>
                                                    <input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} placeholder="C. Postal *" style={inputStyle} />
                                                </div>
                                                <div style={{ flex: 2 }}>
                                                    <input type="text" value={localidad} onChange={(e) => setLocalidad(e.target.value)} placeholder="Localidad *" style={inputStyle} />
                                                </div>
                                            </div>

                                            <div>
                                                <input type="text" value={provincia} onChange={(e) => setProvincia(e.target.value)} placeholder="Provincia *" style={inputStyle} />
                                            </div>

                                            {/* CHECKBOX GUARDAR DIRECCIÓN */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '5px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    id="guardarDir" 
                                                    checked={guardarNuevaDireccion}
                                                    onChange={(e) => setGuardarNuevaDireccion(e.target.checked)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                                />
                                                <label htmlFor="guardarDir" style={{ cursor: 'pointer', fontSize: '0.9rem', color: '#4b5563' }}>Guardar esta dirección para futuras compras</label>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {metodoEnvio === "Retiro en Tienda" && (
                            <div style={{ width: '100%', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e40af' }}>
                                <strong>¡Excelente!</strong> Te esperamos en nuestra tienda para entregar tu pedido. No tiene costo de envío.
                            </div>
                        )}

                    </div>
                </div>

                {/* Columna derecha: Resumen */}
                <div className="cart-confirm">
                    <h1>Resumen del Pedido</h1>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                        <span>Envío ({metodoEnvio === "Retiro en Tienda" ? "Retiro" : "Domicilio"}):</span>
                        <span style={{ fontWeight: 'bold', color: costoEnvioFinal === 0 ? 'green' : 'black' }}>
                            {costoEnvioFinal === 0 ? "GRATIS" : `$${costoEnvioFinal}`}
                        </span>
                    </div>

                    <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
                            Al confirmar, serás redirigido a Mercado Pago para completar tu compra de forma segura.
                        </p>
                        
                        <button 
                            className="cart-btn" 
                            onClick={handlePagar}
                            disabled={loading}
                            style={{ opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? "Procesando..." : "Ir a Pagar"}
                        </button>
                    </div>
                </div>
            </div>
            
            <Footer_Landing />
        </div>
    );
};

// Estilos auxiliares
const inputStyle = {
    width: '100%', 
    padding: '10px', 
    borderRadius: '5px', 
    border: '1px solid #ccc',
    fontSize: '0.95rem'
};

const selectStyle = {
    width: '100%', 
    padding: '12px', 
    borderRadius: '5px', 
    border: '1px solid #ccc',
    fontSize: '1rem',
    backgroundColor: 'white',
    cursor: 'pointer'
};

export default Checkout;