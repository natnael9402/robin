export interface HubspotNotifyPayload {
  userName: string;
  userEmail: string;
  message: string;
  subject?: string;
  priority?: string;
}

export function notifyHubspot(payload: HubspotNotifyPayload): void {
  if (typeof window === 'undefined') return;
  fetch('/api/hubspot-notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
}
