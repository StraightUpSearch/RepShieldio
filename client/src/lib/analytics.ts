export async function trackClientEvent(eventType: string, metadata?: any): Promise<void> {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventType, metadata, sessionId: getSessionId() }),
    });
  } catch {
    // Silent failure — analytics should never block UX
  }
}

function getSessionId(): string {
  let id = sessionStorage.getItem('repshield_session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('repshield_session', id);
  }
  return id;
}
