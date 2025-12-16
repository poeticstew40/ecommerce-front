import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../tienda/services/auth'; 
import '../styles/Auth.css'; 

const SolicitarRecuperacion = () => {
  const [email, setEmail] = useState('');
  const [dni, setDni] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMensaje('');

    try {
      await forgotPassword({ dni, email });
      setMensaje('¡Solicitud enviada! Si los datos son correctos, recibirás un correo.');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al validar los datos. Verifica tu DNI y Email.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Recuperar Contraseña</h2>
        <p className="auth-subtitle">Ingresa tu DNI y correo electrónico para validar tu identidad.</p>

        {mensaje ? (
          <div className="msg-box msg-success">
            <span>✅ {mensaje}</span>
            <div style={{marginLeft: 'auto'}}>
                <Link to="/login" className="auth-link">Volver al Login</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
                <input
                id="dni"
                name="dni"
                type="text"            
                inputMode="numeric"    
                pattern="[0-9]*"        
                required
                className="form-input"
                placeholder="Ingresa tu DNI"
                value={dni}
                onChange={(e) => {
                    const soloNumeros = e.target.value.replace(/\D/g, '');
                    setDni(soloNumeros);
                }}
                maxLength={10} 
                />
            </div>

            <div className="form-group">
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="tucorreo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            {error && <div className="msg-box msg-error">⚠️ {error}</div>}
            <button type="submit" disabled={loading} className="btn-primary-auth">
                {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>

            <div className="auth-footer">
              <Link to="/login" className="auth-link">Cancelar y volver</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SolicitarRecuperacion;