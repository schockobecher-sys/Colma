import { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-success" />,
    error: <AlertCircle size={18} className="text-danger" />,
    info: <Info size={18} className="text-accent" />
  };

  return (
    <div className={`toast ${type} ${isExiting ? 'exit' : ''}`}>
      <div className="toast-icon">
        {icons[type]}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => {
        setIsExiting(true);
        setTimeout(onClose, 300);
      }}>
        <X size={14} />
      </button>
    </div>
  );
}
