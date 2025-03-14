import { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

export default function Notification({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeClasses = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700'
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded border-l-4 shadow-md ${typeClasses[type]}`}>
      <div className="flex items-center">
        <p>{message}</p>
        <button 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
} 