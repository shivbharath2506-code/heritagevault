export type UserRole = 'admin' | 'curator' | 'conservator' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  museum_id: number;
  museum_name?: string;
  museum_code?: string;
  museum_location?: string;
  created_at?: string;
}

export interface Museum {
  id: number;
  museum_code: string;
  name: string;
  location: string;
  description: string;
  image_url?: string;
  status: string;
}

export interface Artifact {
  id: number;
  name: string;
  category: string;
  period?: string;
  origin?: string;
  material?: string;
  description?: string;
  condition: 'Pristine' | 'Good' | 'Fair' | 'Fragile' | 'Critical' | 'Under Restoration';
  location: string;
  acquisition_date?: string;
  image_url?: string;
  museum_id: number;
  museum_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConservationRecord {
  id: number;
  artifact_id: number;
  artifact_name?: string;
  category?: string;
  artifact_location?: string;
  image_url?: string;
  conservation_date: string;
  conservator: string;
  condition_before: string;
  condition_after: string;
  treatment: string;
  notes?: string;
  created_at?: string;
}

export interface Exhibition {
  id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location: string;
  status: 'Planned' | 'Active' | 'Completed' | 'Cancelled';
  museum_id: number;
  artifact_count?: number;
  total_visitors?: number;
  created_at?: string;
}

export interface RestorationRecord {
  id: number;
  artifact_id: number;
  artifact_name?: string;
  category?: string;
  artifact_location?: string;
  image_url?: string;
  restoration_date: string;
  restored_by: string;
  restoration_type: string;
  description: string;
  cost: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  created_at?: string;
}

export interface VisitorRecord {
  id: number;
  visit_date: string;
  visitor_count: number;
  exhibition_id?: number | null;
  exhibition_name?: string | null;
  museum_id: number;
  created_at?: string;
}

export interface AnalyticsSummary {
  totalArtifacts: number;
  totalVisitors: number;
  activeExhibitions: number;
  totalExhibitions: number;
  conservationRecords: number;
  restorationRecords: number;
  totalRestorationCost: number;
  recentArtifacts: Artifact[];
  recentExhibitions: Exhibition[];
  recentConservation: ConservationRecord[];
  recentRestoration: RestorationRecord[];
  visitorTrend: { visit_date: string; daily_count: number }[];
}
