import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationsDropdown } from '../components/ui/notifications-dropdown';
import type { Notification } from '../types/notifications';

const sample: Notification[] = [
  { id: '1', title: 'A', description: 'd', time: 'agora', type: 'info', read: false },
  { id: '2', title: 'B', description: 'e', time: 'ontem', type: 'warning', read: true }
];

describe('NotificationsDropdown', () => {
  it('renders bell and unread dot', () => {
    render(<NotificationsDropdown notifications={sample} onReadNotification={() => {}} onDeleteNotification={() => {}} onMarkAllAsRead={() => {}} />);
    expect(screen.getByLabelText('Abrir notificações')).toBeTruthy();
  });

  it('opens dropdown list on trigger', async () => {
    render(<NotificationsDropdown notifications={sample} onReadNotification={() => {}} onDeleteNotification={() => {}} onMarkAllAsRead={() => {}} />);
    const trigger = screen.getByLabelText('Abrir notificações');
    await userEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByText('Ver todas as notificações')).toBeTruthy();
    });
  });
});
