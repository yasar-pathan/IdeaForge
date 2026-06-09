import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/backend/lib/supabase/server';

async function getSessionByToken(token: string) {
  const { data } = await supabaseAdmin
    .from('idea_sessions')
    .select('id, idea_title, idea_category, is_public, success_probability(overall_score), pitch_speech(full_speech), market_research(tam_label,sam_label,som_label)')
    .eq('share_token', token)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getSessionByToken(token);
  if (!session || !session.is_public) {
    return { title: 'Shared analysis not found — IdeaForge' };
  }
  const score = (session.success_probability as { overall_score?: number } | null)?.overall_score ?? '';
  const title = session.idea_title || 'Idea';
  const category = session.idea_category || '';
  return {
    title: `${title} — IdeaForge Analysis`,
    description: `AI-generated startup analysis. Success score: ${score}/100`,
    openGraph: {
      title,
      description: `Success Score: ${score}/100 — Full analysis on IdeaForge`,
      images: [
        `/api/og?title=${encodeURIComponent(title)}&score=${encodeURIComponent(String(score))}&category=${encodeURIComponent(category)}`,
      ],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getSessionByToken(token);
  if (!session || !session.is_public) notFound();

  const score = (session.success_probability as { overall_score?: number } | null)?.overall_score ?? null;
  const pitch = (session.pitch_speech as { full_speech?: string } | null)?.full_speech ?? '';
  const market = (session.market_research as { tam_label?: string; sam_label?: string; som_label?: string } | null) ?? {};

  return (
    <div className="min-h-screen bg-[#0A0A0F] px-4 py-16 text-zinc-100">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[#111118]/70 p-8 backdrop-blur">
        <p className="mb-2 text-sm text-zinc-400">Public IdeaForge Analysis</p>
        <h1 className="font-display text-3xl font-bold">{session.idea_title || 'Untitled idea'}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          {session.idea_category ? (
            <span className="rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-indigo-200">
              {session.idea_category}
            </span>
          ) : null}
          {score != null ? (
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
              Success score: {score}/100
            </span>
          ) : null}
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Pitch summary</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {pitch || 'Pitch summary is not available yet for this shared analysis.'}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Market snapshot</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <p className="text-zinc-400">TAM</p>
              <p className="mt-1 font-medium">{market.tam_label || 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <p className="text-zinc-400">SAM</p>
              <p className="mt-1 font-medium">{market.sam_label || 'N/A'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
              <p className="text-zinc-400">SOM</p>
              <p className="mt-1 font-medium">{market.som_label || 'N/A'}</p>
            </div>
          </div>
        </section>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
          >
            Analyze YOUR idea
          </Link>
        </div>
      </div>
    </div>
  );
}
