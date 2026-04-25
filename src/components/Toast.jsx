import { useToast } from '../context/ToastContext';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2700);
    return () => clearTimeout(timer);
  }, []);

  const icons = {
    success: <CheckCircle2 size={18} className="text-success" />,
    error: <AlertCircle size={18} className="text-danger" />,
    info: <Info size={18} className="text-accent" />
  };

  return (
    <div className={`toast-item glass-panel ${isExiting ? 'exit' : ''}`} onClick={onRemove}>
      <div className="toast-icon">{icons[toast.type] || icons.info}</div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close"><X size={14} /></button>
    </div>
  );
}
