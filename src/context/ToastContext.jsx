import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
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
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: 'max-content',
        maxWidth: '90%'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type} glass-panel`} style={{
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '700',
            animation: 'slideUp 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: toast.type === 'danger' ? 'var(--danger)' : 'var(--success)',
            borderLeft: `4px solid ${toast.type === 'danger' ? 'var(--danger)' : 'var(--success)'}`
          }}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
