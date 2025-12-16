import { createContext, useContext, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import NotificationModal from "../components/NotificationModal";

const NotificationContext = createContext();

/**
 * Provider de notificaciones global
 * 
 * Permite mostrar notificaciones desde cualquier parte de la aplicación
 * que persisten entre navegaciones
 */
export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const timersRef = useRef({});

    /**
     * Cierra una notificación específica
     */
    const closeNotification = useCallback((id) => {
        // Limpiar el timer si existe
        if (timersRef.current[id]) {
            clearTimeout(timersRef.current[id]);
            delete timersRef.current[id];
        }
        
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    /**
     * Muestra una notificación
     * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
     * @param {string} title - Título de la notificación
     * @param {string} message - Mensaje de la notificación
     * @param {number} autoClose - Tiempo en ms para cerrar automáticamente (0 = no cerrar)
     */
    const showNotification = useCallback((type, title, message, autoClose = null) => {
        const id = Date.now() + Math.random();
        const notification = {
            id,
            type,
            title,
            message,
            isOpen: true,
            autoClose: autoClose !== null ? autoClose : (type === 'success' ? 2000 : type === 'error' ? 5000 : 3000)
        };
        
        setNotifications(prev => [...prev, notification]);
        
        // Si tiene autoClose, cerrar automáticamente
        if (notification.autoClose > 0) {
            const timerId = setTimeout(() => {
                closeNotification(id);
            }, notification.autoClose);
            timersRef.current[id] = timerId;
        }
        
        return id;
    }, [closeNotification]);

    /**
     * Métodos de conveniencia
     */
    const success = (title, message, autoClose = 2000) => showNotification('success', title, message, autoClose);
    const error = (title, message, autoClose = 5000) => showNotification('error', title, message, autoClose);
    const warning = (title, message, autoClose = 3000) => showNotification('warning', title, message, autoClose);
    const info = (title, message, autoClose = 3000) => showNotification('info', title, message, autoClose);

    const value = {
        showNotification,
        closeNotification,
        success,
        error,
        warning,
        info
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* Renderizar notificaciones usando portal */}
            {typeof document !== 'undefined' && notifications.length > 0 && createPortal(
                <div style={{ 
                    position: 'fixed', 
                    top: '20px', 
                    right: '20px', 
                    zIndex: 10000, 
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    alignItems: 'flex-end'
                }}>
                    {notifications.map((notification) => {
                        // Crear una función estable para onClose usando useCallback implícito
                        const handleClose = () => closeNotification(notification.id);
                        
                        return (
                            <div
                                key={notification.id}
                                style={{
                                    pointerEvents: 'auto'
                                }}
                            >
                                <NotificationModal
                                    isOpen={notification.isOpen}
                                    type={notification.type}
                                    title={notification.title}
                                    message={notification.message}
                                    onClose={handleClose}
                                    autoClose={0} // Ya manejamos el autoClose en el contexto
                                />
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}
        </NotificationContext.Provider>
    );
}

/**
 * Hook para usar el contexto de notificaciones
 */
export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications debe usarse dentro de NotificationProvider');
    }
    return context;
}

