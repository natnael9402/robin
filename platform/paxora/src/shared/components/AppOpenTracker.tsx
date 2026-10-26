'use client';

import { useEffect, useRef } from 'react';
import { activityApi } from '../api';

function getAppName() {
  if (typeof window === 'undefined') return 'unknown';
  const host = window.location.hostname.toLowerCase();
  if (host.includes('paxora')) return 'paxora';
  return 'frontend';
}

export function AppOpenTracker() {
  const sentRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sentRef.current) return;
    const key = 'robin_app_open_tracked';
    try {
      if (sessionStorage.getItem(key)) {
        sentRef.current = true;
        return;
      }
      sessionStorage.setItem(key, '1');
    } catch {
      // ignore storage failures
    }
    sentRef.current = true;
    const app = getAppName();
    void activityApi
      .appOpen({ app, path: window.location.pathname, referrer: document.referrer || null })
      .catch(() => {
        // telemetry must never block the UI
      });
  }, []);

  return null;
}
