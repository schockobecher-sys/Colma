import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" style={{
        position: 'fixed',
        bottom: '100px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: 'calc(100% - 32px)',
        maxWidth: '400px'
      }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast glass-panel toast-${toast.type}`}
            style={{
              padding: '12px 20px',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              animation: 'slideUp 0.3s ease-out forwards',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              background: toast.type === 'success' ? 'rgba(74, 222, 128, 0.9)' : 'rgba(248, 113, 113, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
