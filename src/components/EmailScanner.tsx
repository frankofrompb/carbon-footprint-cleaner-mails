import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Shell } from "@/components/ui/shell";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { saveAs } from 'file-saver';
import { Checkbox } from "@/components/ui/checkbox"
import { useDebounce } from "@/hooks/useDebounce";
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
} from "@/components/ui/alert-dialog"
import { ScanState, ScanResults, EmailData } from "@/types";

interface EmailScannerProps {
  scanState: ScanState;
  onScan: () => void;
  onDelete: (emailIds: string[]) => void;
  onExport: () => void;
  userEmail: string | null;
  scanType?: string;
}

const EmailScanner = ({ scanState, onScan, onDelete, onExport, userEmail, scanType }: EmailScannerProps) => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { toast } = useToast();

  console.log('📊 EmailScanner - État du scan:', scanState);
  console.log('📊 EmailScanner - Type de scan:', scanType);
  console.log('📊 EmailScanner - Résultats bruts:', scanState.results);
  console.log('📊 EmailScanner - Emails disponibles:', scanState.results?.emails?.length || 0);

  const handleSelectEmail = (emailId: string) => {
    setSelectedEmails((prevSelected) =>
      prevSelected.includes(emailId)
        ? prevSelected.filter((id) => id !== emailId)
        : [...prevSelected, emailId]
    );
  };

  const handleSelectAllEmails = () => {
    if (scanState.results?.emails) {
      const allEmailIds = scanState.results.emails.map((email) => email.id);
      setSelectedEmails(selectedEmails.length === allEmailIds.length ? [] : allEmailIds);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedEmails.length > 0) {
      onDelete(selectedEmails);
      setSelectedEmails([]);
      setIsDeleteModalOpen(false);
      toast({
        title: "Suppression réussie!",
        description: "Les emails sélectionnés ont été supprimés avec succès.",
      })
    }
  };

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen(!isDeleteModalOpen);
  };

  const handleExport = () => {
    onExport();
  };

  const filteredEmails = scanState.results?.emails.filter(email => {
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

  // Fonction pour afficher les résultats du scan intelligent
  const renderIntelligentScanResults = () => {
    if (!scanState.results) {
      console.log('🚫 Aucun résultat disponible');
      return null;
    }

    console.log('🎯 Rendu des résultats du scan intelligent:', scanState.results);
    console.log('🎯 Emails à afficher:', scanState.results.emails?.length || 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">📊 Résultats du Scan Intelligent RÉEL</h3>
          <div className="text-sm text-gray-600">
            Connecté à <span className="font-semibold">{userEmail}</span>
          </div>
        </div>

        {/* DEBUG: Afficher les données brutes */}
        <div className="p-4 bg-gray-100 rounded-lg text-xs">
          <p><strong>DEBUG:</strong></p>
          <p>Total emails: {scanState.results.totalEmails}</p>
          <p>Emails sample: {scanState.results.emails?.length || 0}</p>
          <p>Summary disponible: {scanState.results.summary ? 'OUI' : 'NON'}</p>
          <p>Carbon footprint: {scanState.results.carbonFootprint}</p>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
            <p className="text-sm text-blue-600">📧 Total trouvés</p>
            <p className="text-3xl font-bold text-blue-700">{scanState.results.totalEmails || 0}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center border border-green-200">
            <p className="text-sm text-green-600">💾 Taille totale</p>
            <p className="text-3xl font-bold text-green-700">
              {scanState.results.totalSizeMB ? scanState.results.totalSizeMB.toFixed(1) : '0.0'} Mo
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg text-center border border-orange-200">
            <p className="text-sm text-orange-600">🌍 Empreinte carbone</p>
            <p className="text-3xl font-bold text-orange-700">
              {Math.round((scanState.results.carbonFootprint || 0) / 1000)} kg CO₂
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center border border-purple-200">
            <p className="text-sm text-purple-600">🧪 Échantillon traité</p>
            <p className="text-3xl font-bold text-purple-700">{scanState.results.emails?.length || 0}</p>
          </div>
        </div>

        {/* Résumé des classifications */}
        {scanState.results.summary && (
          <div className="bg-white border rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">🎯 Classification Intelligente</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {scanState.results.summary.oldUnreadEmails || 0}
                </div>
                <div className="text-sm text-red-700">Non lus +6 mois</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {scanState.results.summary.promotionalEmails || 0}
                </div>
                <div className="text-sm text-yellow-700">Promotionnels</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {scanState.results.summary.socialEmails || 0}
                </div>
                <div className="text-sm text-blue-700">Réseaux sociaux</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {scanState.results.summary.autoClassifiableEmails || 0}
                </div>
                <div className="text-sm text-green-700">Auto-classifiables</div>
              </div>
            </div>
          </div>
        )}

        {/* Liste des emails avec recherche */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">📧 Échantillon d'emails analysés (VRAIS EMAILS)</h4>
            <Input
              type="search"
              placeholder="Rechercher un email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          {paginatedEmails.length > 0 ? (
            <Table>
              <TableCaption>Échantillon de {scanState.results.emails?.length || 0} emails analysés sur {scanState.results.totalEmails} trouvés.</TableCaption>
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
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun email trouvé dans l'échantillon.</p>
              <p className="text-sm text-gray-400">Pourtant {scanState.results.totalEmails} emails ont été détectés au total.</p>
            </div>
          )}

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
                  <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>Supprimer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={handleExport} disabled={!scanState.results.emails?.length}>
              Exporter en CSV
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analyse de la boite mail</h2>
      </div>

      {scanState.status === 'idle' && (
        <div className="text-center">
          <p className="text-muted-foreground">Prêt à scanner votre boîte mail.</p>
          <Button onClick={onScan}>Commencer l'analyse</Button>
        </div>
      )}

      {scanState.status === 'scanning' && (
        <div className="space-y-4">
          <p className="text-center">Analyse en cours... ({scanState.progress}%)</p>
          <Progress value={scanState.progress} />
        </div>
      )}

      {scanState.status === 'completed' && scanState.results && (
        <div className="space-y-6">
          {scanType === 'intelligent-scan' ? (
            renderIntelligentScanResults()
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Résultats de l'analyse</h3>
                <Input
                  type="search"
                  placeholder="Rechercher un email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Emails trouvés</p>
                  <p className="text-3xl font-bold text-eco-green">{scanState.results.emails?.length || 0}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Taille totale</p>
                  <p className="text-3xl font-bold text-eco-blue">
                    {scanState.results.totalSizeMB ? scanState.results.totalSizeMB.toFixed(2) : '0.00'} Mo
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">CO₂ économisé</p>
                  <p className="text-3xl font-bold text-eco-green">
                    {((scanState.results.totalSizeMB || 0) * 0.004).toFixed(3)} kg
                  </p>
                </div>
              </div>

              <Table>
                <TableCaption>Liste des emails analysés.</TableCaption>
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
                    <TableHead className="text-right">Taille</TableHead>
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
                      <TableCell>{email.from}</TableCell>
                      <TableCell>{email.subject}</TableCell>
                      <TableCell className="text-right">{((email.size || 0) / 1024).toFixed(2)} KB</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4}>
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
                      <AlertDialogCancel onClick={() => setIsDeleteModalOpen(false)}>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button onClick={handleExport} disabled={!scanState.results.emails?.length}>
                  Exporter en CSV
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {scanState.status === 'error' && (
        <div className="text-center text-red-500">
          <p>Erreur lors de l'analyse : {scanState.error}</p>
        </div>
      )}
    </div>
  );
};

export default EmailScanner;
