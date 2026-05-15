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

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" style={{ position: 'fixed', bottom: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '8px', width: '90%', maxWidth: '400px' }}>
        {toasts.map(toast => (
          <div key={toast.id} className={`toast toast-${toast.type}`} style={{
            background: 'var(--bg-tertiary)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(10px)',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
