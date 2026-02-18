import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";

interface SmartRecaptchaProps {
  onVerify: (token: string) => void;
  isRequired: boolean;
  reason?: string;
}

// Smart reCAPTCHA that only appears when needed
export function SmartRecaptcha({ onVerify, isRequired, reason }: SmartRecaptchaProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (isRequired && !isLoaded) {
      // Load reCAPTCHA script only when needed
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);

      return () => {
        // Cleanup script when component unmounts
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, [isRequired, isLoaded]);

  const handleVerify = () => {
    setIsVerifying(true);
    
    // Initialize reCAPTCHA
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => {
        window.grecaptcha.render('recaptcha-container', {
          sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
          callback: (token: string) => {
            onVerify(token);
            setIsVerifying(false);
          },
          'error-callback': () => {
            setIsVerifying(false);
          }
        });
      });
    }
  };

  // Don't render if not required or if no site key configured
  if (!isRequired) return null;
  if (!import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
    // No reCAPTCHA configured — auto-pass verification
    onVerify('bypass-no-key-configured');
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800">Security Verification Required</h3>
          <p className="text-sm text-yellow-700 mt-1">
            {reason || "We've detected unusual activity. Please verify you're human to continue."}
          </p>
          
          {!isLoaded ? (
            <div className="mt-3">
              <div className="animate-pulse flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-300 rounded"></div>
                <span className="text-sm text-yellow-700">Loading security verification...</span>
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div id="recaptcha-container"></div>
              {!isVerifying && (
                <Button
                  onClick={handleVerify}
                  variant="outline"
                  size="sm"
                  className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Verify I'm Human
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to detect spammy behavior
export function useSpamDetection() {
  const [spamScore, setSpamScore] = useState(0);
  const [isSpammy, setIsSpammy] = useState(false);
  const [reason, setReason] = useState<string>('');

  const checkForSpam = (formData: any, userBehavior: any) => {
    let score = 0;
    let detectedReasons: string[] = [];

    // Check form submission speed
    if (userBehavior.submissionTime < 5000) { // Less than 5 seconds
      score += 3;
      detectedReasons.push('Form completed too quickly');
    }

    // Check for repeated submissions
    if (userBehavior.recentSubmissions > 3) {
      score += 4;
      detectedReasons.push('Multiple recent submissions detected');
    }

    // Check for suspicious email patterns
    if (formData.email && (
      formData.email.includes('temp') ||
      formData.email.includes('fake') ||
      formData.email.match(/\d{10,}/) // Long number sequences
    )) {
      score += 3;
      detectedReasons.push('Suspicious email pattern');
    }

    // Check for generic company names
    if (formData.company && (
      formData.company.toLowerCase().includes('test') ||
      formData.company.toLowerCase().includes('example') ||
      formData.company.length < 3
    )) {
      score += 2;
      detectedReasons.push('Generic company name');
    }

    // Check brand name patterns
    if (formData.brandName && (
      formData.brandName.toLowerCase().includes('test') ||
      formData.brandName.match(/^[a-z]{1,3}$/) // Very short random strings
    )) {
      score += 2;
      detectedReasons.push('Suspicious brand name');
    }

    // Check for bot-like behavior
    if (userBehavior.mouseMovements < 10) { // Very few mouse movements
      score += 2;
      detectedReasons.push('Limited user interaction');
    }

    setSpamScore(score);
    
    // Require reCAPTCHA if spam score is high
    if (score >= 5) {
      setIsSpammy(true);
      setReason(detectedReasons.length > 0 ? detectedReasons[0] : 'Unusual activity detected');
    } else {
      setIsSpammy(false);
      setReason('');
    }

    return {
      isSpammy: score >= 5,
      score,
      reasons: detectedReasons
    };
  };

  return {
    spamScore,
    isSpammy,
    reason,
    checkForSpam
  };
}

// Declare global grecaptcha for TypeScript
declare global {
  interface Window {
    grecaptcha: any;
  }
}