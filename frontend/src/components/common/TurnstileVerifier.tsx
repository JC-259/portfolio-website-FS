import React, { useState, createContext, useContext } from 'react';
import Turnstile from 'react-turnstile';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';
if (!SITE_KEY) {
  console.warn('VITE_TURNSTILE_SITE_KEY is not defined');
}

type CaptchaContextType = {
  verified: boolean;
  verify: (token: string) => void;
};

const CaptchaContext = createContext<CaptchaContextType | undefined>(undefined);

export const useCaptcha = (): CaptchaContextType => {
  const context = useContext(CaptchaContext);
  if (!context) {
    throw new Error('useCaptcha must be used within a CaptchaProvider');
  }
  return context;
};

export const CaptchaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [verified, setVerified] = useState<boolean>(() => {
    const data = localStorage.getItem('captchaVerified');
    const parsed = data ? JSON.parse(data) : null;
    const isRecent = parsed?.timestamp && (Date.now() - parsed.timestamp < 3600000); // 1 hour
    return parsed?.verified && isRecent;
  });

  const verify = async (token: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/verify-turnstile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_API_KEY
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      if (result.success) {
        localStorage.setItem('captchaVerified', JSON.stringify({ verified: true, timestamp: Date.now() }));
        setVerified(true);
      } else {
        console.error('Turnstile verification failed');
      }
    } catch (err) {
      console.error('Error verifying Turnstile:', err);
    }
  };

  return (
      <CaptchaContext.Provider value={{ verified, verify }}>
        {children}
      </CaptchaContext.Provider>
  );
};

const TurnstileVerifier: React.FC = () => {
  const { verified, verify } = useCaptcha();

  const handleSuccess = (token: string) => {
    verify(token);
  };

  return (
      <>
        {!verified && (
            <Turnstile
                sitekey={SITE_KEY}
                onSuccess={handleSuccess}
                theme="auto"
                size="invisible"
            />
        )}
      </>
  );
};

export default TurnstileVerifier;