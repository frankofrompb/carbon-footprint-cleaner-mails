
export interface AuthState {
  userEmail: string | null;
  loading: boolean;
}

export interface AuthData {
  userEmail: string;
  accessToken: string;
  userInfo: any;
  timestamp: number;
}

export interface GoogleAuthResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  id: string;
  verified_email: boolean;
}
