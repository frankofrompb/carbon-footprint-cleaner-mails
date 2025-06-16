
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FolderOpen, Mail, BarChart3 } from "lucide-react";
import { ScanResults } from "@/types";

interface AdvancedClassificationSectionProps {
  results: ScanResults;
}

const AdvancedClassificationSection = ({ results }: AdvancedClassificationSectionProps) => {
  // Grouper tous les emails par expéditeur avec classification détaillée
  const emailsBySender = results.emails.reduce((acc, email) => {
    const sender = email.from;
    if (!acc[sender]) {
      acc[sender] = {
        emails: [],
        count: 0,
        categories: {} as Record<string, number>,
        mainCategory: 'other'
      };
    }
    acc[sender].emails.push(email);
    acc[sender].count++;
    
    const category = email.classification?.category || 'other';
    acc[sender].categories[category] = (acc[sender].categories[category] || 0) + 1;
    
    // Déterminer la catégorie principale
    const maxCategory = Object.entries(acc[sender].categories)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    acc[sender].mainCategory = maxCategory;
    
    return acc;
  }, {} as Record<string, { 
    emails: any[], 
    count: number, 
    categories: Record<string, number>,
    mainCategory: string 
  }>);

  const senderEntries = Object.entries(emailsBySender)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 25);

  const getCategoryColor = (category: string) => {
    const colors = {
      promotional: 'bg-orange-100 text-orange-800',
      social: 'bg-blue-100 text-blue-800',
      notification: 'bg-yellow-100 text-yellow-800',
      old_unread: 'bg-red-100 text-red-800',
      spam: 'bg-red-100 text-red-800',
      newsletter: 'bg-gray-100 text-gray-800',
      order_confirmation: 'bg-green-100 text-green-800',
      travel: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-600'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          Classification avancée
        </CardTitle>
        <p className="text-sm text-gray-600">
          Analyse complète de tous les emails par expéditeur - {results.totalEmails} emails analysés
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {senderEntries.map(([sender, data]) => (
            <div key={sender} className="p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="font-medium truncate flex-1">{sender}</span>
                <Badge className={getCategoryColor(data.mainCategory)}>
                  {data.mainCategory.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{data.count} emails</span>
                <div className="flex gap-1">
                  {Object.entries(data.categories).map(([cat, count]) => (
                    <Badge key={cat} variant="outline" className="text-xs">
                      {cat}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedClassificationSection;
