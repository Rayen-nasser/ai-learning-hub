const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

/**
 * Create a unique email with a realistic domain (Joi requires valid TLD).
 */
export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}@gmail.com`;
}

/**
 * Register a user via the backend API and return the token + user data.
 */
export async function registerUser(request, overrides = {}) {
  const payload = {
    email: uniqueEmail(),
    password: 'StrongPass1',
    nom: 'E2ETest',
    prenom: 'User',
    role: 'apprenant',
    ...overrides,
  };
  const res = await request.post(`${BACKEND_URL}/users/register-with-image`, {
    data: payload,
  });
  if (!res.ok()) {
    throw new Error(`register failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return { token: body.token, user: body.data || body.user, email: payload.email };
}

/**
 * Log in and return the token.
 */
export async function loginUser(request, email, password = 'StrongPass1') {
  const res = await request.post(`${BACKEND_URL}/users/login`, {
    data: { email, password },
  });
  if (!res.ok()) {
    throw new Error(`login failed: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return body.token;
}

/**
 * Create a centre as a responsableCF.
 */
export async function createCentre(request, token, overrides = {}) {
  const res = await request.post(`${BACKEND_URL}/centres`, {
    data: {
      nom: 'E2E Test Centre',
      adresse: '123 Test St',
      telephone: '+21621666777',
      email: `centre_${Date.now()}@gmail.com`,
      ...overrides,
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return null;
  const body = await res.json();
  return body.data || body;
}

/**
 * Create a formation in a centre.
 */
export async function createFormation(request, token, centreId, overrides = {}) {
  const res = await request.post(`${BACKEND_URL}/formations`, {
    data: {
      titre: `E2E Formation ${Date.now()}`,
      description: 'An E2E test formation',
      prix: 99,
      duree: 20,
      centreId,
      ...overrides,
    },
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) return null;
  const body = await res.json();
  return body.data || body;
}

/**
 * Get the list of formations (public).
 */
export async function getFormations(request) {
  const res = await request.get(`${BACKEND_URL}/formations`);
  if (!res.ok()) return { data: [] };
  const body = await res.json();
  return body;
}
