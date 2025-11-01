import { useEffect, useState } from 'react';

const Notification = ({ message, type = 'info', onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [onClose, duration]);
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-soft border-2 transition-soft ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${colors[type]}`}
    >
      <span className="text-2xl font-bold">{icons[type]}</span>
      <p className="font-medium">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;

