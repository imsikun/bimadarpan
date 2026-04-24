import { NationalStatsSkeleton } from '@/components/sidebar/NationalStats';
import { NewsCardSkeleton } from '@/components/news/NewsCard';
import { LeaderboardPreviewSkeleton } from '@/components/sidebar/LeaderboardPreview';

export default function Loading() {
  return (
    <main
      className="page-enter"
      style={{ paddingTop: 100, minHeight: '100vh', position: 'relative' }}
    >
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: 'var(--space-12) var(--space-6)' }}>
        {/* Page header */}
        <header style={{ marginBottom: 'var(--space-12)' }}>
          <div className="skeleton" style={{ height: 40, width: 220, borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)' }} />
          <div className="skeleton" style={{ height: 16, width: 480, borderRadius: 'var(--radius-sm)' }} />
        </header>

        {/* 12-col grid: left 7 cols + right 5 cols */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-8)',
            alignItems: 'start',
          }}
          className="lg:grid-cols-[7fr_5fr]"
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Section label + live badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="skeleton" style={{ height: 22, width: 160, borderRadius: 'var(--radius-sm)' }} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: '4px 12px',
                  background: 'var(--teal-dim)',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <div
                  style={{
                    width: 8, height: 8,
                    background: 'var(--teal)',
                    borderRadius: '50%',
                    animation: 'pulse-live 2s ease-in-out infinite',
                  }}
                />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--teal)' }}>
                  Real-time sync
                </span>
              </div>
            </div>

            <NationalStatsSkeleton />

            {/* Intelligence Briefing */}
            <div style={{ marginTop: 'var(--space-12)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="skeleton" style={{ height: 22, width: 180, borderRadius: 'var(--radius-sm)' }} />
              <NewsCardSkeleton />
            </div>
          </div>

          {/* Right column */}
          <LeaderboardPreviewSkeleton />
        </div>
      </div>
    </main>
  );
}
