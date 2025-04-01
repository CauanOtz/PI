import React from 'react';
import { X, Trash2, Check, CheckCheck } from 'lucide-react';
import type { Notification } from '../../types/notifications';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onReadNotification: (id: string) => void;
  onDeleteNotification: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsPanel = ({
  isOpen,
  onClose,
  notifications,
  onReadNotification,
  onDeleteNotification,
  onMarkAllAsRead,
}: NotificationsPanelProps) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={`
        fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Todas as Notificações</h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500">{unreadCount} não lidas</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button 
                  onClick={onMarkAllAsRead}
                  className="p-2 hover:bg-gray-100 rounded-full text-blue-600"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  p-4 rounded-lg border group relative
                  ${notification.read ? 'bg-white' : 'bg-blue-50/50'}
                  hover:border-gray-300 transition-colors
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{notification.title}</p>
                    <p className="text-gray-600 mt-1">{notification.description}</p>
                    <p className="text-sm text-gray-400 mt-2">{notification.time}</p>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <button
                      onClick={() => onReadNotification(notification.id)}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-blue-600"
                      title="Marcar como lida"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteNotification(notification.id)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-red-600"
                    title="Remover notificação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {notifications.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                Nenhuma notificação
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};