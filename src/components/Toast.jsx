import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle2 size={18} className="text-success" />,
    error: <AlertCircle size={18} className="text-danger" />,
    info: <Info size={18} className="text-accent-secondary" />
  };

  return (
    <div className={`toast toast-${type}`}>
      {icons[type]}
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
