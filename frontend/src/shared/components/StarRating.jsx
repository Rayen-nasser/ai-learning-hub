import { useState } from 'react';

/**
 * Reusable star rating — interactive or read-only.
 *
 * @param {number}   value     - Current rating (1–5)
 * @param {function} onChange  - Called with the new value when clicked
 * @param {boolean}  readonly  - Disables interaction when true
 * @param {number}   size      - Icon size in px (default 20, readonly defaults to 14)
 *
 * @example
 * <StarRating value={4} onChange={(n) => setRating(n)} />
 * <StarRating value={3.5} readonly />
 */
function StarRating({ value, onChange, readonly = false, size }) {
  const [hovered, setHovered] = useState(0);
  const iconSize = size ?? (readonly ? 14 : 20);
  const display  = hovered || value;

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          style={{
            background: 'none', border: 'none', padding: 2,
            cursor: readonly ? 'default' : 'pointer',
            transition: 'transform 0.1s',
          }}
          onMouseEnter={() => !readonly && setHovered(n)}
          onMouseLeave={() => !readonly && setHovered(0)}
          onClick={() => onChange?.(n)}
          onMouseDown={(e) => { if (!readonly) e.currentTarget.style.transform = 'scale(0.9)'; }}
          onMouseUp={(e)   => { if (!readonly) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg
            width={iconSize} height={iconSize}
            viewBox="0 0 24 24"
            fill={n <= display ? '#b4915a' : 'none'}
            stroke={n <= display ? '#b4915a' : '#333'}
            strokeWidth="2"
            style={{ transition: 'fill 0.15s, stroke 0.15s' }}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default StarRating;