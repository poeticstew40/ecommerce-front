import { useEffect, useRef, useState } from "react";
import "../styles/NotificationModal.css";

/**
 * Componente de Notificación Toast Reutilizable
 * 
 * Muestra notificaciones tipo toast en la esquina superior derecha
 * Sin overlay oscuro, más pequeño, y desaparece automáticamente
 * 
 * @param {boolean} isOpen - Controla si la notificación está visible
 * @param {string} type - Tipo de notificación: 'success', 'error', 'warning', 'info'
 * @param {string} title - Título de la notificación (opcional)
 * @param {string} message - Mensaje a mostrar
 * @param {function} onClose - Función que se ejecuta al cerrar la notificación
 * @param {number} autoClose - Tiempo en milisegundos para cerrar automáticamente (por defecto 3000ms)
 */
function NotificationModal({ isOpen, type = 'info', title, message, onClose, autoClose = 3000 }) {
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(isOpen);
    const onCloseRef = useRef(onClose);
    const timeoutRef = useRef(null);
    const prevIsOpenRef = useRef(isOpen);
    
    // Mantener la referencia actualizada sin causar re-renders
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // Manejar cuando isOpen cambia
    useEffect(() => {
        const prevIsOpen = prevIsOpenRef.current;
        prevIsOpenRef.current = isOpen;
        
        if (isOpen && !prevIsOpen) {
            // Se está abriendo
            setShouldRender(true);
            setIsClosing(false);
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        } else if (!isOpen && prevIsOpen && shouldRender) {
            // Se está cerrando - iniciar animación de salida
            setIsClosing(true);
            // Después de la animación, dejar de renderizar
            timeoutRef.current = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
            }, 300); // Duración de la animación
        }
        
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [isOpen, shouldRender]);

    useEffect(() => {
        if (isOpen && autoClose > 0) {
            const timer = setTimeout(() => {
                if (onCloseRef.current) onCloseRef.current();
            }, autoClose);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoClose]); // Removido onClose de las dependencias

    useEffect(() => {
        // Cerrar con ESC
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && onCloseRef.current) {
                onCloseRef.current();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]); // Removido onClose de las dependencias

    if (!shouldRender) return null;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const typeClass = `notification-${type}`;

    return (
        <div 
            className={`notification-toast ${typeClass} ${isClosing ? 'closing' : ''}`}
            onClick={() => {
                if (onCloseRef.current) onCloseRef.current();
            }}
        >
            <div className="notification-toast-content">
                <div className={`notification-toast-icon ${typeClass}`}>
                    {icons[type] || icons.info}
                </div>
                <div className="notification-toast-text">
                    {title && (
                        <div className="notification-toast-title">{title}</div>
                    )}
                    <div className="notification-toast-message">{message}</div>
                </div>
                <button 
                    className="notification-toast-close"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onCloseRef.current) onCloseRef.current();
                    }}
                    aria-label="Cerrar"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}

export default NotificationModal;
