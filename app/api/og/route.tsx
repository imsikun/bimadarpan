import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const score     = searchParams.get('score')    || '7';
  const total     = searchParams.get('total')    || '10';
  const grade     = searchParams.get('grade')    || 'Smart';
  const shockStat = searchParams.get('stat')     || '';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          background: '#080810',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'sans-serif', padding: '60px',
        }}
      >
        <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.1em', marginBottom: 24 }}>
          BIMADARPAN · INSURANCE REALITY CHECK
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, color: '#FF9933', lineHeight: 1 }}>
          {score} / {total}
        </div>
        <div style={{ fontSize: 32, color: '#ffffff', marginTop: 16, fontWeight: 600 }}>
          {grade}
        </div>
        {shockStat ? (
          <div
            style={{
              fontSize: 18, color: 'rgba(255,255,255,0.55)',
              marginTop: 32, maxWidth: 700, textAlign: 'center',
              lineHeight: 1.5, fontStyle: 'italic',
            }}
          >
            &ldquo;{shockStat}&rdquo;
          </div>
        ) : null}
        <div style={{ fontSize: 18, color: '#FF9933', marginTop: 48 }}>
          Can you beat this? → bimadarpan.in/quiz
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
