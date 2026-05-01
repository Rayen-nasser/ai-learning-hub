/**
 * Backward-compatible barrel.
 * All existing imports like:
 *   import { authService, formationService } from '../services/api'
 * keep working without any changes.
 *
 * New code should import directly:
 *   import authService from '../features/auth/services/auth'
 *   import formationService from '../services/formations'
 */

export { default as formationService } from '../features/formations/services/formations';
export { default as centreService }    from '../features/centres/services/centres';
export { default as authService }      from '../features/auth/services/auth';
export { default as userService }      from '../features/auth/services/users';
export { default as profileService }   from '../features/profile/services/profile';
export { default as categorieService } from '../features/formations/services/categories';

export {
  inscriptionService,
  paiementService,
  favoriService,
} from '../features/dashboard/services/dashboard';

export {
  avisService,
  leconService,
  contentService,
} from '../features/formations/services/content';

export {
  notificationService,
} from '../features/notifications/services/notifications';

export { default } from './client';