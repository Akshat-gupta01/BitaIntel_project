import type { BadgeKind } from '@/components/ui/Badge';

export interface VerificationBadgeInfo {
  label: string;
  kind: BadgeKind;
}

/**
 * Maps live verification/risk fields to consistent docs-compliant status badges:
 * - Green ('success'): Verified
 * - Amber ('amber'): Verification Pending / Under Review
 * - Red ('rose'): Unverified / Suspended / Policy Violation
 */
export function getVerificationStatusBadge(business: {
  verified?: boolean;
  verificationStatus?: string | null;
}): VerificationBadgeInfo {
  const status = String(business.verificationStatus || '')
    .trim()
    .toLowerCase();

  if (
    status.includes('suspend') ||
    status.includes('violation') ||
    status.includes('reject') ||
    status.includes('red_flag')
  ) {
    return {
      label: status.includes('suspend') ? 'Suspended' : 'Flagged / Restricted',
      kind: 'rose',
    };
  }

  if (
    business.verified === true ||
    status === 'verified' ||
    status === 'approved' ||
    status === 'bitaintel_verified'
  ) {
    return {
      label: 'Verified',
      kind: 'success',
    };
  }

  if (
    status.includes('pending') ||
    status.includes('review') ||
    status.includes('submit')
  ) {
    return {
      label: 'Verification Pending',
      kind: 'amber',
    };
  }

  return {
    label: 'Unverified',
    kind: 'rose',
  };
}

/**
 * Resolves a stored upload path (e.g. /uploads/documents/...) to a downloadable URL
 * targeting the active backend origin.
 */
export function resolveBackendDocumentUrl(rawPath?: string | null): string | null {
  const raw = String(rawPath || '').trim();
  if (!raw || (!raw.startsWith('/uploads/') && !/^https?:\/\//i.test(raw))) {
    return null;
  }
  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  const configuredApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const apiBase =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    configuredApi.includes('192.168.')
      ? 'http://localhost:3000/api/v1'
      : configuredApi;
  const origin = apiBase.replace(/\/api\/v1\/?$/, '');
  return `${origin}${raw.startsWith('/') ? '' : '/'}${raw}`;
}

/**
 * Formats business location consistently as "City, State, Country".
 */
export function formatBusinessLocation(business: {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  location?: string | null;
}): string {
  const city = String(business.city || '').trim();
  const state = String(business.state || '').trim();
  const country = String(business.country || 'India').trim();
  const rawParts = [city, state, country].filter(Boolean);
  const uniqueParts = rawParts.filter(
    (part, idx) => rawParts.findIndex((p) => p.toLowerCase() === part.toLowerCase()) === idx
  );
  if (uniqueParts.length >= 2) {
    return uniqueParts.join(', ');
  }
  const fallback = String(business.location || '').trim();
  return fallback || uniqueParts.join(', ') || 'India';
}
