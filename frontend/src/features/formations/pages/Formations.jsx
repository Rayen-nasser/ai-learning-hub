import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { formationService, categorieService, centreService } from '../../../services/api';

const GLYPHS = ['Aa', 'Bb', 'Cc', 'Dd', 'Ee', 'Ff', 'Gg', 'Hh', 'Ii', 'Jj', 'Kk', 'Ll'];

/* ─── tiny debounce hook ─── */
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const Formations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formations, setFormations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiError, setApiError] = useState('');

  /* ── Filter state ── */
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categorieId: searchParams.get('categorieId') || '',
    centreId: searchParams.get('centreId') || '',
    prixMin: searchParams.get('prixMin') || '',
    prixMax: searchParams.get('prixMax') || '',
    dureeMax: searchParams.get('dureeMax') || '',
  });

  /* Local input states — number fields are debounced so we don't fire on every keystroke */
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [localPrixMin, setLocalPrixMin] = useState(filters.prixMin);
  const [localPrixMax, setLocalPrixMax] = useState(filters.prixMax);
  const [localDuree, setLocalDuree] = useState(filters.dureeMax);

  const debouncedPrixMin = useDebounce(localPrixMin, 600);
  const debouncedPrixMax = useDebounce(localPrixMax, 600);
  const debouncedDuree = useDebounce(localDuree, 600);

  /* Apply debounced number values to filters */
  useEffect(() => { setFilters(f => ({ ...f, prixMin: debouncedPrixMin })); }, [debouncedPrixMin]);
  useEffect(() => { setFilters(f => ({ ...f, prixMax: debouncedPrixMax })); }, [debouncedPrixMax]);
  useEffect(() => { setFilters(f => ({ ...f, dureeMax: debouncedDuree })); }, [debouncedDuree]);

  /* Load categories + centres once */
  useEffect(() => {
    const calls = [categorieService.getAll(), centreService.getAll()];
    Promise.all(calls)
      .then(([catRes, centreRes]) => {
        setCategories(catRes.data.data || catRes.data);
        setCentres(centreRes.data.data || centreRes.data);
      })
      .catch(console.error);
  }, []);

  /* Fetch whenever filters change */
  useEffect(() => {
    fetchFormations();
    // Sync URL params
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    setSearchParams(p, { replace: true });
  }, [filters]);

  const fetchFormations = async () => {
    setLoading(true);
    setApiError('');
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.categorieId) params.categorieId = filters.categorieId;
      if (filters.centreId) params.centreId = filters.centreId;
      if (filters.prixMin) params.prixMin = filters.prixMin;
      if (filters.prixMax) params.prixMax = filters.prixMax;
      if (filters.dureeMax) params.dureeMax = filters.dureeMax;

      const res = await formationService.getAll(params);

      // ✅ Backend returns 200 always now — but guard for both shapes
      const data = res.data.data ?? res.data;
      setFormations(Array.isArray(data) ? data : []);
    } catch (err) {
      // 404 used to mean "no results" — treat it as empty, not a real error
      if (err.response?.status === 404) {
        setFormations([]);
      } else {
        setApiError('Failed to load courses. Please try again.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Filter helpers ── */
  const applyFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  const removeChip = (keys) => {
    setFilters(f => {
      const next = { ...f };
      keys.forEach(k => { next[k] = ''; });
      return next;
    });
    if (keys.includes('search')) setLocalSearch('');
    if (keys.includes('prixMin')) setLocalPrixMin('');
    if (keys.includes('prixMax')) setLocalPrixMax('');
    if (keys.includes('dureeMax')) setLocalDuree('');
  };

  const clearFilters = () => {
    setFilters({ search: '', categorieId: '', centreId: '', prixMin: '', prixMax: '', dureeMax: '' });
    setLocalSearch(''); setLocalPrixMin(''); setLocalPrixMax(''); setLocalDuree('');
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    applyFilter('search', localSearch);
  };

  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasActive = activeCount > 0;

  /* ── Helper: get category/centre name from populated object OR raw ID ── */
  // Backend populates as `categorieId` (the schema field name), so formation.categorieId is the object
  const getCatName = (f) => f.categorieId?.nom || f.categorie?.nom || '';
  const getCentreName = (f) => f.centreId?.nom || f.centre?.nom || '';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .fm-root { font-family: 'DM Sans', sans-serif; color: #e8e4dc; padding-top: 48px; }

        .fm-page-header { margin-bottom: 40px; }
        .fm-eyebrow { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #b4915a; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .fm-eyebrow::before { content: ''; width: 24px; height: 1px; background: #b4915a; }
        .fm-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(36px, 5vw, 56px); font-weight: 300; color: #f0ebe0; margin: 0 0 10px; line-height: 1.05; }
        .fm-title em { font-style: italic; color: #b4915a; }
        .fm-subtitle { font-size: 14px; color: #555; font-weight: 300; }

        .fm-layout { display: grid; grid-template-columns: 252px 1fr; gap: 32px; align-items: start; }
        @media (max-width: 900px) { .fm-layout { grid-template-columns: 1fr; } .fm-sidebar { display: none; } .fm-sidebar.open { display: block; position: static; margin-bottom: 24px; } }

        .fm-mobile-btn { display: none; align-items: center; gap: 8px; padding: 9px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.03); color: #888; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; margin-bottom: 20px; width: fit-content; transition: all 0.2s; }
        .fm-mobile-btn:hover { color: #e8e4dc; }
        @media (max-width: 900px) { .fm-mobile-btn { display: flex; } }
        .fm-badge { background: #b4915a; color: #0c0c0e; width: 17px; height: 17px; border-radius: 50%; font-size: 10px; font-weight: 600; display: flex; align-items: center; justify-content: center; }

        .fm-sidebar { position: sticky; top: 80px; border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; background: rgba(255,255,255,0.02); }
        .fm-sidebar-hd { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; }
        .fm-sidebar-label { font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #555; font-weight: 500; display: flex; align-items: center; gap: 7px; }
        .fm-clear-lnk { font-size: 11px; color: #b4915a; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; letter-spacing: 0.05em; padding: 0; transition: opacity 0.2s; }
        .fm-clear-lnk:hover { opacity: 0.7; }
        .fm-filter-grp { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .fm-filter-grp:last-child { border-bottom: none; }
        .fm-filter-lbl { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #444; font-weight: 500; margin-bottom: 10px; display: block; }
        .fm-cat-pills { display: flex; flex-direction: column; gap: 1px; }
        .fm-cat-pill { padding: 7px 10px; border-radius: 8px; font-size: 13px; color: #666; cursor: pointer; transition: all 0.15s; background: none; border: none; font-family: 'DM Sans', sans-serif; text-align: left; width: 100%; display: flex; align-items: center; gap: 8px; }
        .fm-cat-pill:hover { color: #e8e4dc; background: rgba(255,255,255,0.04); }
        .fm-cat-pill.sel { color: #b4915a; background: rgba(180,145,90,0.1); }
        .fm-pill-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; background: currentColor; opacity: 0.5; }
        .fm-cat-pill.sel .fm-pill-dot { opacity: 1; }
        .fm-select { width: 100%; padding: 9px 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 9px; color: #e8e4dc; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; appearance: none; cursor: pointer; transition: border-color 0.2s; }
        .fm-select:focus { border-color: rgba(180,145,90,0.4); }
        .fm-select option { background: #1a1a22; }
        .fm-price-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .fm-num-input { width: 100%; padding: 9px 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 9px; color: #e8e4dc; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; }
        .fm-num-input::placeholder { color: #333; }
        .fm-num-input:focus { border-color: rgba(180,145,90,0.4); }

        .fm-search-row { display: flex; gap: 10px; margin-bottom: 20px; }
        .fm-search-wrap { flex: 1; position: relative; }
        .fm-search-ico { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #444; pointer-events: none; }
        .fm-search-input { width: 100%; padding: 12px 16px 12px 40px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09); border-radius: 11px; font-size: 14px; color: #e8e4dc; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s, background 0.2s; }
        .fm-search-input::placeholder { color: #333; }
        .fm-search-input:focus { border-color: rgba(180,145,90,0.4); background: rgba(180,145,90,0.03); }
        .fm-search-btn { padding: 12px 20px; border-radius: 11px; background: linear-gradient(135deg, #b4915a, #c8a86e); border: none; color: #0c0c0e; font-size: 13px; font-weight: 500; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
        .fm-search-btn:hover { opacity: 0.88; }

        .fm-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
        .fm-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px 4px 12px; border-radius: 20px; background: rgba(180,145,90,0.1); border: 1px solid rgba(180,145,90,0.2); font-size: 12px; color: #b4915a; }
        .fm-chip-x { background: none; border: none; color: #b4915a; cursor: pointer; padding: 0; display: flex; align-items: center; opacity: 0.6; transition: opacity 0.15s; }
        .fm-chip-x:hover { opacity: 1; }

        .fm-meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
        .fm-count { font-size: 12px; color: #444; letter-spacing: 0.06em; text-transform: uppercase; }
        .fm-sort { padding: 7px 12px; border-radius: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #666; font-size: 12px; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; }
        .fm-sort option { background: #1a1a22; }

        .fm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(234px, 1fr)); gap: 16px; }
        .fm-card { border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; background: rgba(255,255,255,0.02); text-decoration: none; display: flex; flex-direction: column; transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s; animation: fm-in 0.35s ease both; }
        @keyframes fm-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fm-card:hover { border-color: rgba(180,145,90,0.3); transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.4); }
        .fm-card-thumb { height: 140px; position: relative; overflow: hidden; background: linear-gradient(135deg, #111114, #161620); display: flex; align-items: center; justify-content: center; }
        .fm-card-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.7; }
        .fm-card-glow { position: absolute; width: 100px; height: 100px; border-radius: 50%; background: radial-gradient(circle, rgba(180,145,90,0.15) 0%, transparent 70%); transition: transform 0.4s ease; }
        .fm-card:hover .fm-card-glow { transform: scale(1.6); }
        .fm-card-glyph { font-family: 'Cormorant Garamond', serif; font-size: 60px; font-weight: 300; color: rgba(180,145,90,0.1); line-height: 1; user-select: none; position: relative; transition: color 0.3s; }
        .fm-card:hover .fm-card-glyph { color: rgba(180,145,90,0.18); }
        .fm-card-cat { position: absolute; bottom: 10px; left: 12px; padding: 3px 9px; border-radius: 5px; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); border: 1px solid rgba(180,145,90,0.2); font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #b4915a; }
        .fm-card-body { padding: 16px 18px; flex: 1; display: flex; flex-direction: column; }
        .fm-card-title { font-size: 14px; font-weight: 500; color: #e8e4dc; margin-bottom: 6px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; transition: color 0.2s; }
        .fm-card:hover .fm-card-title { color: #f5f0e8; }
        .fm-card-desc { font-size: 12px; color: #555; line-height: 1.6; font-weight: 300; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1; margin-bottom: 12px; }
        .fm-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
        .fm-price { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #b4915a; }
        .fm-price-unit { font-size: 11px; color: #555; margin-left: 2px; font-family: 'DM Sans', sans-serif; }
        .fm-card-centre { font-size: 10px; color: #666; margin-bottom: 8px; display: flex; align-items: center; gap: 4px; text-transform: uppercase; letter-spacing: 0.05em; }
        .fm-dur { font-size: 11px; color: #444; display: flex; align-items: center; gap: 4px; }

        .fm-skel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(234px, 1fr)); gap: 16px; }
        .fm-skel-card { border-radius: 14px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.02); }
        .fm-skel-thumb { height: 140px; background: rgba(255,255,255,0.03); }
        .fm-skel-body { padding: 16px 18px; }
        .fm-skel-line { height: 9px; border-radius: 5px; background: rgba(255,255,255,0.04); margin-bottom: 8px; animation: fm-pulse 1.6s ease infinite; }
        @keyframes fm-pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }

        .fm-api-error { padding: 14px 18px; border-radius: 10px; background: rgba(220,53,53,0.08); border: 1px solid rgba(220,53,53,0.2); color: #e07070; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

        .fm-empty { grid-column: 1/-1; text-align: center; padding: 64px 24px; }
        .fm-empty-sym { font-family: 'Cormorant Garamond', serif; font-size: 64px; color: rgba(180,145,90,0.12); line-height: 1; margin-bottom: 16px; }
        .fm-empty-title { font-size: 16px; color: #666; margin-bottom: 8px; }
        .fm-empty-desc { font-size: 13px; color: #444; margin-bottom: 20px; }
        .fm-empty-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 9px; border: 1px solid rgba(180,145,90,0.3); background: none; color: #b4915a; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s; }
        .fm-empty-btn:hover { background: rgba(180,145,90,0.08); }

        /* X icon shorthand */
        .x-svg { display: flex; align-items: center; }
      `}</style>

      <div className="fm-root">
        <div className="fm-page-header">
          <div className="fm-eyebrow">Browse Library</div>
          <h1 className="fm-title">All <em>Courses</em></h1>
          <p className="fm-subtitle">Explore our full catalog of professional training programs</p>
        </div>

        <button className="fm-mobile-btn" onClick={() => setSidebarOpen(o => !o)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="20" y2="18" /></svg>
          Filters {hasActive && <span className="fm-badge">{activeCount}</span>}
        </button>

        <div className="fm-layout">
          {/* ── Sidebar ── */}
          <aside className={`fm-sidebar${sidebarOpen ? ' open' : ''}`}>
            <div className="fm-sidebar-hd">
              <span className="fm-sidebar-label">
                Filters {hasActive && <span className="fm-badge">{activeCount}</span>}
              </span>
              {hasActive && <button className="fm-clear-lnk" onClick={clearFilters}>Clear all</button>}
            </div>

            {/* Category */}
            <div className="fm-filter-grp">
              <span className="fm-filter-lbl">Category</span>
              <div className="fm-cat-pills">
                <button
                  className={`fm-cat-pill${!filters.categorieId ? ' sel' : ''}`}
                  onClick={() => applyFilter('categorieId', '')}
                >
                  <span className="fm-pill-dot" /> All Categories
                </button>
                {categories.map(cat => (
                  <button
                    key={cat._id}
                    className={`fm-cat-pill${filters.categorieId === cat._id ? ' sel' : ''}`}
                    onClick={() => applyFilter('categorieId', filters.categorieId === cat._id ? '' : cat._id)}
                  >
                    <span className="fm-pill-dot" /> {cat.nom || cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Center */}
            {centres.length > 0 && (
              <div className="fm-filter-grp">
                <span className="fm-filter-lbl">Training Center</span>
                <select
                  className="fm-select"
                  value={filters.centreId}
                  onChange={e => applyFilter('centreId', e.target.value)}
                >
                  <option value="">All Centers</option>
                  {centres.map(c => (
                    <option key={c._id} value={c._id}>{c.nom || c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Price */}
            <div className="fm-filter-grp">
              <span className="fm-filter-lbl">Price Range (DT)</span>
              <div className="fm-price-row">
                <input
                  className="fm-num-input" type="number" placeholder="Min"
                  value={localPrixMin}
                  onChange={e => setLocalPrixMin(e.target.value)}
                />
                <input
                  className="fm-num-input" type="number" placeholder="Max"
                  value={localPrixMax}
                  onChange={e => setLocalPrixMax(e.target.value)}
                />
              </div>
            </div>

            {/* Duration */}
            <div className="fm-filter-grp">
              <span className="fm-filter-lbl">Max Duration (hours)</span>
              <input
                className="fm-num-input" type="number" placeholder="e.g. 40"
                value={localDuree} style={{ width: '100%' }}
                onChange={e => setLocalDuree(e.target.value)}
              />
            </div>
          </aside>

          {/* ── Main ── */}
          <div>
            {/* Search */}
            <form className="fm-search-row" onSubmit={handleSearchSubmit}>
              <div className="fm-search-wrap">
                <span className="fm-search-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                </span>
                <input
                  className="fm-search-input"
                  placeholder="Search courses, topics…"
                  value={localSearch}
                  onChange={e => setLocalSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="fm-search-btn">Search</button>
            </form>

            {/* API error */}
            {apiError && (
              <div className="fm-api-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                {apiError}
              </div>
            )}

            {/* Active chips */}
            {hasActive && (
              <div className="fm-chips">
                {filters.search && (
                  <span className="fm-chip">
                    "{filters.search}"
                    <button className="fm-chip-x" onClick={() => removeChip(['search'])}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                )}
                {filters.categorieId && (
                  <span className="fm-chip">
                    {categories.find(c => c._id === filters.categorieId)?.nom || 'Category'}
                    <button className="fm-chip-x" onClick={() => removeChip(['categorieId'])}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                )}
                {filters.centreId && (
                  <span className="fm-chip">
                    {centres.find(c => c._id === filters.centreId)?.nom || 'Center'}
                    <button className="fm-chip-x" onClick={() => removeChip(['centreId'])}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                )}
                {(filters.prixMin || filters.prixMax) && (
                  <span className="fm-chip">
                    {filters.prixMin || '0'} – {filters.prixMax || '∞'} DT
                    <button className="fm-chip-x" onClick={() => removeChip(['prixMin', 'prixMax'])}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                )}
                {filters.dureeMax && (
                  <span className="fm-chip">
                    ≤ {filters.dureeMax}h
                    <button className="fm-chip-x" onClick={() => removeChip(['dureeMax'])}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Meta row */}
            {!loading && (
              <div className="fm-meta-row">
                <span className="fm-count">{formations.length} course{formations.length !== 1 ? 's' : ''}</span>
                <select className="fm-sort">
                  <option>Newest first</option>
                  <option>Price: low → high</option>
                  <option>Price: high → low</option>
                  <option>Duration: shortest</option>
                </select>
              </div>
            )}

            {/* Skeleton */}
            {loading ? (
              <div className="fm-skel-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="fm-skel-card">
                    <div className="fm-skel-thumb" />
                    <div className="fm-skel-body">
                      <div className="fm-skel-line" style={{ width: '75%', animationDelay: `${i * 0.12}s` }} />
                      <div className="fm-skel-line" style={{ width: '55%', animationDelay: `${i * 0.12 + 0.08}s` }} />
                      <div className="fm-skel-line" style={{ width: '35%', marginTop: 10, animationDelay: `${i * 0.12 + 0.16}s` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="fm-grid">
                {formations.length === 0 ? (
                  <div className="fm-empty">
                    <div className="fm-empty-sym">◈</div>
                    <div className="fm-empty-title">No courses found</div>
                    <div className="fm-empty-desc">Try adjusting your filters or search term</div>
                    {hasActive && (
                      <button className="fm-empty-btn" onClick={clearFilters}>Clear all filters</button>
                    )}
                  </div>
                ) : formations.map((f, i) => {
                  const catName = getCatName(f);
                  const centreName = getCentreName(f);
                  const imgUrl = f.image; // full URL already sanitized by backend
                  return (
                    <Link
                      key={f._id}
                      to={`/formations/${f._id}`}
                      className="fm-card"
                      style={{ animationDelay: `${(i % 6) * 0.055}s` }}
                    >
                      <div className="fm-card-thumb">
                        {imgUrl
                          ? <img src={imgUrl} alt={f.titre} className="fm-card-img" />
                          : <div className="fm-card-glow" />
                        }
                        {!imgUrl && (
                          <div className="fm-card-glyph">{GLYPHS[i % GLYPHS.length]}</div>
                        )}
                        {catName && <span className="fm-card-cat">{catName}</span>}
                      </div>
                      <div className="fm-card-body">
                        <div className="fm-card-title">{f.titre}</div>
                        {centreName && (
                          <div className="fm-card-centre">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {centreName}
                          </div>
                        )}
                        <div className="fm-card-desc">{f.description}</div>
                        <div className="fm-card-footer">
                          <div>
                            <span className="fm-price">{f.prix ?? '—'}</span>
                            {f.prix != null && <span className="fm-price-unit">DT</span>}
                          </div>
                          <span className="fm-dur">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            {f.duree ?? '—'}h
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Formations;