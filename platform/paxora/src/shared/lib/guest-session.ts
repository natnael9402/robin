const GUEST_KEY = 'paxora_guest_id';

export function getGuestSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(GUEST_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_KEY, id);
  }
  return id;
}

export function isGuestMode(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !token;
}
