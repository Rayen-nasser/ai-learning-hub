/**
 * Centered loading spinner.
 *
 * @param {string} size    - 'sm' | 'md' | 'lg'  (default 'md')
 * @param {string} color   - Border top color (default brand gold)
 *
 * @example
 * if (loading) return <LoadingSpinner />;
 * if (loading) return <LoadingSpinner size="sm" />;
 */
function LoadingSpinner({ size = 'md', color = '#b4915a' }) {
  const sizes = { sm: 20, md: 32, lg: 48 };
  const px = sizes[size] ?? sizes.md;

  return (
    <>
      <style>{`
        @keyframes _spin { to { transform: rotate(360deg); } }
        ._spinner { animation: _spin 0.8s linear infinite; border-radius: 50%; }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div
          className="_spinner"
          style={{
            width: px, height: px,
            border: '2px solid rgba(255,255,255,0.06)',
            borderTopColor: color,
          }}
        />
      </div>
    </>
  );
}

export default LoadingSpinner;