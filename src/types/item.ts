export type Status = 'want' | 'pending' | 'bought';
export type Priority = 'S' | 'A' | 'B';

export interface WishlistItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  price: number;
  url: string;
  status: Status;
  priority: Priority;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const STATUS_LABELS: Record<Status, string> = {
  want: 'Want',
  pending: 'Considering',
  bought: 'Purchased',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  S: 'High',
  A: 'Med',
  B: 'Low',
};
