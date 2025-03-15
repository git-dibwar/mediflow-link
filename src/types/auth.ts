
export type UserType = 'patient' | 'doctor' | 'clinic' | 'pharmacy' | 'laboratory';

export interface Profile {
  id: string;
  full_name: string;
  user_type: UserType;
  email?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    user_type?: UserType;
    [key: string]: any;
  };
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: AuthUser;
}
