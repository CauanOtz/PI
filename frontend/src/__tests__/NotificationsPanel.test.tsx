import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationsPanel } from '../components/ui/notifications-panel';
import type { Notification } from '../types/notifications';

const build = (overrides: Partial<Notification> = {}): Notification => ({
  id: Math.random().toString(36).slice(2),
  title: 'Titulo',
  description: 'Desc',
  time: 'agora',
  type: 'info',
  read: false,
  ...overrides
});

describe('NotificationsPanel', () => {
  it('shows unread count and mark all button', () => {
    const onMarkAll = vi.fn();
    render(<NotificationsPanel isOpen={true} onClose={() => {}} notifications={[build(), build({ read: true })]} onReadNotification={() => {}} onDeleteNotification={() => {}} onMarkAllAsRead={onMarkAll} />);
    expect(screen.getByText(/1 não lidas/)).toBeTruthy();
  });

  it('calls onMarkAllAsRead', () => {
    const onMarkAll = vi.fn();
    render(<NotificationsPanel isOpen={true} onClose={() => {}} notifications={[build(), build()]} onReadNotification={() => {}} onDeleteNotification={() => {}} onMarkAllAsRead={onMarkAll} />);
    fireEvent.click(screen.getByTitle('Marcar todas como lidas'));
    expect(onMarkAll).toHaveBeenCalled();
  });
});
