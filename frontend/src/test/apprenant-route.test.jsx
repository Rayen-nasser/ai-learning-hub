import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseAuth = vi.fn();
vi.mock('../shared/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children,
}));

import ApprenantRoute from '../features/apprenant/components/ApprenantRoute';

describe('ApprenantRoute', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading spinner', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    const { container } = render(
      <MemoryRouter>
        <ApprenantRoute><div data-testid='c'>x</div></ApprenantRoute>
      </MemoryRouter>
    );
    expect(container.querySelector('._spinner')).toBeInTheDocument();
  });

  it('renders children for authenticated user', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'apprenant', email: 's@t.com' }, loading: false });
    render(
      <MemoryRouter>
        <ApprenantRoute><div data-testid='c'>Dashboard</div></ApprenantRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });

  it('allows any authenticated role', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'formateur', email: 'f@t.com' }, loading: false });
    render(
      <MemoryRouter>
        <ApprenantRoute><div data-testid='c'>Any</div></ApprenantRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });
});
