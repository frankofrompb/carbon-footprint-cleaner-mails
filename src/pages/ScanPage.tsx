import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import ModernLandingPage from "@/components/ModernLandingPage";
import { useScanEmails } from "@/hooks/useScanEmails";
import EmailScanner from "@/components/EmailScanner";

const ScanPage = () => {
  const { authState, loginWithGmail, logout } = useAuth();
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
        </div>
      </main>
    </div>
  );
};

export default ScanPage;