import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-success" />;
      case 'error': return <AlertCircle size={18} className="text-danger" />;
      default: return <Info size={18} className="text-accent" />;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      {getIcon()}
      <span>{message}</span>
    </div>
  );
};

export default Toast;
