import { useState, useEffect } from 'react';

/**
 * Delays updating a value until the user stops typing.
 * Extracted from Formations.jsx.
 *
 * @example
 * const debouncedSearch = useDebounce(searchInput, 500);
 */
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default useDebounce;