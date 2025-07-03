export type UserRole = 'candidate' | 'admin' | 'company';

export interface UserMetadata {
  role: UserRole;
  companyId?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CandidateMetadata extends UserMetadata {
  role: 'candidate';
  profileCompleted: boolean;
  isAnonymized: boolean;
  skills?: string[];
  experience?: string;
  location?: string;
}

export interface AdminMetadata extends UserMetadata {
  role: 'admin';
  permissions: AdminPermission[];
  department?: string;
}

export interface CompanyMetadata extends UserMetadata {
  role: 'company';
  companyId: string;
  companyName: string;
  tier: 'basic' | 'premium' | 'enterprise';
  searchQuota: number;
  searchesUsed: number;
  subscriptionStatus: 'active' | 'inactive' | 'trial';
}

export type AdminPermission = 
  | 'manage_candidates'
  | 'manage_companies'
  | 'manage_payments'
  | 'view_analytics'
  | 'manage_system'
  | 'export_data';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  metadata: UserMetadata;
}