/// <reference types="vite/client" />

interface Window {
  Telegram?: {
    WebApp?: {
      initDataUnsafe?: {
        user?: {
          id?: number;
          first_name?: string;
        };
      };
      ready?: () => void;
      expand?: () => void;
      openLink?: (url: string) => void;
      HapticFeedback?: {
        impactOccurred?: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
      };
    };
  };
}
