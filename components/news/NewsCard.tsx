import { NewsItem } from '@/types';

interface NewsCardProps {
  item: NewsItem;
}

export function NewsCardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
        padding: 'var(--space-6)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', gap: 'var(--space-6)' }}>
        {/* Thumbnail */}
        <div
          className="skeleton"
          style={{
            width: 192,
            minHeight: 192,
            borderRadius: 'var(--radius-lg)',
            flexShrink: 0,
          }}
        />

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingTop: 'var(--space-2)' }}>
          {/* Badge */}
          <div className="skeleton" style={{ height: 24, width: 96, borderRadius: 'var(--radius-full)' }} />

          {/* Headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <div className="skeleton" style={{ height: 32, width: '100%', borderRadius: 'var(--radius-sm)' }} />
            <div className="skeleton" style={{ height: 32, width: '80%', borderRadius: 'var(--radius-sm)' }} />
          </div>

          {/* Summary */}
          <div className="skeleton" style={{ height: 16, width: '92%', borderRadius: 2 }} />

          {/* Footer */}
          <div style={{ paddingTop: 'var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="skeleton" style={{ height: 12, width: 128, borderRadius: 'var(--radius-full)' }} />
            <div className="skeleton" style={{ height: 32, width: 96, borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewsCard({ item }: NewsCardProps) {
  return <div>{item.title}</div>;
}
