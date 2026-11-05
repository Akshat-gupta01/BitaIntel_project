'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
import { Container } from '@/components/layout/Container';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="grid min-h-[60vh] place-items-center py-20">
      <Container className="text-center max-w-md">
        <div className="mx-auto size-16 rounded-3xl bg-red-50 text-red-600 grid place-items-center mb-6 border border-red-200">
          <AlertCircle className="size-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          The requested dossier or application state encountered an unexpected error. Please try reloading the view.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="dark" onClick={() => reset()}>
            Try Again
          </Button>
          <Button variant="secondary" href="/demo">
            Go to Homepage
          </Button>
        </div>
      </Container>
    </section>
  );
}
