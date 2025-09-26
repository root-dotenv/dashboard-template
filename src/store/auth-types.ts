export interface LoginPayload {
  username?: string;
  password?: string;
}

export interface UserInfo {
  user_id: string;
  username: string;
  username_type: string;
  is_verified: boolean;
  tenant_id: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  user_info: UserInfo;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  username: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  address: string;
  is_active: boolean;
  is_superuser: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}
