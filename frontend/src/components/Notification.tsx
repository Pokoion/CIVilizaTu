import React, { useState, useEffect } from 'react';
import '../styles/Notification.css';

interface NotificationProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
  isVisible: boolean;
}

const Notification: React.FC<NotificationProps> = ({ 
  type, 
  message, 
  duration = 5000, 
  onClose,
  isVisible 
}) => {
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    setVisible(isVisible);
    
    if (isVisible && duration !== 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <div className={`notification-icon notification-icon-${type}`}>
          {type === 'success' && '✓'}
          {type === 'warning' && '⚠'}
          {type === 'error' && '✗'}
          {type === 'info' && 'ℹ'}
        </div>
        <div className="notification-message">{message}</div>
      </div>
      <button className="notification-close" onClick={handleClose}>×</button>
    </div>
  );
};

export default Notification;
