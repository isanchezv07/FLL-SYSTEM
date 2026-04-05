import React from 'react';
import { render, screen, act } from '@testing-library/react';
import MatchTimer from './MatchTimer';
import { socket } from '@/lib/socket';

// Mock the socket
jest.mock('@/lib/socket', () => ({
  socket: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}));

describe('MatchTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial time', () => {
    render(<MatchTimer />);
    expect(screen.getByText('2:30')).toBeInTheDocument();
  });

  test('updates time when receiving timerUpdate event', () => {
    let timerCallback: (data: any) => void = () => {};
    (socket.on as jest.Mock).mockImplementation((event, cb) => {
      if (event === 'timerUpdate') {
        timerCallback = cb;
      }
    });

    render(<MatchTimer />);

    act(() => {
      timerCallback({ timeRemaining: 140, isRunning: true });
    });

    expect(screen.getByText('2:20')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  test('shows Stop when not running', () => {
    let timerCallback: (data: any) => void = () => {};
    (socket.on as jest.Mock).mockImplementation((event, cb) => {
      if (event === 'timerUpdate') {
        timerCallback = cb;
      }
    });

    render(<MatchTimer />);

    act(() => {
      timerCallback({ timeRemaining: 150, isRunning: false });
    });

    expect(screen.getByText('Stop')).toBeInTheDocument();
  });

  test('changes color when time is low', () => {
    let timerCallback: (data: any) => void = () => {};
    (socket.on as jest.Mock).mockImplementation((event, cb) => {
      if (event === 'timerUpdate') {
        timerCallback = cb;
      }
    });

    render(<MatchTimer />);

    act(() => {
      timerCallback({ timeRemaining: 9, isRunning: true });
    });

    const timeDisplay = screen.getByText('0:09');
    expect(timeDisplay).toHaveClass('text-red-500');
  });
});
