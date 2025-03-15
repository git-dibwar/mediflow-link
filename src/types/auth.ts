
export type UserType = 'patient' | 'doctor' | 'clinic' | 'pharmacy' | 'laboratory';

export interface Profile {
  id: string;
  full_name: string;
  user_type: UserType;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  owner_id: string;
  name: string;
  type: UserType;
  address?: string;
  phone?: string;
  email?: string;
  license_number?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}
