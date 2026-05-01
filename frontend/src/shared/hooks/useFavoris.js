import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { favoriService } from '../services';
import { useAuth } from '../context/AuthContext';

/**
 * Manages favorites for the current user.
 * Handles fetching, adding, and removing — with redirect to login
 * when the user is not authenticated.
 *
 * @example
 * const { isFavorite, toggleFavorite, loading } = useFavoris();
 * <button onClick={() => toggleFavorite(formation._id, 'formation')}>
 *   {isFavorite(formation._id) ? 'Saved' : 'Save'}
 * </button>
 */
function useFavoris() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favoris, setFavoris]   = useState([]); // full favori objects
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    favoriService.getMyFavoris()
      .then((res) => {
        const data = res.data.data || res.data;
        setFavoris(data);
        setFavoriteIds(new Set(data.map((f) => f.cibleId?._id || f.cibleId)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const isFavorite = useCallback(
    (id) => favoriteIds.has(id),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (cibleId, typeCible = 'formation', e) => {
      e?.preventDefault();
      if (!user) {
        navigate('/login', { state: { from: { pathname: window.location.pathname } } });
        return;
      }
      if (favoriteIds.has(cibleId)) {
        // Optimistic remove
        const target = favoris.find(
          (f) => (f.cibleId?._id || f.cibleId) === cibleId
        );
        setFavoriteIds((prev) => { const next = new Set(prev); next.delete(cibleId); return next; });
        setFavoris((prev) => prev.filter((f) => (f.cibleId?._id || f.cibleId) !== cibleId));
        try {
          if (target) await favoriService.remove(target._id);
        } catch {
          // Rollback on error
          setFavoriteIds((prev) => new Set([...prev, cibleId]));
          setFavoris((prev) => [...prev, target]);
        }
      } else {
        // Optimistic add
        setFavoriteIds((prev) => new Set([...prev, cibleId]));
        try {
          const res = await favoriService.add({ cibleId, typeCible });
          const newFav = res.data.data || res.data;
          setFavoris((prev) => [...prev, newFav]);
        } catch {
          setFavoriteIds((prev) => { const next = new Set(prev); next.delete(cibleId); return next; });
        }
      }
    },
    [user, favoris, favoriteIds, navigate]
  );

  return { favoris, isFavorite, toggleFavorite, loading };
}

export default useFavoris;