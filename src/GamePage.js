import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Hangman from './Hangman';

export default function GamePage() {
  const { slug } = useParams();
  const title = decodeSlug(slug);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // optionally fetch on mount — commented out by default
  }, [slug]);

  function decodeSlug(s) {
    if (!s) return '';
    return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  async function runPython() {
    // Client-side runner: no backend required.
    setLoading(true);
    setOutput('');
    // simulate a small delay to mimic processing
    setTimeout(() => {
      setOutput(`JS says: ${title}`);
      setLoading(false);
    }, 200);
  }

  const hangmanBackgroundStyle = slug === 'hang-man' ? {
    backgroundImage: 'url(/imgs/forest.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center top',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100dvh',
  } : {};

  return (
    <main style={{ padding: 'clamp(8px, 3vw, 24px)', overflowX: 'hidden', ...hangmanBackgroundStyle }}>
      <div className="game-page-content" style={{ maxWidth: '100%', margin: '0 auto' }}>
        <nav style={{ marginBottom: 12 }}>
          <Link to="/games">← Back to games</Link>
        </nav>

        <h1>{title}</h1>

        <section style={{ padding: 0 }}>
          <div style={{ marginTop: 12 }}>
            {/* Render Hangman specifically for the Hang Man page */}
            {slug === 'hang-man' ? (
              <Hangman fullPage />
            ) : (
              <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8, marginTop: 12 }}>
                <p><strong>JS runner box</strong></p>
                <p>Click the button to show the game name (client-side):</p>
                <button onClick={runPython} disabled={loading} style={{ marginBottom: 8 }}>
                  {loading ? 'Running…' : 'Run JS'}
                </button>
                <pre style={{ background: '#f6f6f6', padding: 8, borderRadius: 6, overflowX: 'auto' }}>{output}</pre>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
