'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',             label: 'Map' },
  { href: '/quiz',         label: 'Quiz' },
  { href: '/health-check', label: 'Health Check' },
  { href: '/leaderboard',  label: 'Leaderboard' },
  { href: '/news',         label: 'News' },
];

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        fontWeight: isActive ? 600 : 500,
        color: isActive || hovered ? 'var(--saffron)' : 'var(--text-tertiary)',
        background: isActive ? 'rgba(255,153,51,0.10)' : 'transparent',
        borderRadius: 'var(--radius-full)',
        padding: '6px 16px',
        transition: 'all var(--dur-fast) var(--ease-default)',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Link>
  );
}

export default function Topnav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        width: '100%',
        height: 64,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-10)',
        background: 'rgba(8,8,16,0.90)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--saffron), #e8891e)',
            boxShadow: '0 4px 16px var(--saffron-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Shield size={16} strokeWidth={1.5} color="rgba(0,0,0,0.75)" />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--text-md)',
            color: 'var(--saffron)',
            letterSpacing: '-0.02em',
          }}
        >
          BimaDarpan
        </span>
      </div>

      {/* Nav Links — hidden on mobile */}
      <div
        className="hidden md:flex"
        style={{ alignItems: 'center', gap: 'var(--space-1)' }}
      >
        {NAV_LINKS.map(({ href, label }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            isActive={pathname === href}
          />
        ))}
      </div>

    </nav>
  );
}
