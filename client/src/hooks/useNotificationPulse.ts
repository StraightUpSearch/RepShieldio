import { useState, useEffect } from "react";

interface NotificationData {
  id: string;
  timestamp: number;
  type: 'chatbot' | 'lead' | 'scan';
  message: string;
}

export function useNotificationPulse() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Connect to real-time events
  useEffect(() => {
    if (!isListening) return;

    const eventSource = new EventSource('/api/notifications/stream');
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const notification: NotificationData = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          type: data.type || 'chatbot',
          message: data.message || 'New visitor interaction'
        };
        
        setNotifications(prev => [...prev, notification]);
        
        // Remove after 30 seconds
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 30000);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = () => {
      console.log('Notification stream disconnected, reconnecting...');
      setTimeout(() => {
        setIsListening(false);
        setIsListening(true);
      }, 5000);
    };

    return () => {
      eventSource.close();
    };
  }, [isListening]);

  const startListening = () => setIsListening(true);
  const stopListening = () => setIsListening(false);
  const clearNotifications = () => setNotifications([]);

  const activeNotifications = notifications.filter(n => 
    Date.now() - n.timestamp < 30000
  );

  return {
    notifications: activeNotifications,
    count: activeNotifications.length,
    isListening,
    startListening,
    stopListening,
    clearNotifications
  };
}