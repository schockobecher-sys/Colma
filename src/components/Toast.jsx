import './Toast.css';

// The logic is in ToastContext, this file could be used for specific Toast sub-components if needed.
// For now, the ToastProvider handles the rendering.
export default function Toast({ message, type }) {
  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}
