
export interface EmailData {
  id: string;
  subject: string;
  from: string;
  to?: string;
  date: string;
  size?: number;
  snippet?: string;
  isUnread?: boolean;
  isRead?: boolean;
  labels?: string[];
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
  totalSizeMB: number;
  carbonFootprint: number;
  emails: EmailData[];
  summary?: {
    oldUnreadEmails: number;
    promotionalEmails: number;
    socialEmails: number;
    notificationEmails: number;
    spamEmails: number;
    autoClassifiableEmails: number;
    duplicateSenderEmails: number;
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
  status: 'idle' | 'scanning' | 'completed' | 'error';
  results: ScanResults | null;
  error: string | null;
  progress: number;
  intelligentResults?: any;
}
