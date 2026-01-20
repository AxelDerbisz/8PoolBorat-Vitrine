export type IncidentStatus = 'pending' | 'in_progress' | 'resolved';

export type IncidentCategory =
  | 'billiard_damage'
  | 'equipment'
  | 'cleanliness'
  | 'security'
  | 'other';

export interface Incident {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: IncidentCategory;
  title: string;
  description: string;
  photos: string[];
  billiardId?: string;
  status: IncidentStatus;
  adminComment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const INCIDENT_CATEGORIES: { value: IncidentCategory; label: string }[] = [
  { value: 'billiard_damage', label: 'Dommage sur un billard' },
  { value: 'equipment', label: 'Équipement défectueux' },
  { value: 'cleanliness', label: 'Propreté' },
  { value: 'security', label: 'Sécurité' },
  { value: 'other', label: 'Autre' },
];
