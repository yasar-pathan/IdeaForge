import Link from 'next/link';

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  await params;
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-zinc-100 flex flex-col items-center justify-center gap-4 px-6">
      <p className="text-zinc-400 text-sm text-center max-w-md">
        Public share links can be wired to load analyses by token. For now, open your analysis from
        the dashboard after signing in.
      </p>
      <Link href="/dashboard" className="text-indigo-400 text-sm">
        Go to dashboard
      </Link>
    </div>
  );
}
