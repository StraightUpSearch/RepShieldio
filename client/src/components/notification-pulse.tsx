import { useState, useEffect } from "react";
import { Bell, MessageCircle } from "lucide-react";

interface NotificationPulseProps {
  isActive: boolean;
  count: number;
  onReset: () => void;
}

export function NotificationPulse({ isActive, count, onReset }: NotificationPulseProps) {
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (isActive && count > 0) {
      setShowPulse(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowPulse(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isActive, count]);

  if (!showPulse || count === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div 
        className="bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg cursor-pointer hover:bg-orange-600 transition-colors"
        onClick={() => {
          setShowPulse(false);
          onReset();
        }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
          <div>
            <div className="font-semibold text-sm">
              {count} Live Visitor{count > 1 ? 's' : ''} Chatting
            </div>
            <div className="text-xs opacity-90">
              Check Telegram for details
            </div>
          </div>
          <Bell className="w-4 h-4 animate-bounce" />
        </div>
      </div>

      {/* Pulse animation background */}
      <div className="absolute inset-0 bg-orange-400 rounded-lg animate-ping opacity-75 -z-10" />
    </div>
  );
}