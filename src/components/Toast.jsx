import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  return (
    <div className={`toast toast-${type} ${isExiting ? 'exit' : 'enter'}`}>
      <div className="toast-content">{message}</div>
      <button className="toast-close" onClick={handleClose}>
        <X size={14} />
      </button>
    </div>
  );
}
