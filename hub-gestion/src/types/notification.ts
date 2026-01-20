export interface Notification {
  id: string;
  userId: string;
  type: 'booking_confirmed' | 'booking_refused' | 'booking_cancelled' | 'incident_reported';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  // Optional reference to related document
  bookingId?: string;
  incidentId?: string;
}
