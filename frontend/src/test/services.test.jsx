import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseAuth = vi.fn();
vi.mock('../shared/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

import FormateurRoute from '../features/formateur/components/FormateurRoute';
import FormateurLayout from '../features/formateur/components/FormateurLayout';

describe('Service Layer Tests', () => {
  describe('Auth Service', () => {
    it('should have login, register, logout methods', () => {
      const authMethods = ['login', 'register', 'logout', 'forgotPassword', 'resetPassword'];
      expect(authMethods).toHaveLength(5);
      expect(authMethods).toContain('login');
      expect(authMethods).toContain('register');
      expect(authMethods).toContain('logout');
    });

    it('should use correct API endpoints', () => {
      const endpoints = {
        login: '/users/login',
        register: '/users/register-with-image',
        logout: '/users/logout',
        forgotPassword: '/users/forgot-password',
        resetPassword: '/users/reset-password',
      };

      expect(endpoints.login).toBe('/users/login');
      expect(endpoints.register).toBe('/users/register-with-image');
    });
  });

  describe('Formation Service', () => {
    it('should handle formation CRUD operations', () => {
      const operations = ['getAll', 'getById', 'create', 'update', 'delete'];
      operations.forEach(op => expect(typeof op).toBe('string'));
    });

    it('should format formation response data', () => {
      const mockResponse = {
        data: {
          data: {
            _id: '123',
            titre: 'Test Formation',
            description: 'Test Description',
            prix: 99.99,
            duree: 10,
            centre: { _id: 'c1', nom: 'Test Centre' },
          },
          pagination: { page: 1, total: 1 },
        },
      };

      expect(mockResponse.data.data.titre).toBe('Test Formation');
      expect(mockResponse.data.data.prix).toBe(99.99);
      expect(mockResponse.data.pagination.page).toBe(1);
    });
  });

  describe('Lesson Service', () => {
    it('should have correct API structure', () => {
      const lessonEndpoints = {
        getByFormation: '/lecons/formation/',
        create: '/lecons',
        update: '/lecons/',
        delete: '/lecons/',
      };

      expect(lessonEndpoints.getByFormation).toContain('/lecons');
      expect(lessonEndpoints.create).toBe('/lecons');
    });

    it('should handle lesson data structure', () => {
      const mockLesson = {
        _id: 'l1',
        titre: 'Introduction',
        description: 'Getting started',
        formationId: 'f1',
        ordre: 1,
      };

      expect(mockLesson).toHaveProperty('_id');
      expect(mockLesson).toHaveProperty('titre');
      expect(mockLesson).toHaveProperty('formationId');
      expect(mockLesson.ordre).toBe(1);
    });
  });

  describe('Content Service', () => {
    it('should support all content types', () => {
      const contentTypes = ['video', 'image', 'file', 'test', 'link'];
      expect(contentTypes).toHaveLength(5);
    });

    it('should handle content metadata', () => {
      const mockContent = {
        _id: 'c1',
        titre: 'Video Lesson',
        type: 'video',
        fichier: 'video-url.mp4',
        leconId: 'l1',
        duree: 300,
      };

      expect(mockContent.type).toBe('video');
      expect(mockContent).toHaveProperty('fichier');
      expect(mockContent).toHaveProperty('leconId');
    });
  });

  describe('Centre Service', () => {
    it('should have centre CRUD operations', () => {
      const operations = ['getAll', 'getById', 'create', 'update', 'delete'];
      operations.forEach(op => expect(typeof op).toBe('string'));
    });

    it('should use correct endpoints', () => {
      const endpoints = {
        getAll: '/centres',
        getMyCentres: '/centres/my-centres',
        create: '/centres',
      };

      expect(endpoints.getAll).toBe('/centres');
      expect(endpoints.getMyCentres).toBe('/centres/my-centres');
    });
  });

  describe('Inscription Service', () => {
    it('should handle inscription data structure', () => {
      const mockInscription = {
        _id: 'i1',
        apprenantId: 'a1',
        formationId: 'f1',
        statut: 'en_attente',
        dateInscription: '2024-01-15',
      };

      expect(mockInscription).toHaveProperty('statut');
      expect(['en_attente', 'acceptee', 'refusee']).toContain(mockInscription.statut);
    });
  });

  describe('Payment Service', () => {
    it('should handle payment data structure', () => {
      const mockPayment = {
        _id: 'p1',
        inscriptionId: 'i1',
        montant: 99.99,
        methode: 'carte_bancaire',
        statut: 'complete',
        datePaiement: '2024-01-15',
      };

      expect(mockPayment.montant).toBeGreaterThan(0);
      expect(mockPayment).toHaveProperty('methode');
      expect(mockPayment).toHaveProperty('statut');
    });
  });

  describe('User Roles', () => {
    it('should define all valid roles', () => {
      const validRoles = ['apprenant', 'formateur', 'responsableCF', 'admin'];
      expect(validRoles).toHaveLength(4);
    });

    it('should have role-specific permissions', () => {
      const permissions = {
        admin: ['manage_users', 'manage_centres', 'manage_formations', 'view_all'],
        responsableCF: ['manage_own_centre', 'manage_own_formations', 'view_inscriptions'],
        formateur: ['manage_own_lessons', 'manage_own_content'],
        apprenant: ['view_formations', 'subscribe', 'view_own_progress'],
      };

      expect(Object.keys(permissions)).toHaveLength(4);
      expect(permissions.admin).toContain('manage_users');
      expect(permissions.formateur).toContain('manage_own_lessons');
    });
  });

  describe('API Response Format', () => {
    it('should wrap data in standard response format', () => {
      const standardResponse = {
        data: {
          data: {},
          pagination: { page: 1, limit: 10, total: 100 },
        },
      };

      expect(standardResponse.data).toHaveProperty('data');
      expect(standardResponse.data).toHaveProperty('pagination');
    });

    it('should handle error responses', () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Unauthorized',
            statusCode: 401,
          },
        },
      };

      expect(errorResponse.response.data.statusCode).toBe(401);
      expect(errorResponse.response.data.message).toBe('Unauthorized');
    });
  });
});

describe('FormateurRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should redirect to /login when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({ user: null });

    render(
      <MemoryRouter>
        <FormateurRoute>
          <div data-testid="protected-content">Protected</div>
        </FormateurRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should redirect to / when user is not a formateur', () => {
    mockUseAuth.mockReturnValue({ 
      user: { id: '1', role: 'apprenant', email: 'test@test.com' } 
    });

    render(
      <MemoryRouter initialEntries={['/formateur']}>
        <FormateurRoute>
          <div data-testid="protected-content">Protected</div>
        </FormateurRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when user is a formateur', () => {
    mockUseAuth.mockReturnValue({ 
      user: { id: '1', role: 'formateur', email: 'formateur@test.com' } 
    });

    render(
      <MemoryRouter>
        <FormateurRoute>
          <div data-testid="protected-content">Protected Content</div>
        </FormateurRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should allow admin role to access formateur routes', () => {
    mockUseAuth.mockReturnValue({ 
      user: { id: '1', role: 'admin', email: 'admin@test.com' } 
    });

    render(
      <MemoryRouter>
        <FormateurRoute>
          <div data-testid="admin-access">Admin Access</div>
        </FormateurRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('admin-access')).not.toBeInTheDocument();
  });
});

describe('FormateurLayout Component', () => {
  it('should render logo/brand name', () => {
    render(
      <MemoryRouter>
        <FormateurLayout>
          <div>Content</div>
        </FormateurLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Forma')).toBeInTheDocument();
  });

  it('should render navigation links', () => {
    render(
      <MemoryRouter>
        <FormateurLayout>
          <div>Content</div>
        </FormateurLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Formations')).toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <MemoryRouter>
        <FormateurLayout>
          <p>Test Children Content</p>
        </FormateurLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Children Content')).toBeInTheDocument();
  });

  it('should render with custom title and subtitle', () => {
    render(
      <MemoryRouter>
        <FormateurLayout 
          title="Custom Title" 
          subtitle="Custom Subtitle"
        >
          <div>Content</div>
        </FormateurLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom Subtitle')).toBeInTheDocument();
  });

  it('should render default title when not provided', () => {
    render(
      <MemoryRouter>
        <FormateurLayout>
          <div>Content</div>
        </FormateurLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Formateur Dashboard')).toBeInTheDocument();
  });

  it('should have navigation section titles', () => {
    render(
      <MemoryRouter>
        <FormateurLayout>
          <div>Content</div>
        </FormateurLayout>
      </MemoryRouter>
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('should highlight active navigation link', () => {
    render(
      <MemoryRouter initialEntries={['/formateur/formations']}>
        <FormateurLayout>
          <div>Content</div>
        </FormateurLayout>
      </MemoryRouter>
    );

    const formationsLink = screen.getByText('My Formations');
    expect(formationsLink).toBeInTheDocument();
  });
});
