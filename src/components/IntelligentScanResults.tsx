
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { 
  Trash2, 
  FolderOpen, 
  Calendar, 
  Mail, 
  AlertTriangle, 
  Users, 
  Bell,
  ShoppingCart,
  Plane,
  FileText
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface EmailData {
  id: string;
  subject: string;
  from: string;
  date: string;
  size?: number;
  snippet?: string;
  isUnread: boolean;
  daysSinceReceived: number;
  classification: {
    category: string;
    confidence: number;
    suggestedAction: string;
    reasoning: string;
  };
}

interface ScanResults {
  totalEmails: number;
  totalSizeMB: number;
  carbonFootprint: number;
  emails: EmailData[];
  summary: {
    oldUnreadEmails: number;
    promotionalEmails: number;
    socialEmails: number;
    notificationEmails: number;
    spamEmails: number;
    autoClassifiableEmails: number;
  };
}

interface IntelligentScanResultsProps {
  results: ScanResults;
  onDeleteSelected: (emailIds: string[]) => void;
  onOrganizeSelected: (emailIds: string[]) => void;
}

const categoryConfig = {
  old_unread: {
    icon: <Calendar className="h-4 w-4" />,
    label: "Non lus +6 mois",
    color: "destructive",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  promotional: {
    icon: <Mail className="h-4 w-4" />,
    label: "Promotionnel",
    color: "secondary",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  social: {
    icon: <Users className="h-4 w-4" />,
    label: "Réseaux sociaux",
    color: "default",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  notification: {
    icon: <Bell className="h-4 w-4" />,
    label: "Notifications",
    color: "secondary",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200"
  },
  spam: {
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Spam potentiel",
    color: "destructive",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  },
  order_confirmation: {
    icon: <ShoppingCart className="h-4 w-4" />,
    label: "Confirmations",
    color: "default",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  travel: {
    icon: <Plane className="h-4 w-4" />,
    label: "Voyage",
    color: "default",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  newsletter: {
    icon: <FileText className="h-4 w-4" />,
    label: "Newsletters",
    color: "secondary",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  },
  other: {
    icon: <FolderOpen className="h-4 w-4" />,
    label: "Autres",
    color: "outline",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  }
};

const IntelligentScanResults = ({ results, onDeleteSelected, onOrganizeSelected }: IntelligentScanResultsProps) => {
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredEmails = filterCategory === 'all' 
    ? results.emails 
    : results.emails.filter(email => email.classification.category === filterCategory);

  const handleEmailToggle = (emailId: string, checked: boolean) => {
    const newSelected = new Set(selectedEmails);
    if (checked) {
      newSelected.add(emailId);
    } else {
      newSelected.delete(emailId);
    }
    setSelectedEmails(newSelected);
  };

  const handleSelectAllInCategory = (category: string) => {
    const categoryEmails = results.emails.filter(email => 
      category === 'all' || email.classification.category === category
    );
    const newSelected = new Set(selectedEmails);
    categoryEmails.forEach(email => newSelected.add(email.id));
    setSelectedEmails(newSelected);
  };

  const getCategoryStats = () => {
    const categories = Object.keys(categoryConfig);
    return categories.map(category => ({
      category,
      count: results.emails.filter(email => email.classification.category === category).length,
      ...categoryConfig[category as keyof typeof categoryConfig]
    })).filter(stat => stat.count > 0);
  };

  return (
    <div className="space-y-6">
      {/* Résumé du scan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Résultats du scan intelligent
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{formatNumber(results.summary.oldUnreadEmails)}</div>
              <div className="text-sm text-red-700">Non lus +6 mois</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{formatNumber(results.summary.promotionalEmails)}</div>
              <div className="text-sm text-orange-700">Promotionnels</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{formatNumber(results.summary.socialEmails)}</div>
              <div className="text-sm text-blue-700">Réseaux sociaux</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{formatNumber(results.summary.autoClassifiableEmails)}</div>
              <div className="text-sm text-green-700">Auto-classifiables</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtres par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterCategory('all')}
              className="flex items-center gap-2"
            >
              Toutes ({formatNumber(results.emails.length)})
            </Button>
            {getCategoryStats().map(({ category, count, icon, label }) => (
              <Button
                key={category}
                variant={filterCategory === category ? 'default' : 'outline'}
                onClick={() => setFilterCategory(category)}
                className="flex items-center gap-2"
              >
                {icon}
                {label} ({formatNumber(count)})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      {selectedEmails.size > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => onDeleteSelected(Array.from(selectedEmails))}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer {formatNumber(selectedEmails.size)} emails
              </Button>
              <Button
                onClick={() => onOrganizeSelected(Array.from(selectedEmails))}
                variant="default"
                className="flex items-center gap-2"
              >
                <FolderOpen className="h-4 w-4" />
                Organiser {formatNumber(selectedEmails.size)} emails
              </Button>
              <Button
                onClick={() => setSelectedEmails(new Set())}
                variant="outline"
              >
                Désélectionner tout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des emails */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Emails détectés ({formatNumber(filteredEmails.length)})
            </CardTitle>
            <Button
              onClick={() => handleSelectAllInCategory(filterCategory)}
              variant="outline"
              size="sm"
            >
              Tout sélectionner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredEmails.map((email) => {
              const config = categoryConfig[email.classification.category as keyof typeof categoryConfig] || categoryConfig.other;
              return (
                <div key={email.id} className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedEmails.has(email.id)}
                      onCheckedChange={(checked) => handleEmailToggle(email.id, checked as boolean)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={config.color as any} className="flex items-center gap-1">
                          {config.icon}
                          {config.label}
                        </Badge>
                        {email.isUnread && (
                          <Badge variant="outline">Non lu</Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                          il y a {email.daysSinceReceived} jours
                        </span>
                      </div>
                      <h4 className="font-medium truncate">{email.subject}</h4>
                      <p className="text-sm text-muted-foreground truncate">{email.from}</p>
                      {email.snippet && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {email.snippet}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Confiance: {Math.round(email.classification.confidence * 100)}%</span>
                        <span>Action suggérée: {email.classification.suggestedAction}</span>
                        <span>{email.size}Ko</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentScanResults;
