import { useEffect, useState } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export const useTelegram = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        setIsTelegram(true);
        
        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        }
        
        tg.expand();
        tg.headerColor = '#1f2937';
        tg.backgroundColor = '#111827';
      }
    };

    if (typeof window !== 'undefined') {
      initTelegram();
    }
  }, []);

  return { user, isTelegram };
};