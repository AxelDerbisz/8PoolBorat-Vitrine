export type BookingStatus = 'pending' | 'confirmed' | 'refused' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  billiardId: string;
  billiardName: string;
  startTime: Date;
  endTime: Date;
  companions: string[];
  comment: string;
  status: BookingStatus;
  adminComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Billiard {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
}

export interface BookingFormData {
  billiardId: string;
  date: string;
  startTime: string;
  endTime: string;
  companions: string;
  comment: string;
}

// Blocked time slots (e.g., Tuesday 18h-20h for training)
export interface BlockedSlot {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startHour: number;
  endHour: number;
  reason: string;
}

export const DEFAULT_BLOCKED_SLOTS: BlockedSlot[] = [
  {
    dayOfWeek: 2, // Tuesday
    startHour: 18,
    endHour: 20,
    reason: 'Entraînement club',
  },
];

export const BILLIARDS: Billiard[] = [
  { id: 'billard-1', name: 'Billard 1', description: 'Table française', isAvailable: true },
  { id: 'billard-2', name: 'Billard 2', description: 'Table française', isAvailable: true },
  { id: 'billard-3', name: 'Billard 3', description: 'Table française', isAvailable: true },
  { id: 'billard-4', name: 'Billard 4', description: 'Table française', isAvailable: true },
  { id: 'billard-5', name: 'Billard 5', description: 'Table française', isAvailable: true },
  { id: 'billard-6', name: 'Billard 6', description: 'Table française', isAvailable: true },
  { id: 'billard-7', name: 'Billard 7', description: 'Table française', isAvailable: true },
  { id: 'billard-8', name: 'Billard 8', description: 'Table française', isAvailable: true },
];
