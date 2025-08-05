import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Calendar } from '../Calendar';
import type { CalendarEvent } from '@/types/calendar';

// Mock the calendar dependencies
vi.mock('react-big-calendar', () => ({
  Calendar: ({ children, ...props }: any) => <div data-testid="big-calendar" {...props}>{children}</div>,
  momentLocalizer: vi.fn(() => ({})),
  Views: { DAY: 'day', WEEK: 'week' },
}));

vi.mock('react-big-calendar/lib/addons/dragAndDrop', () => ({
  default: (Component: any) => Component,
}));

vi.mock('moment', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '09:00'),
  })),
}));

const mockEvents: CalendarEvent[] = [
  {
    id: 'task-1',
    title: 'Test Task',
    start: new Date('2024-01-01T09:00:00'),
    end: new Date('2024-01-01T10:00:00'),
    type: 'task',
    color: '#3b82f6',
    data: {
      id: 1,
      name: 'Test Task',
      status: 'Not Started',
      weekly_hours: 1,
      goal_id: 1,
      created_at: '2024-01-01T00:00:00Z',
    },
  },
];

describe('Calendar', () => {
  const defaultProps = {
    events: mockEvents,
    date: new Date('2024-01-01'),
    onDateChange: vi.fn(),
    onEventMove: vi.fn(),
    onEventComplete: vi.fn(),
    onEventEdit: vi.fn(),
    onEventDelete: vi.fn(),
  };

  it('renders calendar component', () => {
    render(<Calendar {...defaultProps} />);
    expect(screen.getByTestId('big-calendar')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<Calendar {...defaultProps} loading={true} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('passes events to calendar', () => {
    render(<Calendar {...defaultProps} />);
    const calendar = screen.getByTestId('big-calendar');
    expect(calendar).toHaveAttribute('events');
  });
});