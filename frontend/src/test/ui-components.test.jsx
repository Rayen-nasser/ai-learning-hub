import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import Button from '../shared/ui/Button';
import Card from '../shared/ui/Card';
import Input from '../shared/ui/Input';
import StarRating from '../shared/components/StarRating';
import StatusBadge from '../shared/components/StatusBadge';
import LoadingSpinner from '../shared/components/LoadingSpinner';

/* ================================================================
   UI COMPONENT TESTS
   ================================================================ */

describe('Button Component', () => {
  it('renders children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>);
    expect(screen.getByText('Primary').className).toContain('primary');
  });

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Sec</Button>);
    expect(screen.getByText('Sec').className).toContain('bg-gray-200');
  });

  it('applies outline variant', () => {
    render(<Button variant="outline">Out</Button>);
    expect(screen.getByText('Out').className).toContain('border-2');
  });

  it('applies ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText('Ghost').className).toContain('text-gray-600');
  });

  it('applies sm size', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small').className).toContain('sm');
  });

  it('applies lg size', () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large').className).toContain('lg');
  });

  it('is disabled when loading', () => {
    render(<Button loading>Saving</Button>);
    expect(screen.getByText('Saving')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByText('Nope')).toBeDisabled();
  });

  it('passes extra className', () => {
    render(<Button className="extra-class">X</Button>);
    expect(screen.getByText('X').className).toContain('extra-class');
  });

  it('forwards onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

describe('Card Component', () => {
  it('renders children', () => {
    render(<Card><p>Hello</p></Card>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('applies default md padding', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content').className).toContain('p-6');
  });

  it('applies sm padding', () => {
    render(<Card padding="sm">Small</Card>);
    expect(screen.getByText('Small').className).toContain('p-4');
  });

  it('applies lg padding', () => {
    render(<Card padding="lg">Large</Card>);
    expect(screen.getByText('Large').className).toContain('p-8');
  });

  it('applies hover class', () => {
    render(<Card hover>Hover</Card>);
    expect(screen.getByText('Hover').className).toContain('hover:shadow-lg');
  });

  it('applies extra className', () => {
    render(<Card className="custom-card">Custom</Card>);
    expect(screen.getByText('Custom').className).toContain('custom-card');
  });
});

describe('Input Component', () => {
  it('renders an input by default', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text').tagName).toBe('INPUT');
  });

  it('renders label when provided', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders error message', () => {
    render(<Input error="Required" />);
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders a select when as="select"', () => {
    render(<Input as="select"><option>Option 1</option></Input>);
    expect(screen.getByRole('combobox').tagName).toBe('SELECT');
  });

  it('forwards value and onChange', () => {
    const handleChange = vi.fn();
    render(<Input value="test" onChange={handleChange} />);
    fireEvent.change(screen.getByDisplayValue('test'), { target: { value: 'changed' } });
    expect(handleChange).toHaveBeenCalled();
  });
});

describe('StarRating Component', () => {
  it('renders 5 star buttons', () => {
    render(<StarRating />);
    expect(screen.getAllByRole('button')).toHaveLength(5);
  });

  it('calls onChange when a star is clicked', () => {
    const handleChange = vi.fn();
    render(<StarRating value={1} onChange={handleChange} />);
    fireEvent.click(screen.getAllByRole('button')[3]);
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('disables buttons when readonly', () => {
    render(<StarRating value={4} readonly />);
    screen.getAllByRole('button').forEach(btn => expect(btn).toBeDisabled());
  });

  it('enables buttons when not readonly', () => {
    render(<StarRating value={3} />);
    screen.getAllByRole('button').forEach(btn => expect(btn).not.toBeDisabled());
  });
});

describe('StatusBadge Component', () => {
  it('renders "En Attente" for en_attente', () => {
    render(<StatusBadge status="en_attente" />);
    expect(screen.getByText('En Attente')).toBeInTheDocument();
  });

  it('renders "Acceptée" for acceptée', () => {
    render(<StatusBadge status="acceptée" />);
    expect(screen.getByText('Acceptée')).toBeInTheDocument();
  });

  it('renders "Refusée" for refusée', () => {
    render(<StatusBadge status="refusée" />);
    expect(screen.getByText('Refusée')).toBeInTheDocument();
  });

  it('renders "Pending" for pending', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('renders "Paid" for paid', () => {
    render(<StatusBadge status="paid" />);
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('renders "Cancelled" for cancelled', () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText('Cancelled')).toBeInTheDocument();
  });

  it('renders default "Pending" for unknown status', () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });
});

describe('LoadingSpinner Component', () => {
  it('renders with default md size', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('._spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner.style.width).toBe('32px');
  });

  it('renders with sm size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('._spinner');
    expect(spinner.style.width).toBe('20px');
  });

  it('renders with lg size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('._spinner');
    expect(spinner.style.width).toBe('48px');
  });

  it('uses custom color', () => {
    const { container } = render(<LoadingSpinner color="#ff0000" />);
    const spinner = container.querySelector('._spinner');
    expect(spinner.style.borderTopColor).toBe('rgb(255, 0, 0)');
  });
});
