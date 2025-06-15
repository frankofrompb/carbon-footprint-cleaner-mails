
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
import { useState } from "react";
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

  console.log('🔥 DEBUG IntelligentScanDisplay - DONNÉES REÇUES AU RENDU:', {
    totalEmails: results.totalEmails,
    emailsCount: results.emails?.length || 0,
    premiersEmails: results.emails?.slice(0, 3)?.map(email => ({
      id: email.id,
      subject: email.subject,
      from: email.from,
      date: email.date
    })),
    summary: results.summary,
    carbonFootprint: results.carbonFootprint,
    totalSizeMB: results.totalSizeMB,
    userEmail: userEmail
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
      (email.to && email.to.toLowerCase().includes(searchTerm)) ||
      email.subject.toLowerCase().includes(searchTerm)
    );
  }) || [];

  const totalEmails = filteredEmails.length;
  const totalPages = Math.ceil(totalEmails / itemsPerPage);
  const paginatedEmails = filteredEmails.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">📊 Résultats du Scan Intelligent</h3>
        <div className="text-sm text-gray-600">
          Connecté à <span className="font-semibold">{userEmail}</span>
        </div>
      </div>

      {/* DEBUG: Afficher les données brutes */}
      <Card className="bg-red-50 border-red-300">
        <CardHeader>
          <CardTitle className="text-sm text-red-700">🔥 DEBUG FINAL - Données au moment de l'affichage</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <p><strong>Total emails trouvés:</strong> {results.totalEmails}</p>
          <p><strong>Échantillon reçu:</strong> {results.emails?.length || 0} emails</p>
          <p><strong>Emails filtrés pour affichage:</strong> {filteredEmails.length}</p>
          
          {results.emails && results.emails.length > 0 && (
            <div className="mt-2 p-2 bg-white rounded border">
              <p><strong>PREMIERS EMAILS REÇUS:</strong></p>
              {results.emails.slice(0, 5).map((email, index) => (
                <div key={index} className="text-xs mb-1 p-1 bg-gray-50 rounded">
                  <p><strong>#{index + 1}:</strong></p>
                  <p><strong>ID:</strong> {email.id}</p>
                  <p><strong>De:</strong> {email.from}</p>
                  <p><strong>Sujet:</strong> {email.subject}</p>
                  <p><strong>Date:</strong> {email.date}</p>
                </div>
              ))}
            </div>
          )}
          
          <p><strong>Summary disponible:</strong> {results.summary ? 'OUI' : 'NON'}</p>
          {results.summary && (
            <div className="mt-2 p-2 bg-white rounded border">
              <p><strong>Résumé:</strong></p>
              <p>• Non lus +6 mois: {results.summary.oldUnreadEmails || 0}</p>
              <p>• Promotionnels: {results.summary.promotionalEmails || 0}</p>
              <p>• Réseaux sociaux: {results.summary.socialEmails || 0}</p>
              <p>• Auto-classifiables: {results.summary.autoClassifiableEmails || 0}</p>
            </div>
          )}
        </CardContent>
      </Card>

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
            <CardTitle>📧 Échantillon d'emails analysés</CardTitle>
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
                  Échantillon de {results.emails?.length || 0} emails analysés sur {results.totalEmails} trouvés.
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
                        Cette action est irréversible. Les emails sélectionnés seront définitivement supprimés.
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
              <p className="text-gray-500">Aucun email trouvé dans l'échantillon.</p>
              <p className="text-sm text-gray-400">Pourtant {results.totalEmails} emails ont été détectés au total.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentScanDisplay;
