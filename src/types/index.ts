
export interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  size?: number; // en Ko
}

export interface ScanResults {
  totalEmails: number;
  totalSizeMB?: number;
  carbonFootprint: number; // en grammes
  emails: EmailData[];
}

export interface AuthState {
  isAuthenticated: boolean;
  provider?: 'gmail' | 'outlook' | null;
  userEmail?: string | null;
  accessToken?: string | null;
  loading: boolean;
  error?: string | null;
}

export interface ScanState {
  isScanning: boolean;
  results: ScanResults | null;
  error?: string | null;
}
