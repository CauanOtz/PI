import { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BellIcon, CheckIcon, InfoIcon, AlertCircleIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationsPanel } from './notifications-panel';
import type { Notification } from '../../types/notifications';

interface NotificationsDropdownProps {
  notifications: Notification[];
  onReadNotification: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationsDropdown = ({
  notifications,
  onReadNotification,
  onDeleteNotification,
  onMarkAllAsRead,
}: NotificationsDropdownProps) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckIcon className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircleIcon className="w-4 h-4 text-orange-500" />;
      default:
        return <InfoIcon className="w-4 h-4 text-blue-500" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button aria-label="Abrir notificações" className="relative p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 focus:outline-none">
            <BellIcon className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="w-80 bg-white rounded-lg shadow-lg border border-gray-100 py-2 mt-1"
            align="end"
            sideOffset={5}
          >
            <div className="px-4 py-2 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Notificações</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} não lidas</p>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <DropdownMenu.Item
                    key={notification.id}
                    className={cn(
                      "flex items-start px-4 py-3 hover:bg-gray-50 focus:outline-none cursor-pointer",
                      !notification.read && "bg-blue-50/50"
                    )}
                    onClick={() => onReadNotification(notification.id)}
                  >
                    <div className="flex-shrink-0 mr-3 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {notification.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </DropdownMenu.Item>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500">
                  Nenhuma notificação
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100">
                <button 
                  onClick={() => setIsPanelOpen(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium w-full text-left"
                >
                  Ver todas as notificações
                </button>
              </div>
            )}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <NotificationsPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        notifications={notifications}
        onReadNotification={onReadNotification}
        onDeleteNotification={onDeleteNotification}
        {...(onMarkAllAsRead ? { onMarkAllAsRead } : {})}
      />
    </>
  );
};