import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import formationService from '../../services/formations';
import useDebounce from '../../../shared/hooks/useDebounce';

const INITIAL_FILTERS = {
  search: '', categorieId: '', centreId: '',
  prixMin: '', prixMax: '', dureeMax: '',
};

/**
 * All filter state + data fetching for the Formations page.
 * Keeps Formations.jsx focused purely on rendering.
 *
 * @example
 * const { formations, filters, setFilter, loading, error } = useFormations();
 */
function useFormations() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search:      searchParams.get('search')      || '',
    categorieId: searchParams.get('categorieId') || '',
    centreId:    searchParams.get('centreId')    || '',
    prixMin:     searchParams.get('prixMin')     || '',
    prixMax:     searchParams.get('prixMax')     || '',
    dureeMax:    searchParams.get('dureeMax')    || '',
  });

  // Local inputs for fields that benefit from debouncing
  const [localSearch,  setLocalSearch]  = useState(filters.search);
  const [localPrixMin, setLocalPrixMin] = useState(filters.prixMin);
  const [localPrixMax, setLocalPrixMax] = useState(filters.prixMax);
  const [localDuree,   setLocalDuree]   = useState(filters.dureeMax);

  const debouncedPrixMin = useDebounce(localPrixMin, 600);
  const debouncedPrixMax = useDebounce(localPrixMax, 600);
  const debouncedDuree   = useDebounce(localDuree,   600);

  useEffect(() => setFilters((f) => ({ ...f, prixMin: debouncedPrixMin })), [debouncedPrixMin]);
  useEffect(() => setFilters((f) => ({ ...f, prixMax: debouncedPrixMax })), [debouncedPrixMax]);
  useEffect(() => setFilters((f) => ({ ...f, dureeMax: debouncedDuree  })), [debouncedDuree]);

  const [formations, setFormations] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    setSearchParams(params, { replace: true });

    setLoading(true);
    setError('');
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v)
    );
    formationService
      .getAll(activeFilters)
      .then((res) => {
        const data = res.data.data ?? res.data;
        setFormations(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err.response?.status === 404) setFormations([]);
        else setError('Failed to load courses. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key, value) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const removeFilter = (keys) => {
    setFilters((f) => {
      const next = { ...f };
      keys.forEach((k) => { next[k] = ''; });
      return next;
    });
    if (keys.includes('search'))  setLocalSearch('');
    if (keys.includes('prixMin')) setLocalPrixMin('');
    if (keys.includes('prixMax')) setLocalPrixMax('');
    if (keys.includes('dureeMax')) setLocalDuree('');
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setLocalSearch(''); setLocalPrixMin('');
    setLocalPrixMax(''); setLocalDuree('');
  };

  const submitSearch = () => setFilter('search', localSearch);

  const activeCount = Object.values(filters).filter(Boolean).length;

  return {
    formations,
    loading,
    error,
    filters,
    setFilter,
    removeFilter,
    clearFilters,
    submitSearch,
    activeCount,
    hasActiveFilters: activeCount > 0,
    // local input state (for controlled inputs)
    localSearch,  setLocalSearch,
    localPrixMin, setLocalPrixMin,
    localPrixMax, setLocalPrixMax,
    localDuree,   setLocalDuree,
  };
}

export default useFormations;