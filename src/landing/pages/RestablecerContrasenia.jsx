import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../tienda/services/auth'; 
import '../styles/Auth.css';

const RestablecerContrasenia = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token'); 

  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) setError('Token inválido o expirado.');
  }, [token]);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (passwords.password !== passwords.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    // Validación de contraseña: mínimo 6 caracteres, al menos una mayúscula y un número
    if (passwords.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    if (!/[A-Z]/.test(passwords.password)) {
        setError('La contraseña debe contener al menos una letra mayúscula.');
        return;
    }
    if (!/[0-9]/.test(passwords.password)) {
        setError('La contraseña debe contener al menos un número.');
        return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: passwords.password });
      setMensaje('¡Contraseña actualizada con éxito!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al restablecer la contraseña.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="auth-container">
        <div className="auth-card">
            <div className="msg-box msg-error">Error: No se encontró el token de seguridad.</div>
        </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Nueva Contraseña</h2>
        <p className="auth-subtitle">Crea una contraseña nueva y segura.</p>

        {mensaje ? (
          <div className="msg-box msg-success">
            <div>
                <p><strong>{mensaje}</strong></p>
                <p style={{fontSize: '0.8rem'}}>Redirigiendo al login...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Mínimo 6 caracteres, una mayúscula y un número"
                value={passwords.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                className={`form-input ${passwords.confirmPassword && passwords.password !== passwords.confirmPassword ? 'error-border' : ''}`}
                placeholder="Confirmar contraseña"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="msg-box msg-error">⚠️ {error}</div>}

            <button type="submit" disabled={loading} className="btn-primary-auth">
              {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RestablecerContrasenia;