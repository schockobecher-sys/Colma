import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, 2700);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`toast ${type} ${isExiting ? 'exit' : ''}`}>
      <div className="toast-icon">
        {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      </div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
