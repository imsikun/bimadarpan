import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type  = searchParams.get('type');
  const score = searchParams.get('score');
  const grade = searchParams.get('grade');
  const fact  = searchParams.get('fact');

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          background: '#080810',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
          BimaDarpan
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, color: '#FF9933' }}>
          {score}
        </div>
        <div style={{ fontSize: 32, color: '#fff', marginTop: 8 }}>
          {grade}
        </div>
        {fact && (
          <div style={{
            fontSize: 20, color: 'rgba(255,255,255,0.6)',
            marginTop: 24, maxWidth: 800, textAlign: 'center',
          }}>
            {fact}
          </div>
        )}
        <div style={{ fontSize: 18, color: '#FF9933', marginTop: 40 }}>
          {type === 'health'
            ? 'Get your free check at bimadarpan.in'
            : 'Test yourself at bimadarpan.in'}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
