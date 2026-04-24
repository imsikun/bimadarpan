interface LiveIndicatorProps {
  wrapped?: boolean; // wraps in pill container — default true
}

export default function LiveIndicator({ wrapped = true }: LiveIndicatorProps) {
  const dot = <span className="live-dot" />;
  const text = <span className="live-text">Live</span>;

  if (!wrapped) {
    return (
      <span className="live-indicator">
        {dot}
        {text}
      </span>
    );
  }

  return (
    <div
      className="live-indicator"
      style={{
        background: 'var(--teal-dim)',
        border: '1px solid rgba(0,212,170,0.15)',
        borderRadius: 'var(--radius-full)',
        padding: '6px 16px',
      }}
    >
      {dot}
      {text}
    </div>
  );
}
