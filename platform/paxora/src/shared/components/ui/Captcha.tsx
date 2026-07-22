'use client';

import { useEffect, useRef } from 'react';
import { config } from '../../lib/config';

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement | string, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface CaptchaProps {
  onVerify: (token: string | null) => void;
  theme?: 'light' | 'dark' | 'auto';
}

export function Captcha({ onVerify, theme = 'auto' }: CaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const cbRef = useRef(onVerify);

  useEffect(() => {
    cbRef.current = onVerify;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const verify = (token: string) => cbRef.current(token);
    const expire = () => cbRef.current(null);
    const error = () => cbRef.current(null);

    const render = () => {
      if (!window.turnstile || !containerRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: config.turnstileSiteKey,
        callback: verify,
        'expired-callback': expire,
        'error-callback': error,
        theme,
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.defer = true;
      s.onload = render;
      document.head.appendChild(s);
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch { /* ok */ }
      }
    };
  }, [theme]);

  return <div ref={containerRef} className="flex justify-center w-full" />;
}
