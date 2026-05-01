/** All client-side route paths in one place.
 *  Use these instead of hardcoding strings in Link/navigate calls.
 *
 * @example
 * import { ROUTES } from '../constants/routes';
 * navigate(ROUTES.PROFILE);
 * <Link to={ROUTES.FORMATION_DETAIL(id)}>View</Link>
 */
export const ROUTES = {
  HOME:             '/',
  LOGIN:            '/login',
  REGISTER:         '/register',
  FORGOT_PASSWORD:  '/forgot-password',
  RESET_PASSWORD:   '/reset-password',
  PROFILE:          '/profile',
  FORMATIONS:       '/formations',
  FORMATION_DETAIL: (id = ':id') => `/formations/${id}`,
  CENTRES:          '/centres',
  MY_INSCRIPTIONS:  '/my-inscriptions',
  MY_PAIEMENTS:     '/my-paiements',
  MY_FAVORIS:       '/my-favoris',
};