
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import ModernLandingPage from "@/components/ModernLandingPage";
import { useScanEmails } from "@/hooks/useScanEmails";
import EmailScanner from "@/components/EmailScanner";
import OldUnreadEmailsSection from "@/components/scan/OldUnreadEmailsSection";
import SenderAnalysisSection from "@/components/scan/SenderAnalysisSection";
import AutoFolderOrganizationSection from "@/components/scan/AutoFolderOrganizationSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ScanPage = () => {
  const { authState, loginWithGmail, logout } = useAuth();
  const navigate = useNavigate();
  const { scanState, scanEmails, deleteEmails, exportToCsv } = useScanEmails();

  // Si l'utilisateur n'est pas connecté, afficher la landing page avec connexion
  if (!authState.userEmail) {
    return (
      <div className="min-h-screen flex flex-col">
        <ModernLandingPage 
          onLoginWithGmail={loginWithGmail}
          isLoading={authState.loading}
        />
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher la page de scan
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        isAuthenticated={!!authState.userEmail}
        userEmail={authState.userEmail}
        onLogout={logout}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">📧 Scan Intelligent de votre Gmail</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connecté en tant que : <span className="font-semibold">{authState.userEmail}</span>
            </p>
          </div>

          {/* Interface de scan */}
          {scanState.status === 'idle' && (
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                <h2 className="text-xl font-semibold mb-4">🎯 Trois analyses intelligentes</h2>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl mb-2">📧</div>
                    <h3 className="font-medium">Emails non lus +6 mois</h3>
                    <p className="text-gray-600">Identifie tous les emails non ouverts depuis plus de 6 mois</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl mb-2">👥</div>
                    <h3 className="font-medium">Tri par émetteurs</h3>
                    <p className="text-gray-600">Classement décroissant des expéditeurs les plus actifs</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="text-2xl mb-2">📁</div>
                    <h3 className="font-medium">Organisation automatique</h3>
                    <p className="text-gray-600">Propose des dossiers pour factures, réservations, etc.</p>
                  </div>
                </div>
              </div>
              <EmailScanner
                scanState={scanState}
                onScan={() => scanEmails('intelligent-scan')}
                onDelete={deleteEmails}
                onExport={exportToCsv}
                userEmail={authState.userEmail}
                scanType="intelligent-scan"
              />
            </div>
          )}

          {/* Affichage des résultats */}
          {scanState.status === 'completed' && scanState.results && (
            <Tabs defaultValue="old-unread" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="old-unread">📧 Non lus +6 mois</TabsTrigger>
                <TabsTrigger value="senders">👥 Analyse émetteurs</TabsTrigger>
                <TabsTrigger value="folders">📁 Organisation</TabsTrigger>
              </TabsList>

              <TabsContent value="old-unread">
                <OldUnreadEmailsSection
                  results={scanState.results}
                  onDeleteSelected={deleteEmails}
                />
              </TabsContent>

              <TabsContent value="senders">
                <SenderAnalysisSection
                  results={scanState.results}
                  onDeleteSelected={deleteEmails}
                />
              </TabsContent>

              <TabsContent value="folders">
                <AutoFolderOrganizationSection
                  results={scanState.results}
                />
              </TabsContent>
            </Tabs>
          )}

          {/* États de scan */}
          {scanState.status === 'scanning' && (
            <EmailScanner
              scanState={scanState}
              onScan={() => scanEmails('intelligent-scan')}
              onDelete={deleteEmails}
              onExport={exportToCsv}
              userEmail={authState.userEmail}
              scanType="intelligent-scan"
            />
          )}

          {scanState.status === 'error' && (
            <EmailScanner
              scanState={scanState}
              onScan={() => scanEmails('intelligent-scan')}
              onDelete={deleteEmails}
              onExport={exportToCsv}
              userEmail={authState.userEmail}
              scanType="intelligent-scan"
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ScanPage;
