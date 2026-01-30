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
  want: '欲しい',
  pending: '検討中',
  bought: '購入済み',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  S: '高',
  A: '中',
  B: '低',
};
