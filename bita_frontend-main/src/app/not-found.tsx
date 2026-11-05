import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { SearchX, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="grid min-h-[65vh] place-items-center py-20">
      <Container className="text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary-50 text-primary-600 shadow-sm border border-primary-200/80 mb-6">
          <SearchX className="size-8" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-500 shadow-xs">
          Error 404 · Page Not Found
        </span>
        <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          This dossier does not exist.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-600">
          The requested resource may have moved, or the company identifier is not registered in our current verified directory.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button href="/demo" variant="primary">
            Return Home
          </Button>
          <Button href="/demo/directory" variant="secondary" rightIcon={<ArrowRight className="size-4" />}>
            Browse Verified Directory
          </Button>
        </div>
      </Container>
    </section>
  );
}
