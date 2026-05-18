import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match CSS animation duration
  }, [onClose]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [handleClose]);

  const icons = {
    success: <CheckCircle className="text-success" size={20} />,
    error: <AlertCircle className="text-danger" size={20} />,
    info: <Info className="text-accent-secondary" size={20} />
  };

  return (
    <div className={`toast ${type} ${isExiting ? 'exit' : 'enter'}`}>
      <div className="toast-icon">
        {icons[type]}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={handleClose}>
        <X size={16} />
      </button>
    </div>
  );
}
