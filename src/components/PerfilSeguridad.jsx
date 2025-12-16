import { useState } from "react";
import { changePassword } from "../tienda/services/auth";
import { useNotifications } from "../contexts/NotificationContext";
// Reutilizamos estilos del admin
import "../admin/styles/AdminConfiguracion.css"; 

function PerfilSeguridad() {
    const { success, error: showError } = useNotifications();
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            showError("Error", "Las contraseñas nuevas no coinciden");
            return;
        }
        // Validación de contraseña: mínimo 6 caracteres, al menos una mayúscula y un número
        if (formData.newPassword.length < 6) {
            showError("Error", "La nueva contraseña debe tener al menos 6 caracteres");
            return;
        }
        if (!/[A-Z]/.test(formData.newPassword)) {
            showError("Error", "La contraseña debe contener al menos una letra mayúscula");
            return;
        }
        if (!/[0-9]/.test(formData.newPassword)) {
            showError("Error", "La contraseña debe contener al menos un número");
            return;
        }

        setLoading(true);
        try {
            await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            success("Éxito", "Contraseña actualizada correctamente");
            setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            const msg = err.response?.data?.message || "Error al cambiar contraseña";
            showError("Error", msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2 className="configuracion-title">Seguridad de la Cuenta</h2>
            
            <div className="configuracion-form" style={{ maxWidth: '600px', margin: '0' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50', fontSize: '1.2rem' }}>Cambiar Contraseña</h3>
                
                <form onSubmit={handleSubmit}>
                    <div className="configuracion-form-group">
                        <label className="configuracion-label">Contraseña Actual</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="configuracion-input"
                            placeholder="Ingresa tu contraseña actual"
                            required
                        />
                    </div>

                    <div className="configuracion-form-group">
                        <label className="configuracion-label">Nueva Contraseña</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="configuracion-input"
                            placeholder="Mínimo 6 caracteres, una mayúscula y un número"
                            required
                        />
                    </div>

                    <div className="configuracion-form-group">
                        <label className="configuracion-label">Confirmar Nueva Contraseña</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="configuracion-input"
                            placeholder="Repite la nueva contraseña"
                            required
                        />
                    </div>

                    <div className="configuracion-form-actions">
                        <button 
                            type="submit" 
                            className="configuracion-btn configuracion-btn-submit"
                            disabled={loading}
                        >
                            {loading ? "Actualizando..." : "Actualizar Contraseña"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PerfilSeguridad;