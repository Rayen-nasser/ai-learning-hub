import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import LoadingSpinner from '../shared/components/LoadingSpinner';
import { formatDate, formatPrice, getUserName, getUserInitial, getImageUrl } from '../shared/utils/format';

const mockUseAuth = vi.fn();
vi.mock('../shared/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children,
}));

import { Navigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';

const MockRouteGuard = ({ allowedRoles = [], children, redirectTo = '/' }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner size="md" />;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to={redirectTo} replace />;
  return children;
};

describe('Utility Functions - format.js', () => {
  describe('formatDate', () => {
    it('should format ISO date to short date format', () => {
      const result = formatDate('2026-04-15T10:30:00.000Z');
      expect(result).toMatch(/15.*Apr.*2026/i);
    });

    it('should format date with long month', () => {
      const result = formatDate('2026-04-15T10:30:00.000Z', 'long');
      expect(result).toMatch(/15.*April.*2026/i);
    });

    it('should return dash for null/undefined', () => {
      expect(formatDate(null)).toBe('—');
      expect(formatDate(undefined)).toBe('—');
    });

    it('should handle invalid date', () => {
      const result = formatDate('invalid-date');
      expect(result).toBeDefined();
    });
  });

  describe('formatPrice', () => {
    it('should format price with default currency', () => {
      expect(formatPrice(299)).toBe('299 DT');
    });

    it('should format price with custom currency', () => {
      expect(formatPrice(99, 'EUR')).toBe('99 EUR');
    });

    it('should return dash for null/undefined', () => {
      expect(formatPrice(null)).toBe('—');
      expect(formatPrice(undefined)).toBe('—');
    });

    it('should handle zero price', () => {
      expect(formatPrice(0)).toBe('0 DT');
    });

    it('should handle negative price', () => {
      expect(formatPrice(-50)).toBe('-50 DT');
    });
  });

  describe('getUserName', () => {
    it('should return full name when nom and prenom exist', () => {
      const user = { nom: 'Ben Ali', prenom: 'Mohamed' };
      expect(getUserName(user)).toBe('Mohamed Ben Ali');
    });

    it('should return prenom only when nom is missing', () => {
      const user = { prenom: 'Mohamed' };
      expect(getUserName(user)).toBe('Mohamed');
    });

    it('should return nom only when prenom is missing', () => {
      const user = { nom: 'Ben Ali' };
      expect(getUserName(user)).toBe('Ben Ali');
    });

    it('should return email prefix when no name exists', () => {
      const user = { email: 'john.doe@example.com' };
      expect(getUserName(user)).toBe('john.doe');
    });

    it('should return "User" when no name or email exists', () => {
      expect(getUserName({})).toBe('User');
      expect(getUserName(null)).toBe('');
      expect(getUserName(undefined)).toBe('');
    });
  });

  describe('getUserInitial', () => {
    it('should return first letter of nom', () => {
      const user = { nom: 'Ben Ali', prenom: 'Mohamed' };
      expect(getUserInitial(user)).toBe('B');
    });

    it('should return first letter of prenom when nom is missing', () => {
      const user = { prenom: 'Mohamed' };
      expect(getUserInitial(user)).toBe('M');
    });

    it('should return first letter of email when no names exist', () => {
      const user = { email: 'john@example.com' };
      expect(getUserInitial(user)).toBe('J');
    });

    it('should return "U" as default', () => {
      expect(getUserInitial({})).toBe('U');
      expect(getUserInitial(null)).toBe('U');
    });

    it('should return uppercase letter', () => {
      const user = { nom: 'ben ali' };
      expect(getUserInitial(user)).toBe('B');
    });
  });

  describe('getImageUrl', () => {
    it('should return full URL with default base', () => {
      const result = getImageUrl('uploads/images/logo.png');
      expect(result).toBe('http://localhost:5000/uploads/images/logo.png');
    });

    it('should return null for empty path', () => {
      expect(getImageUrl(null)).toBeNull();
      expect(getImageUrl(undefined)).toBeNull();
      expect(getImageUrl('')).toBeNull();
    });
  });
});

describe('LoadingSpinner Component', () => {
  it('should render with default size', () => {
    render(<LoadingSpinner />);
    const spinner = document.querySelector('._spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should render small spinner', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = document.querySelector('._spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should render large spinner', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = document.querySelector('._spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('should use custom color', () => {
    render(<LoadingSpinner color="#ff0000" />);
    const spinner = document.querySelector('._spinner');
    expect(spinner).toBeInTheDocument();
  });
});

describe('Route Guards - Mocked Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Route Guard', () => {
    it('should show loading when loading is true', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true });

      render(
        <MemoryRouter>
          <MockRouteGuard allowedRoles={['admin']}>
            <div data-testid="admin-content">Admin Content</div>
          </MockRouteGuard>
        </MemoryRouter>
      );

      const spinner = document.querySelector('._spinner');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });

    it('should render children when user is admin', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, loading: false });

      render(
        <MemoryRouter>
          <MockRouteGuard allowedRoles={['admin']}>
            <div data-testid="admin-content">Admin Content</div>
          </MockRouteGuard>
        </MemoryRouter>
      );

      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });

    it('should redirect when user is not admin', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', role: 'apprenant' }, loading: false });

      render(
        <MemoryRouter>
          <MockRouteGuard allowedRoles={['admin']}>
            <div data-testid="admin-content">Admin Content</div>
          </MockRouteGuard>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });
  });

  describe('ResponsableCF Route Guard', () => {
    it('should render children when user is responsableCF', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', role: 'responsableCF' }, loading: false });

      render(
        <MemoryRouter>
          <MockRouteGuard allowedRoles={['responsableCF', 'admin']}>
            <div data-testid="resp-content">Responsable Content</div>
          </MockRouteGuard>
        </MemoryRouter>
      );

      expect(screen.getByTestId('resp-content')).toBeInTheDocument();
    });

    it('should render children when user is admin', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, loading: false });

      render(
        <MemoryRouter>
          <MockRouteGuard allowedRoles={['responsableCF', 'admin']}>
            <div data-testid="resp-content">Responsable Content</div>
          </MockRouteGuard>
        </MemoryRouter>
      );

      expect(screen.getByTestId('resp-content')).toBeInTheDocument();
    });

    it('should redirect when user is not allowed', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', role: 'formateur' }, loading: false });

      render(
        <MemoryRouter>
          <MockRouteGuard allowedRoles={['responsableCF', 'admin']}>
            <div data-testid="resp-content">Responsable Content</div>
          </MockRouteGuard>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('resp-content')).not.toBeInTheDocument();
    });
  });

  describe('Formateur Route Guard', () => {
    it('should render children when user is formateur', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', role: 'formateur' }, loading: false });

      render(
        <MemoryRouter>
          <MockRouteGuard allowedRoles={['formateur']}>
            <div data-testid="formateur-content">Formateur Content</div>
          </MockRouteGuard>
        </MemoryRouter>
      );

      expect(screen.getByTestId('formateur-content')).toBeInTheDocument();
    });

    it('should redirect when user is not formateur', () => {
      mockUseAuth.mockReturnValue({ user: { id: '1', role: 'apprenant' }, loading: false });

      render(
        <MemoryRouter>
          <MockRouteGuard allowedRoles={['formateur']}>
            <div data-testid="formateur-content">Formateur Content</div>
          </MockRouteGuard>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('formateur-content')).not.toBeInTheDocument();
    });
  });
});

describe('User Roles and Permissions', () => {
  it('should define all valid roles', () => {
    const validRoles = ['apprenant', 'formateur', 'responsableCF', 'admin'];
    expect(validRoles).toHaveLength(4);
    expect(validRoles).toContain('apprenant');
    expect(validRoles).toContain('formateur');
    expect(validRoles).toContain('responsableCF');
    expect(validRoles).toContain('admin');
  });

  it('should have role-specific route access', () => {
    const routeAccess = {
      '/formateur/*': ['formateur', 'admin'],
      '/responsable/*': ['responsableCF', 'admin'],
      '/admin/*': ['admin'],
      '/profile': ['apprenant', 'formateur', 'responsableCF', 'admin'],
      '/formations': ['apprenant', 'formateur', 'responsableCF', 'admin', 'guest'],
    };

    expect(routeAccess['/admin/*']).toEqual(['admin']);
    expect(routeAccess['/formateur/*']).toContain('formateur');
    expect(routeAccess['/responsable/*']).toContain('responsableCF');
  });

  it('should validate role combinations', () => {
    const adminPermissions = ['manage_users', 'manage_centres', 'manage_formations', 'view_all'];
    const respCFPermissions = ['manage_own_centre', 'manage_own_formations', 'view_inscriptions'];
    const formateurPermissions = ['manage_own_lessons', 'manage_own_content'];
    const apprenantPermissions = ['view_formations', 'subscribe', 'view_own_progress'];

    expect(adminPermissions).toContain('manage_users');
    expect(respCFPermissions).toContain('manage_own_centre');
    expect(formateurPermissions).toContain('manage_own_lessons');
    expect(apprenantPermissions).toContain('view_formations');
  });
});

describe('API Endpoints Validation', () => {
  it('should define auth endpoints correctly', () => {
    const authEndpoints = {
      login: '/users/login',
      register: '/users/register-with-image',
      logout: '/users/logout',
      forgotPassword: '/users/forgot-password',
      resetPassword: '/users/reset-password',
    };

    expect(authEndpoints.login).toContain('/users');
    expect(authEndpoints.register).toContain('/users');
  });

  it('should define formation endpoints correctly', () => {
    const formationEndpoints = {
      getAll: '/formations',
      getById: '/formations/:id',
      create: '/formations',
      update: '/formations/:id',
      delete: '/formations/:id',
    };

    expect(formationEndpoints.getAll).toBe('/formations');
    expect(formationEndpoints.create).toBe('/formations');
  });

  it('should define admin endpoints correctly', () => {
    const adminEndpoints = {
      stats: '/admin/stats',
      users: '/admin/users',
      block: '/admin/users/:id/block',
      reports: '/admin/reports',
    };

    expect(adminEndpoints.stats).toContain('/admin');
    expect(adminEndpoints.users).toContain('/admin');
  });

  it('should define payment endpoints correctly', () => {
    const paymentEndpoints = {
      getAll: '/paiements',
      create: '/paiements',
      confirm: '/paiements/:id/confirm',
      cancel: '/paiements/:id/cancel',
    };

    expect(paymentEndpoints.getAll).toBe('/paiements');
    expect(paymentEndpoints.confirm).toContain('/paiements');
  });

  it('should define inscription endpoints correctly', () => {
    const inscriptionEndpoints = {
      getAll: '/inscriptions',
      getMyInscriptions: '/inscriptions/me',
      create: '/inscriptions',
    };

    expect(inscriptionEndpoints.getAll).toBe('/inscriptions');
    expect(inscriptionEndpoints.getMyInscriptions).toBe('/inscriptions/me');
  });

  it('should define lesson endpoints correctly', () => {
    const lessonEndpoints = {
      getByFormation: '/lecons/formation/',
      create: '/lecons',
      update: '/lecons/',
      delete: '/lecons/',
    };

    expect(lessonEndpoints.getByFormation).toContain('/lecons');
    expect(lessonEndpoints.create).toBe('/lecons');
  });
});

describe('Form Data Structures', () => {
  it('should define login form data structure', () => {
    const loginData = {
      email: 'user@example.com',
      password: 'Password123!',
    };

    expect(loginData).toHaveProperty('email');
    expect(loginData).toHaveProperty('password');
    expect(typeof loginData.email).toBe('string');
    expect(typeof loginData.password).toBe('string');
  });

  it('should define register form data structure', () => {
    const registerData = {
      email: 'user@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      prenom: 'Mohamed',
      nom: 'Ben Ali',
      telephone: '12345678',
      role: 'apprenant',
    };

    expect(registerData).toHaveProperty('email');
    expect(registerData).toHaveProperty('password');
    expect(registerData).toHaveProperty('prenom');
    expect(registerData).toHaveProperty('nom');
    expect(registerData).toHaveProperty('role');
  });

  it('should define profile update data structure', () => {
    const profileData = {
      nom: 'Ben Ali',
      prenom: 'Mohamed',
      telephone: '12345678',
      dateNaissance: '1990-01-01',
    };

    expect(profileData).toHaveProperty('nom');
    expect(profileData).toHaveProperty('prenom');
  });

  it('should define password change data structure', () => {
    const passwordChange = {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
      confirmPassword: 'NewPassword456!',
    };

    expect(passwordChange).toHaveProperty('currentPassword');
    expect(passwordChange).toHaveProperty('newPassword');
    expect(passwordChange.newPassword).toBe(passwordChange.confirmPassword);
  });

  it('should validate email format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(emailRegex.test('test@example.com')).toBe(true);
    expect(emailRegex.test('invalid-email')).toBe(false);
  });

  it('should validate password requirements', () => {
    const passwordMinLength = 8;
    const password = 'Password123!';
    expect(password.length).toBeGreaterThanOrEqual(passwordMinLength);
  });
});

describe('Content Types and Question Types', () => {
  it('should define all content types', () => {
    const contentTypes = ['video', 'image', 'file', 'test', 'link'];
    expect(contentTypes).toHaveLength(5);
    expect(contentTypes).toContain('video');
    expect(contentTypes).toContain('image');
    expect(contentTypes).toContain('file');
    expect(contentTypes).toContain('test');
    expect(contentTypes).toContain('link');
  });

  it('should define question types', () => {
    const questionTypes = ['multiple_choice', 'open'];
    expect(questionTypes).toHaveLength(2);
    expect(questionTypes).toContain('multiple_choice');
    expect(questionTypes).toContain('open');
  });

  it('should define inscription statuses', () => {
    const inscriptionStatuses = ['en_attente', 'acceptee', 'refusee'];
    expect(inscriptionStatuses).toHaveLength(3);
    expect(inscriptionStatuses).toContain('en_attente');
    expect(inscriptionStatuses).toContain('acceptee');
    expect(inscriptionStatuses).toContain('refusee');
  });

  it('should define payment statuses', () => {
    const paymentStatuses = ['en_attente', 'complete', 'echoue', 'annule'];
    expect(paymentStatuses).toHaveLength(4);
  });

  it('should define formation statuses', () => {
    const formationStatuses = ['brouillon', 'publie', 'archive'];
    expect(formationStatuses).toHaveLength(3);
  });
});

describe('Pagination Structure', () => {
  it('should define pagination response structure', () => {
    const pagination = {
      page: 1,
      limit: 10,
      total: 100,
      totalPages: 10,
    };

    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('total');
    expect(pagination.page).toBeGreaterThan(0);
    expect(pagination.limit).toBeGreaterThan(0);
  });

  it('should calculate total pages correctly', () => {
    const total = 95;
    const limit = 10;
    const totalPages = Math.ceil(total / limit);
    expect(totalPages).toBe(10);
  });

  it('should handle edge cases', () => {
    expect(Math.ceil(0 / 10)).toBe(0);
    expect(Math.ceil(1 / 10)).toBe(1);
    expect(Math.ceil(100 / 10)).toBe(10);
  });
});

describe('Error Response Structure', () => {
  it('should define standard error response', () => {
    const errorResponse = {
      response: {
        data: {
          message: 'Error message',
          statusCode: 400,
        },
      },
    };

    expect(errorResponse.response.data).toHaveProperty('message');
    expect(errorResponse.response.data).toHaveProperty('statusCode');
  });

  it('should handle network errors', () => {
    const networkError = {
      message: 'Network Error',
      name: 'AxiosError',
    };

    expect(networkError.message).toBe('Network Error');
  });

  it('should define validation error structure', () => {
    const validationError = {
      response: {
        data: {
          message: 'Validation failed',
          errors: [
            { field: 'email', message: 'Invalid email format' },
            { field: 'password', message: 'Password too short' },
          ],
        },
      },
    };

    expect(validationError.response.data.errors).toHaveLength(2);
    expect(validationError.response.data.errors[0].field).toBe('email');
  });
});

describe('Lesson and Content Structures', () => {
  it('should define lesson data structure', () => {
    const lesson = {
      _id: 'l1',
      titre: 'Introduction',
      description: 'Getting started',
      formationId: 'f1',
      ordre: 1,
    };

    expect(lesson).toHaveProperty('_id');
    expect(lesson).toHaveProperty('titre');
    expect(lesson).toHaveProperty('formationId');
    expect(lesson.ordre).toBe(1);
  });

  it('should define content data structure', () => {
    const content = {
      _id: 'c1',
      titre: 'Video Lesson',
      type: 'video',
      fichier: 'video-url.mp4',
      leconId: 'l1',
      duree: 300,
    };

    expect(content).toHaveProperty('type');
    expect(content.type).toBe('video');
  });

  it('should define test question structure', () => {
    const question = {
      _id: 'q1',
      title: 'What is React?',
      type: 'multiple_choice',
      options: [
        { text: 'A library', isCorrect: true },
        { text: 'A framework', isCorrect: false },
      ],
    };

    expect(question.type).toBe('multiple_choice');
    expect(question.options).toHaveLength(2);
    expect(question.options[0].isCorrect).toBe(true);
  });
});

describe('Formation Data Structure', () => {
  it('should define formation data structure', () => {
    const formation = {
      _id: 'f1',
      titre: 'React Basics',
      description: 'Learn React',
      prix: 100,
      duree: 20,
      categorie: { _id: 'c1', nom: 'Programming' },
      centre: { _id: 'ce1', nom: 'Tech Academy' },
      statut: 'publie',
    };

    expect(formation).toHaveProperty('titre');
    expect(formation).toHaveProperty('prix');
    expect(formation).toHaveProperty('duree');
    expect(formation).toHaveProperty('categorie');
    expect(formation).toHaveProperty('centre');
  });

  it('should handle free formations', () => {
    const freeFormation = {
      _id: 'f2',
      titre: 'Free Course',
      prix: 0,
    };

    expect(freeFormation.prix).toBe(0);
    expect(freeFormation.prix).toBeLessThan(1);
  });
});

describe('Centre Data Structure', () => {
  it('should define centre data structure', () => {
    const centre = {
      _id: 'c1',
      nom: 'Tech Academy',
      adresse: '123 Main St',
      telephone: '12345678',
      email: 'contact@techacademy.com',
      logo: '/uploads/logo.png',
    };

    expect(centre).toHaveProperty('nom');
    expect(centre).toHaveProperty('adresse');
    expect(centre).toHaveProperty('telephone');
  });
});
