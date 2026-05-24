import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const mockUseAuth = vi.fn();
vi.mock('../shared/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  AuthProvider: ({ children }) => children,
}));

import ResponsableCFRoute from '../features/responsableCF/components/ResponsableCFRoute';

describe('ResponsableCFRoute', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows loading spinner', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    const { container } = render(
      <MemoryRouter>
        <ResponsableCFRoute><div data-testid='c'>x</div></ResponsableCFRoute>
      </MemoryRouter>
    );
    expect(container.querySelector('._spinner')).toBeInTheDocument();
  });

  it('renders children for responsableCF', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'responsableCF' }, loading: false });
    render(
      <MemoryRouter>
        <ResponsableCFRoute><div data-testid='c'>Resp</div></ResponsableCFRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });

  it('renders children for admin', () => {
    mockUseAuth.mockReturnValue({ user: { id: '1', role: 'admin' }, loading: false });
    render(
      <MemoryRouter>
        <ResponsableCFRoute><div data-testid='c'>Admin</div></ResponsableCFRoute>
      </MemoryRouter>
    );
    expect(screen.getByTestId('c')).toBeInTheDocument();
  });
});
