import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useCollection } from '../context/CollectionContext';
import { useEffect, useState } from 'react';

export default function Toast() {
  const { toast } = useCollection();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2700);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast || !visible) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle2 size={18} className="text-success" />;
      case 'error': return <AlertCircle size={18} className="text-danger" />;
      default: return <Info size={18} className="text-accent" />;
    }
  };

  return (
    <div className={`toast-notification ${visible ? 'visible' : ''}`}>
      <div className="toast-content">
        {getIcon()}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
