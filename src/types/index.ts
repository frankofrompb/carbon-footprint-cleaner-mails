

export interface EmailData {
  id: string;
  subject: string;
  from: string;
  to?: string; // Ajouté pour compatibilité
  date: string;
  size?: number; // en Ko
  snippet?: string;
  isUnread: boolean; // Rendu obligatoire pour compatibilité avec IntelligentScanResults
  isRead?: boolean; // Ajouté pour compatibilité
  labels?: string[]; // Ajouté pour compatibilité
  daysSinceReceived: number; // Rendu obligatoire pour compatibilité avec IntelligentScanResults
  classification: { // Rendu obligatoire pour compatibilité avec IntelligentScanResults
    category: string;
    confidence: number;
    suggestedAction: string;
    reasoning: string;
  };
}

export interface ScanResults {
  totalEmails: number;
  totalSizeMB: number; // Rendu obligatoire pour compatibilité avec IntelligentScanResults
  carbonFootprint: number;
  emails: EmailData[];
  summary?: {
    oldUnreadEmails: number;
    promotionalEmails: number;
    socialEmails: number;
    notificationEmails: number;
    spamEmails: number;
    autoClassifiableEmails: number;
    duplicateSenderEmails: number; // Nouvelle catégorie ajoutée
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
