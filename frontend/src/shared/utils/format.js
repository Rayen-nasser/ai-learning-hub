/**
 * Format an ISO date string for display.
 *
 * @example
 * formatDate(inscription.createdAt)          // "12 Apr 2026"
 * formatDate(profile.dateNaissance, 'long')  // "12 April 2026"
 */
export function formatDate(iso, month = 'short') {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month, year: 'numeric',
  });
}

/**
 * Format a price with currency label.
 *
 * @example
 * formatPrice(299)   // "299 DT"
 * formatPrice(null)  // "—"
 */
export function formatPrice(amount, currency = 'DT') {
  if (amount == null) return '—';
  return `${amount} ${currency}`;
}

/**
 * Get user display name from a user object.
 *
 * @example
 * getUserName(user)  // "Mohamed Ben Ali" or "m.benali" or "User"
 */
export function getUserName(user) {
  if (!user) return '';
  if (user.nom && user.prenom) return `${user.prenom} ${user.nom}`;
  return user.prenom || user.nom || user.email?.split('@')[0] || 'User';
}

/**
 * Get the first letter of a user's name for avatar fallback.
 *
 * @example
 * getUserInitial(user)  // "M"
 */
export function getUserInitial(user) {
  if (!user) return 'U';
  return (user.nom?.[0] || user.prenom?.[0] || user.email?.[0] || 'U').toUpperCase();
}

/**
 * Build the full URL for a user image stored on the backend.
 *
 * @example
 * getImageUrl(user.user_image)  // "http://localhost:5000/uploads/..."
 */
export function getImageUrl(path) {
  if (!path) return null;
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${base}/${path}`;
}