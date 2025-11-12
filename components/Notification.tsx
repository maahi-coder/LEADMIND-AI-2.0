import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, 4700);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const isSuccess = type === 'success';
  const bgColor = isSuccess ? 'bg-green-500/80' : 'bg-red-500/80';
  const borderColor = isSuccess ? 'border-green-400' : 'border-red-400';
  const Icon = isSuccess ? CheckCircleIcon : XCircleIcon;
  
  const animationClasses = isExiting ? 'animate-slide-out' : 'animate-slide-in';

  return (
    <div className={`fixed top-5 right-5 z-50`}>
      <div 
        className={`${bgColor} ${borderColor} text-white font-semibold py-3 px-5 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-3 ${animationClasses}`}
      >
        <Icon className="w-6 h-6"/>
        <span>{message}</span>
      </div>
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
        .animate-slide-out { animation: slide-out 0.3s ease-in forwards; }
      `}</style>
    </div>
  );
};

export default Notification;
