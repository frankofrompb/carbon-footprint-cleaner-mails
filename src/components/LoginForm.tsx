
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import VirtuousCircle from "./VirtuousCircle";

interface LoginFormProps {
  onLoginWithGmail: () => void;
  isLoading: boolean;
  onToggleMusic?: () => void;
}

const LoginForm = ({ onLoginWithGmail, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState("");

  const handleStartCleaning = () => {
    console.log("🚀 DÉMARRAGE du processus de connexion Gmail");
    console.log("📧 Email saisi:", email);
    
    // Vérifier si Google Identity Services est disponible
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      console.log("✅ Google Identity Services détecté");
    } else {
      console.warn("⚠️ Google Identity Services non encore disponible, tentative de connexion...");
    }
    
    // Déclencher l'authentification Gmail
    onLoginWithGmail();
  };

  return (
    <div className="w-full space-y-8">
      {/* Cercle vertueux */}
      <VirtuousCircle />
      
      {/* Bloc unifié: Impact Environnemental + Formulaire */}
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl shadow-lg" style={{backgroundColor: '#c2edfc'}}>
          <CardContent className="space-y-6 pt-6">
            {/* Section Impact Environnemental */}
            <div className="text-center">
              <h4 className="text-xl font-semibold text-[#38c39d] mb-4">Impact Environnemental</h4>
            </div>
            
            {/* Disposition en deux blocs: texte/formulaire à gauche, image à droite */}
            <div className="flex items-center gap-8">
              {/* Bloc gauche: texte et formulaire */}
              <div className="flex-1 space-y-4">
                <p className="text-muted-foreground text-left">
                  Ils prennent de la place et polluent en silence. 4g à l'envoi, 10g chaque année. Faites le ménage!
                </p>
                
                <div className="bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
                  <Input
                    type="email"
                    placeholder="Votre email Gmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 placeholder:text-gray-400 flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleStartCleaning();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleStartCleaning}
                    disabled={isLoading}
                    className="ml-2 bg-[#6366f1] hover:bg-[#5855eb] text-white px-6 py-2 rounded-full text-sm disabled:opacity-50"
                  >
                    {isLoading ? "Connexion..." : "Se connecter avec Gmail"}
                  </Button>
                </div>
                
                {/* Message d'aide */}
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {isLoading 
                      ? "Connexion en cours, veuillez patienter..." 
                      : "Cliquez sur \"Se connecter avec Gmail\" pour accéder au scan intelligent"
                    }
                  </p>
                </div>
              </div>
              
              {/* Bloc droite: image */}
              <div className="flex-shrink-0">
                <img 
                  src="/lovable-uploads/8f10e0d3-c771-47ec-b599-64b89e137f5c.png" 
                  alt="Illustration cycle écologique" 
                  className="w-40 h-32 object-contain"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bloc blanc avec les informations de sécurité */}
      <div className="flex justify-center">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-4">
              🔒 Vos données restent privées et sécurisées
            </p>
            <p className="text-sm">
              Nous analysons uniquement les métadonnées de vos emails pour vous proposer un nettoyage intelligent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
