interface TickerItem {
  text: string;
}

const TICKER_ITEMS: TickerItem[] = [
  { text: 'Maharashtra leads with 31.2% health insurance penetration' },
  { text: 'LIC settles 98.6% of term claims in FY25' },
  { text: 'Bihar records lowest claim settlement ratio at 71%' },
  { text: 'IRDAI mandates faster claim settlements by Q3 FY26' },
  { text: 'PM-JAY covers over 55 crore beneficiaries across 28 states' },
  { text: 'Only 4.2% of India\'s population has any health cover' },
];

const Separator = () => (
  <span
    aria-hidden
    style={{ color: 'var(--saffron)', margin: '0 var(--space-3)', opacity: 0.6 }}
  >
    ›
  </span>
);

export default function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      role="marquee"
      aria-label="Insurance news ticker"
      style={{
        position: 'fixed',
        top: 64,
        width: '100%',
        height: 36,
        zIndex: 40,
        background: 'var(--bg-overlay)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <div
        className="ticker-inner"
        style={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}
      >
        {doubled.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                fontWeight: 400,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 var(--space-4)',
              }}
            >
              {item.text}
            </span>
            <Separator />
          </span>
        ))}
      </div>
    </div>
  );
}
