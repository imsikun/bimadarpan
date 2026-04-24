import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function HealthCheckCTA() {
  return (
    <div
      style={{
        background: 'var(--bg-data)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5)',
        border: '1px solid rgba(255,153,51,0.10)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -48,
          right: -48,
          width: 96,
          height: 96,
          background: 'rgba(255,153,51,0.20)',
          filter: 'blur(40px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      <h4
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-md)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
          marginBottom: 'var(--space-4)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        Is your family fully protected?
      </h4>

      <Link
        href="/health-check"
        className="btn-primary"
        style={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-3) var(--space-4)',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 0 0 rgba(255,153,51,0)',
          transition: 'box-shadow var(--dur-default)',
          textDecoration: 'none',
        }}
      >
        Run Health Check
        <Zap size={16} strokeWidth={1.5} />
      </Link>
    </div>
  );
}
