import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? 'IdeaForge Analysis';
  const scoreRaw = searchParams.get('score') ?? '';
  const category = searchParams.get('category') ?? 'Startup';
  const score = Number(scoreRaw);
  const scoreColor = Number.isFinite(score) ? (score > 70 ? '#22c55e' : score > 40 ? '#f59e0b' : '#ef4444') : '#7C6EFA';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '54px',
          background:
            'radial-gradient(circle at top right, rgba(124,110,250,0.25), transparent 40%), linear-gradient(135deg, #09090f, #111827)',
          color: '#fff',
          fontFamily: 'Inter, Arial, sans-serif',
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 700, color: '#a78bfa' }}>IdeaForge</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32 }}>
          <div style={{ maxWidth: 860 }}>
            <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.12 }}>{title}</div>
            <div
              style={{
                marginTop: 24,
                fontSize: 26,
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '10px 18px',
                borderRadius: 999,
                width: 'fit-content',
                color: '#d1d5db',
              }}
            >
              {category}
            </div>
          </div>
          <div
            style={{
              width: 190,
              height: 190,
              borderRadius: 999,
              border: `8px solid ${scoreColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 56,
              fontWeight: 900,
              color: scoreColor,
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            {Number.isFinite(score) ? score : '--'}
          </div>
        </div>
        <div style={{ fontSize: 28, color: '#c4b5fd' }}>Analyze your idea at ideaforge.app</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
