/**
 * Meta Pixel & Conversions API (CAPI) Instant Non-Blocking Tracking
 * Pixel ID: 1441255181536689
 */

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

export const META_PIXEL_ID = '1441255181536689';

export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Fast non-blocking event tracking using sendBeacon or keepalive fetch.
 * Does not block user navigation.
 */
export function trackFastEvent(
  eventName: string,
  amountVal?: number,
  donorName?: string
) {
  const val = amountVal || 50;
  const eventId = generateEventId();

  // 1. Non-blocking client-side Pixel tracking
  try {
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('trackSingle', META_PIXEL_ID, eventName, {
        value: val,
        currency: 'BRL',
        content_name: 'Cirurgia da Cachorrinha Mel',
        content_category: 'Saúde Veterinária'
      }, { eventID: eventId });
    }
  } catch (err) {
    // ignore
  }

  // 2. Non-blocking server-side CAPI tracking via sendBeacon / keepalive
  try {
    const payload = JSON.stringify({
      event_name: eventName,
      event_id: eventId,
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
      user_data: donorName ? { fn: donorName } : {},
      custom_data: {
        value: val,
        currency: 'BRL',
        content_name: 'Cirurgia da Cachorrinha Mel'
      }
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/meta-event', blob);
    } else {
      fetch('/api/meta-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  } catch (err) {
    // ignore
  }

  return eventId;
}
