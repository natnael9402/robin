'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    HubSpotConversations?: {
      widget: {
        load: (opts?: { widgetOpen?: boolean }) => void;
        open: () => void;
        close: () => void;
        identify: (data: { email?: string; name?: string }) => void;
        status: () => { loaded: boolean };
      };
      on: (event: string, cb: (payload: unknown) => void) => void;
      off: (event: string, cb: (payload: unknown) => void) => void;
      clear: (opts?: { resetWidget?: boolean }) => void;
    };
  }
}

const HS_COOKIE_NAMES = [
  'messagesUtk', 'hs-messages-is-open', 'hs-messages-hide-welcome-message',
  '__hstc', 'hubspotutk', '__hssc', '__hssrc', '__hsec',
];

function deleteAllHsCookies() {
  const domains = [window.location.hostname, '.' + window.location.hostname];
  document.cookie.split(';').forEach((c) => {
    const n = c.split('=')[0].trim();
    if (HS_COOKIE_NAMES.includes(n) || n.toLowerCase().includes('hubspot') || n.toLowerCase().includes('messages') || n.startsWith('hs_') || n.startsWith('hs-')) {
      domains.forEach((d) => {
        document.cookie = `${n}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${d}`;
        document.cookie = `${n}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${d};SameSite=None;Secure`;
      });
      document.cookie = `${n}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  });
}

function deleteHubspotIndexedDB() {
  try {
    indexedDB.databases?.().then((dbs) => {
      dbs.forEach((db) => {
        if (db.name && (db.name.toLowerCase().includes('hubspot') || db.name.toLowerCase().includes('messages') || db.name.toLowerCase().includes('hs_'))) {
          indexedDB.deleteDatabase(db.name);
        }
      });
    });
  } catch {}
}

function suppressWelcomeMessage() {
  const expires = 'Thu, 01 Jan 2099 00:00:00 GMT';
  document.cookie = `hs-messages-hide-welcome-message=true;expires=${expires};path=/;SameSite=Lax`;
  document.cookie = `hs-messages-hide-welcome-message=true;expires=${expires};path=/;domain=${window.location.hostname};SameSite=Lax`;
}

export function nukeHubspot() {
  try { window.HubSpotConversations?.clear({ resetWidget: true }); } catch {}
  document.getElementById('hubspot-messages-iframe-container')?.remove();
  document.querySelectorAll('script[src*="hs-scripts"], script[src*="hubspot"]').forEach((el) => el.remove());
  deleteAllHsCookies();
  deleteHubspotIndexedDB();
  try { delete (window as unknown as Record<string, unknown>).HubSpotConversations; } catch {}
  suppressWelcomeMessage();
  try {
    Object.keys(localStorage)
      .filter((k) => k.toLowerCase().includes('hubspot') || k.toLowerCase().includes('messages') || k.startsWith('hs_'))
      .forEach((k) => localStorage.removeItem(k));
  } catch {}
  try { sessionStorage.clear(); } catch {}
}

function loadScript() {
  if (document.querySelector('script[src*="hs-scripts"]')) return;
  const script = document.createElement('script');
  script.src = '//js-eu1.hs-scripts.com/148892423.js';
  script.async = true;
  document.body.appendChild(script);
}

function waitForWidgetReady(cb: (hs: NonNullable<Window['HubSpotConversations']>) => void) {
  const hs = window.HubSpotConversations;
  if (hs && hs.widget.status().loaded) { cb(hs); return; }

  let tries = 0;
  const poll = setInterval(() => {
    tries++;
    const sdk = window.HubSpotConversations;
    if (sdk && sdk.widget.status().loaded) { clearInterval(poll); cb(sdk); }
    if (tries >= 200) {
      clearInterval(poll);
      if (sdk) cb(sdk);
    }
  }, 200);
}

export function HubSpotIdentify() {
  const { user, isAuthenticated } = useAuth();
  const wasAuthenticated = useRef(false);
  const identifiedEmail = useRef('');
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    suppressWelcomeMessage();

    if (!isAuthenticated || !user) {
      if (wasAuthenticated.current) {
        wasAuthenticated.current = false;
        identifiedEmail.current = '';
        nukeHubspot();
        loadScript();
      }
      return;
    }

    wasAuthenticated.current = true;
    identifiedEmail.current = user.email;

    if (cleanupRef.current) { cleanupRef.current(); cleanupRef.current = null; }

    const email = user.email;
    const name = user.name || user.email;

    waitForWidgetReady((hs) => {
      try { hs.widget.identify({ email, name }); } catch {}

      const onReady = () => {
        if (identifiedEmail.current) {
          try { hs.widget.identify({ email: identifiedEmail.current, name }); } catch {}
        }
      };
      hs.on('widgetReady', onReady);
      cleanupRef.current = () => hs.off('widgetReady', onReady);
    });
  }, [user, isAuthenticated]);

  useEffect(() => {
    return () => { cleanupRef.current?.(); };
  }, []);

  return null;
}
