'use client';

import { useState, useRef } from 'react';
import { Send } from 'lucide-react';

interface AIQueryBarProps {
  selectedStateName?: string;
}

const SUGGESTION_CHIPS = [
  'Top claim states',
  'Life insurance growth',
  'Premium trends',
];

export default function AIQueryBar({ selectedStateName }: AIQueryBarProps) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(text: string) {
    const q = text.trim();
    if (!q || isLoading) return;
    setIsLoading(true);
    setAnswer(null);
    try {
      const res = await fetch('/api/map-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, stateData: selectedStateName ?? null }),
      });
      const { answer: a } = await res.json();
      setAnswer(a ?? 'No response.');
    } catch {
      setAnswer('Could not reach intelligence service.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleChip(chip: string) {
    setQuery(chip);
    handleSubmit(chip);
    inputRef.current?.focus();
  }

  return (
    <div>
      {/* Input row */}
      <div className="ai-input-wrap" style={{ marginBottom: 'var(--space-4)' }}>
        <input
          ref={inputRef}
          className="ai-input"
          type="text"
          placeholder="Ask about coverage…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { handleSubmit(query); setQuery(''); }
          }}
          disabled={isLoading}
        />
        <button
          className="ai-send-btn"
          onClick={() => { handleSubmit(query); setQuery(''); }}
          disabled={!query.trim() || isLoading}
          aria-label="Send query"
        >
          <Send size={13} strokeWidth={1.5} color="rgba(0,0,0,0.8)" />
        </button>
      </div>

      {/* Suggestion chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: answer ? 'var(--space-4)' : 0 }}>
        {SUGGESTION_CHIPS.map((chip) => (
          <button key={chip} className="chip" onClick={() => handleChip(chip)}>
            {chip}
          </button>
        ))}
      </div>

      {/* AI response */}
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
          <div
            style={{
              width: 14, height: 14,
              border: '1.5px solid var(--border-default)',
              borderTopColor: 'var(--saffron)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Sentinel is thinking…
          </span>
        </div>
      )}

      {answer && !isLoading && (
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'rgba(255,153,51,0.05)',
            border: '1px solid var(--saffron-border)',
            borderRadius: 'var(--radius-md)',
            animation: 'fade-up 250ms var(--ease-default) both',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
            }}
          >
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
