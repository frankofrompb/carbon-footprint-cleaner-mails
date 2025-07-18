import { ScanResults } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";

interface IntelligentScanDisplayProps {
  results: ScanResults;
  userEmail: string | null;
  onDeleteSelected: (emailIds: string[]) => void;
  onExport: () => void;
}

const IntelligentScanDisplay = ({ results, userEmail, onDeleteSelected, onExport }: IntelligentScanDisplayProps) => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // LOGS DE DÉBOGAGE POUR IDENTIFIER LE PROBLÈME
  useEffect(() => {
    console.log('🎯 IntelligentScanDisplay - PROPS REÇUES AU MONTAGE:', {
      hasResults: !!results,
      totalEmails: results?.totalEmails,
      emailsCount: results?.emails?.length || 0,
      userEmail: userEmail,
      premiersEmails: results?.emails?.slice(0, 3)?.map(e => ({ 
        id: e.id, 
        subject: e.subject?.substring(0, 50), 
        from: e.from?.substring(0, 30) 
      }))
    });

    if (results?.emails && results.emails.length > 0) {
      console.log('📧 DÉTAIL DU PREMIER EMAIL REÇU:');
      console.log('ID:', results.emails[0].id);
      console.log('Subject:', results.emails[0].subject);
      console.log('From:', results.emails[0].from);
      console.log('Date:', results.emails[0].date);
      console.log('Classification:', results.emails[0].classification);
    }
  }, [results, userEmail]);

  console.log('🔄 IntelligentScanDisplay - RENDER:', {
    totalEmails: results?.totalEmails,
    emailsCount: results?.emails?.length || 0,
    summary: results?.summary,
    carbonFootprint: results?.carbonFootprint,
    totalSizeMB: results?.totalSizeMB,
    premiersEmailsRender: results?.emails?.slice(0, 2)?.map(e => ({ 
      id: e.id, 
      subject: e.subject, 
      from: e.from 
    }))
  });

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails((prevSelected) =>
      prevSelected.includes(emailId)
        ? prevSelected.filter((id) => id !== emailId)
        : [...prevSelected, emailId]
    );
  };

  const handleSelectAllEmails = () => {
    if (results?.emails) {
      const allEmailIds = results.emails.map((email) => email.id);
      setSelectedEmails(selectedEmails.length === allEmailIds.length ? [] : allEmailIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedEmails.length > 0) {
      onDeleteSelected(selectedEmails);
      setSelectedEmails([]);
    }
  };

  const filteredEmails = results?.emails?.filter(email => {
    const searchTerm = debouncedSearchQuery.toLowerCase();
    return (
      email.from.toLowerCase().includes(searchTerm) ||
      email.subject.toLowerCase().includes(searchTerm)
    );
  }) || [];

  console.log('🔍 EMAILS FILTRÉS POUR AFFICHAGE:', {
    nombreTotal: results?.emails?.length || 0,
    nombreFiltre: filteredEmails.length,
    recherche: searchQuery,
    premiersFiltrés: filteredEmails.slice(0, 2).map(e => ({
      id: e.id,
      subject: e.subject?.substring(0, 40),
      from: e.from?.substring(0, 20)
    }))
  });

  const totalEmails = filteredEmails.length;
  const totalPages = Math.ceil(totalEmails / itemsPerPage);
  const paginatedEmails = filteredEmails.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  console.log('📄 EMAILS PAGINÉS POUR AFFICHAGE:', {
    page: page,
    itemsPerPage: itemsPerPage,
    totalPages: totalPages,
    emailsPagines: paginatedEmails.length,
    premierEmailPagine: paginatedEmails[0] ? {
      id: paginatedEmails[0].id,
      subject: paginatedEmails[0].subject,
      from: paginatedEmails[0].from
    } : 'AUCUN EMAIL'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">📊 Résultats du Scan Intelligent</h3>
        <div className="text-sm text-gray-600">
          Connecté à <span className="font-semibold">{userEmail}</span>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
          <p className="text-sm text-blue-600">📧 Total trouvés</p>
          <p className="text-3xl font-bold text-blue-700">{results.totalEmails || 0}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-center border border-green-200">
          <p className="text-sm text-green-600">💾 Taille totale</p>
          <p className="text-3xl font-bold text-green-700">
            {results.totalSizeMB ? results.totalSizeMB.toFixed(1) : '0.0'} Mo
          </p>
        </div>
        <div className="p-4 bg-orange-50 rounded-lg text-center border border-orange-200">
          <p className="text-sm text-orange-600">🌍 Empreinte carbone</p>
          <p className="text-3xl font-bold text-orange-700">
            {Math.round((results.carbonFootprint || 0) / 1000)} kg CO₂
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-200">
          <p className="text-sm text-purple-600">🧪 Échantillon traité</p>
          <p className="text-3xl font-bold text-purple-700">{results.emails?.length || 0}</p>
        </div>
      </div>

      {/* Résumé des classifications */}
      {results.summary && (
        <Card>
          <CardHeader>
            <CardTitle>🎯 Classification Intelligente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {results.summary.oldUnreadEmails || 0}
                </div>
                <div className="text-sm text-red-700">Non lus +6 mois</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {results.summary.promotionalEmails || 0}
                </div>
                <div className="text-sm text-yellow-700">Promotionnels</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {results.summary.socialEmails || 0}
                </div>
                <div className="text-sm text-blue-700">Réseaux sociaux</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {results.summary.autoClassifiableEmails || 0}
                </div>
                <div className="text-sm text-green-700">Auto-classifiables</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des emails avec recherche */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📧 Emails Gmail analysés</CardTitle>
            <Input
              type="search"
              placeholder="Rechercher un email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          {paginatedEmails.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableCaption>
                  Échantillon de {results.emails?.length || 0} emails analysés sur {results.totalEmails} trouvés dans Gmail.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedEmails.length === totalEmails && totalEmails > 0}
                        onCheckedChange={() => handleSelectAllEmails()}
                        aria-label="Sélectionner tous les emails"
                      />
                    </TableHead>
                    <TableHead>Expéditeur</TableHead>
                    <TableHead>Sujet</TableHead>
                    <TableHead>Classification</TableHead>
                    <TableHead className="text-right">Taille</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">
                        <Checkbox
                          checked={selectedEmails.includes(email.id)}
                          onCheckedChange={() => handleSelectEmail(email.id)}
                          aria-label={`Sélectionner l'email de ${email.from}`}
                        />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{email.from}</TableCell>
                      <TableCell className="max-w-[300px] truncate">{email.subject}</TableCell>
                      <TableCell>
                        {email.classification && (
                          <Badge
                            variant={
                              email.classification.category === 'old_unread' ? 'destructive' :
                              email.classification.category === 'promotional' ? 'default' :
                              email.classification.category === 'social' ? 'secondary' :
                              'outline'
                            }
                            className="text-xs"
                          >
                            {email.classification.category.replace('_', ' ')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{((email.size || 0) / 1024).toFixed(1)} KB</TableCell>
                      <TableCell className="text-right text-sm text-gray-500">
                        {new Date(email.date).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Pagination>
                        <PaginationContent>
                          <PaginationPrevious
                            onClick={() => setPage(Math.max(1, page - 1))}
                            className={page === 1 ? "pointer-events-none opacity-50" : ""}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </PaginationPrevious>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                onClick={() => setPage(pageNumber)}
                                isActive={pageNumber === page}
                                aria-label={`Aller à la page ${pageNumber}`}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationNext
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </PaginationNext>
                        </PaginationContent>
                      </Pagination>
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>

              <div className="flex justify-end space-x-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={selectedEmails.length === 0}
                    >
                      Supprimer sélection ({selectedEmails.length})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Les emails sélectionnés seront définitivement supprimés de votre Gmail.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={onExport} disabled={!results.emails?.length}>
                  Exporter en CSV
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun email trouvé correspondant à votre recherche.</p>
              <p className="text-sm text-gray-400">Pourtant {results.totalEmails} emails ont été détectés au total dans Gmail.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentScanDisplay;
