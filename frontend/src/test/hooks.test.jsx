import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useDebounce from '../shared/hooks/useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('returns initial value', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('updates after delay', () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 'a', delay: 500 } }
    );
    rerender({ val: 'b', delay: 500 });
    act(() => { vi.advanceTimersByTime(500); });
    expect(result.current).toBe('b');
  });

  it('does not update before delay', () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 'a', delay: 500 } }
    );
    rerender({ val: 'b', delay: 500 });
    act(() => { vi.advanceTimersByTime(400); });
    expect(result.current).toBe('a');
  });

  it('resets on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 'a', delay: 500 } }
    );
    rerender({ val: 'b', delay: 500 });
    act(() => { vi.advanceTimersByTime(300); });
    rerender({ val: 'c', delay: 500 });
    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('a');
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('c');
  });

  it('custom delay', () => {
    const { result, rerender } = renderHook(
      ({ val, delay }) => useDebounce(val, delay),
      { initialProps: { val: 'first', delay: 1000 } }
    );
    rerender({ val: 'second', delay: 1000 });
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current).toBe('second');
  });
});
