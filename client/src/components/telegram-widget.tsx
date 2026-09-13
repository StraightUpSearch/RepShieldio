import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { X } from "lucide-react";

const TELEGRAM_URL = "https://t.me/repshield";
const SESSION_KEY = "rs_tg_bubble_seen";

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-2.05 9.667c-.152.671-.55.835-1.116.519l-3.083-2.271-1.487 1.432c-.165.165-.303.303-.621.303l.222-3.143 5.726-5.173c.249-.222-.054-.345-.386-.123L6.85 14.6 3.817 13.65c-.661-.206-.673-.661.138-.977l10.885-4.197c.549-.2 1.029.134.722.771z" />
  </svg>
);

// Pages where the widget should be hidden
const EXCLUDED_PATHS = ["/admin", "/login", "/auth", "/data-admin"];

export default function TelegramWidget() {
  const [location] = useLocation();
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  const isExcluded = EXCLUDED_PATHS.some((p) => location.startsWith(p));

  useEffect(() => {
    if (isExcluded) return;
    if (sessionStorage.getItem(SESSION_KEY)) {
      setBubbleDismissed(true);
      return;
    }
    const t = setTimeout(() => setShowBubble(true), 5000);
    return () => clearTimeout(t);
  }, [isExcluded]);

  const openTelegram = () => {
    window.open(TELEGRAM_URL, "_blank", "noopener,noreferrer");
  };

  const dismissBubble = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowBubble(false);
    setBubbleDismissed(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  if (isExcluded) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
      {/* Pop-up card */}
      {showBubble && !bubbleDismissed && (
        <div
          className="pointer-events-auto relative bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-72 animate-in slide-in-from-bottom-4 fade-in duration-300"
          style={{ animationDuration: "350ms" }}
        >
          {/* Dismiss button */}
          <button
            onClick={dismissBubble}
            className="absolute top-2.5 right-2.5 w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Agent info */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-950 flex items-center justify-center text-white font-bold text-sm select-none">
                J
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Jamie — RepShield</p>
              <p className="text-xs text-green-600 font-medium">● Online · Free assessment</p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-3 text-sm text-gray-700 leading-snug">
            👋 Have Reddit content you need removed?
            <span className="block mt-1 text-gray-900 font-medium">
              Message us now for a free case review — 24&nbsp;hr response guaranteed.
            </span>
          </div>

          {/* CTA button */}
          <button
            onClick={openTelegram}
            className="w-full py-2.5 bg-[#0088CC] hover:bg-[#0077BB] active:bg-[#0066AA] text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <TelegramIcon className="w-4 h-4 shrink-0" />
            Message us on Telegram
          </button>

          {/* Down-pointing triangle pointer */}
          <div className="absolute -bottom-[9px] right-[22px] w-4 h-4 overflow-hidden">
            <div className="w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 origin-top-left translate-x-[2px]" />
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={openTelegram}
        className="pointer-events-auto relative w-14 h-14 bg-[#0088CC] hover:bg-[#0077BB] active:bg-[#0066AA] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        aria-label="Chat with us on Telegram"
        title="Chat with us — free assessment"
      >
        <TelegramIcon className="w-7 h-7" />
        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-[#0088CC] opacity-20 pointer-events-none" />
        {/* Online indicator */}
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
      </button>
    </div>
  );
}
