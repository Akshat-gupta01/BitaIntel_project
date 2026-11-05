import { Container } from '@/components/layout/Container';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <section className="py-16">
      <Container>
        <div className="space-y-4 max-w-xl mb-10">
          <Skeleton className="h-8 w-48 rounded-full" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-4 w-3/4 rounded-full" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur-xl shadow-xs space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-16 w-full rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
