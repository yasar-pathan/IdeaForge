'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/Skeleton';

function AnalyzeInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');

  useEffect(() => {
    if (!sessionId) {
      router.replace('/');
      return;
    }
    router.replace(`/workspace/${sessionId}`);
  }, [sessionId, router]);

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-24">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Skeleton className="h-12 w-48" />
        </div>
      }
    >
      <AnalyzeInner />
    </Suspense>
  );
}
