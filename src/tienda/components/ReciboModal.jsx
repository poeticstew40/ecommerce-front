import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaReceipt } from "react-icons/fa";

const ReciboModal = ({ show, onHide, datos }) => {
    // Si no debe mostrarse, no renderiza nada
    if (!show || !datos) return null;

    const { estado, id, metodo, fecha } = datos;

    // Configuración visual según el estado
    const config = {
        approved: { 
            titulo: '¡COMPRA EXITOSA!', 
            mensaje: 'El pago se acreditó correctamente.', 
            Icono: FaCheckCircle, 
            color: '#198754' // Verde
        },
        rejected: { 
            titulo: 'PAGO RECHAZADO', 
            mensaje: 'No se pudo cobrar. Intenta con otro medio.', 
            Icono: FaTimesCircle, 
            color: '#dc3545' // Rojo
        },
        pending: { 
            titulo: 'PAGO PENDIENTE', 
            mensaje: 'Estamos esperando la confirmación.', 
            Icono: FaClock, 
            color: '#ffc107' // Amarillo
        }
    };

    // Si el estado no coincide, usamos 'approved' por defecto o un genérico
    const current = config[estado] || config.approved;

    return (
        <div style={{
            position: 'fixed',
            top: 0, 
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.85)', // Fondo oscuro
            zIndex: 99999, // Encima de todo
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{ position: 'relative', width: '90%', maxWidth: '400px' }}>
                
                {/* Botón Cerrar Flotante */}
                <button 
                    onClick={onHide}
                    style={{
                        position: 'absolute',
                        top: '-15px',
                        right: '-15px',
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '35px',
                        height: '35px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        zIndex: 100,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                >
                    ✕
                </button>

                {/* TICKET DE PAPEL */}
                <div style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '4px', 
                    overflow: 'hidden',
                    fontFamily: '"Courier New", Courier, monospace',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}>
                    {/* Header Color */}
                    <div style={{ height: '10px', backgroundColor: current.color }}></div>
                    
                    <div style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ borderBottom: '2px dashed #ddd', paddingBottom: '15px', marginBottom: '20px' }}>
                            <h3 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.2rem', fontWeight: 'bold' }}>TradioGlobal</h3>
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>Comprobante de operación</span>
                        </div>

                        <current.Icono size={60} color={current.color} style={{ marginBottom: '15px' }} />
                        
                        <h2 style={{ color: current.color, margin: '0 0 10px 0', fontSize: '1.5rem' }}>{current.titulo}</h2>
                        <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '25px' }}>{current.mensaje}</p>

                        <div style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '8px', textAlign: 'left', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <strong>ID Operación:</strong>
                                <span>#{id}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                <strong>Fecha:</strong>
                                <span>{fecha}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>Estado:</strong>
                                <span style={{ textTransform: 'uppercase', color: current.color, fontWeight: 'bold' }}>{estado}</span>
                            </div>
                        </div>

                        <button 
                            onClick={onHide}
                            style={{
                                marginTop: '25px',
                                width: '100%',
                                padding: '12px',
                                backgroundColor: '#212529',
                                color: 'white',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                textTransform: 'uppercase'
                            }}
                        >
                            Continuar comprando
                        </button>
                    </div>

                    {/* Decoración zigzag abajo */}
                    <div style={{
                        height: '15px',
                        backgroundImage: 'linear-gradient(135deg, white 25%, transparent 25%), linear-gradient(225deg, white 25%, transparent 25%)',
                        backgroundSize: '20px 20px',
                        backgroundColor: '#333' // Color del fondo de atrás
                    }}></div>
                </div>
            </div>
        </div>
    );
};

export default ReciboModal;