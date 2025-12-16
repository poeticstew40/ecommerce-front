import { useState, useEffect } from "react";
import { getUsuarios } from "../services/usuarios";
import Header from "../components/Header.jsx";

/**
 * Componente para ver todos los usuarios registrados
 * Útil para verificar que el registro funciona correctamente
 */
function VerUsuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        setError(null);
        try {
            const datos = await getUsuarios();
            setUsuarios(Array.isArray(datos) ? datos : []);
        } catch (err) {
            console.error("Error cargando usuarios:", err);
            setError(err.response?.data?.message || err.message || "Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Header />
            <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
                <h1>Usuarios Registrados</h1>
                <button 
                    onClick={cargarUsuarios} 
                    style={{ 
                        marginBottom: "20px", 
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}
                >
                    Actualizar Lista
                </button>

                {loading && <p>Cargando usuarios...</p>}
                
                {error && (
                    <div style={{ color: "red", marginBottom: "20px" }}>
                        Error: {error}
                    </div>
                )}

                {!loading && !error && (
                    <>
                        <p style={{ marginBottom: "20px" }}>
                            Total de usuarios: <strong>{usuarios.length}</strong>
                        </p>
                        
                        {usuarios.length === 0 ? (
                            <p>No hay usuarios registrados.</p>
                        ) : (
                            <table style={{ 
                                width: "100%", 
                                borderCollapse: "collapse",
                                border: "1px solid #ddd"
                            }}>
                                <thead>
                                    <tr style={{ backgroundColor: "#f2f2f2" }}>
                                        <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>DNI</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Nombre</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Apellido</th>
                                        <th style={{ padding: "12px", border: "1px solid #ddd", textAlign: "left" }}>Email</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map((usuario) => (
                                        <tr key={usuario.dni}>
                                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{usuario.dni}</td>
                                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{usuario.nombre}</td>
                                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{usuario.apellido}</td>
                                            <td style={{ padding: "12px", border: "1px solid #ddd" }}>{usuario.email}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default VerUsuarios;

