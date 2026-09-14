import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'repshield_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Small delay so it doesn't flash on top of first paint
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 bg-white border border-gray-200 rounded-2xl shadow-lg p-5"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-sm font-semibold text-gray-900">We use cookies</p>
        <button
          onClick={decline}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        We use essential cookies to keep the site working and optional analytics cookies to understand
        how visitors use it. See our{' '}
        <a href="/privacy-policy" className="text-orange-500 hover:underline">
          Privacy Policy
        </a>{' '}
        for details.
      </p>
      <div className="flex gap-2">
        <Button
          onClick={accept}
          size="sm"
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold"
        >
          Accept all
        </Button>
        <Button
          onClick={decline}
          size="sm"
          variant="outline"
          className="flex-1 text-xs font-semibold border-gray-200"
        >
          Essential only
        </Button>
      </div>
    </div>
  );
}
