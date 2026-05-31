/**
 * Affiliate link tracking & promo code utilities.
 *
 * On mount (client-side), call `initAffiliateTracking()` once — it reads
 * `?ref=CODE` from the current URL and stores it in localStorage with a
 * timestamp so we can attribute sign-ups later.
 *
 * Use `getAffiliateCode()` / `getPromoCode()` anywhere you need to attach
 * tracking data to API calls.
 */

const AFFILIATE_KEY = 'ai-defense-ref';
const PROMO_KEY = 'ai-defense-promo';

// ── Affiliate (ref) ──────────────────────────────────────────────────

interface AffiliateData {
  code: string;
  timestamp: string;
}

/**
 * Call once on app mount (client-side only).
 * Reads `?ref=CODE` and persists it. If a code is already stored it will be
 * overwritten so the most-recent affiliate gets credit.
 */
export function initAffiliateTracking(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  if (ref && ref.trim()) {
    const data: AffiliateData = {
      code: ref.trim(),
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(AFFILIATE_KEY, JSON.stringify(data));
    } catch {
      // localStorage unavailable — ignore silently
    }
  }
}

/**
 * Returns the stored affiliate/ref code, or `null`.
 */
export function getAffiliateCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AFFILIATE_KEY);
    if (!raw) return null;
    const data: AffiliateData = JSON.parse(raw);
    return data.code ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns the full affiliate data object (code + timestamp), or `null`.
 */
export function getAffiliateData(): AffiliateData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AFFILIATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AffiliateData;
  } catch {
    return null;
  }
}

// ── Promo codes ───────────────────────────────────────────────────────

interface PromoData {
  code: string;
  discount_text: string;
  timestamp: string;
}

/**
 * Persist a validated promo code.
 */
export function storePromoCode(code: string, discountText: string): void {
  if (typeof window === 'undefined') return;
  const data: PromoData = {
    code,
    discount_text: discountText,
    timestamp: new Date().toISOString(),
  };
  try {
    localStorage.setItem(PROMO_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * Returns the stored promo code string, or `null`.
 */
export function getPromoCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROMO_KEY);
    if (!raw) return null;
    const data: PromoData = JSON.parse(raw);
    return data.code ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns the full promo data object (code + discount_text + timestamp), or `null`.
 */
export function getPromoData(): PromoData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROMO_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PromoData;
  } catch {
    return null;
  }
}

/**
 * Remove stored promo code (e.g. after it's been consumed).
 */
export function clearPromoCode(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PROMO_KEY);
  } catch {
    // ignore
  }
}
