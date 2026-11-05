import { ComingSoon } from '@/components/shared/ComingSoon';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata({
  title: 'Coming Soon — B2B Verification & Trust Platform',
  description:
    'BITAINTEL is India’s dedicated B2B verification and business intelligence platform. Governed by "Verify Before You Trust". Coming Soon.',
  pathname: '/coming-soon',
  noIndex: true,
});

export default function Page() {
  return <ComingSoon />;
}
