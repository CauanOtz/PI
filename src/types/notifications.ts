export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'info' | 'warning';
  read: boolean;
}