
export interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  size?: number; // en Ko
  snippet?: string;
  isUnread?: boolean;
  daysSinceReceived?: number;
  classification?: {
    category: string;
    confidence: number;
    suggestedAction: string;
    reasoning: string;
  };
}

export interface ScanResults {
  totalEmails: number;
  totalSizeMB?: number;
  carbonFootprint: number; // en grammes
  emails: EmailData[];
  summary?: {
    oldUnreadEmails: number;
    promotionalEmails: number;
    socialEmails: number;
    notificationEmails: number;
    spamEmails: number;
    autoClassifiableEmails: number;
  };
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
