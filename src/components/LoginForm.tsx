
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import VirtuousCircle from "./VirtuousCircle";

interface LoginFormProps {
  onLoginWithGmail: () => void;
  isLoading: boolean;
}

const LoginForm = ({ onLoginWithGmail, isLoading }: LoginFormProps) => {
  const [email, setEmail] = useState("");

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
              <h4 className="text-xl font-semibold text-[#38c39d] mb-2">Impact Environnemental</h4>
              <p className="text-muted-foreground">
                Ils prennent de la place et polluent en silence. 4g à l'envoi, 10g chaque année. Faites le ménage!
              </p>
            </div>
            
            {/* Formulaire email avec nouvelle image à droite */}
            <div className="flex items-center gap-6">
              {/* Zone du formulaire email */}
              <div className="flex-1 space-y-2">
                <div className="bg-white rounded-full px-4 py-2 flex items-center shadow-sm">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 placeholder:text-gray-400 flex-1"
                  />
                  <Button 
                    className="ml-2 bg-[#6366f1] hover:bg-[#5855eb] text-white px-4 py-1 rounded-full text-sm"
                  >
                    Commencez le nettoyage
                  </Button>
                </div>
              </div>
              
              {/* Nouvelle image à droite */}
              <div className="flex-shrink-0">
                <img 
                  src="/lovable-uploads/d99667ce-630c-4f0e-a5ad-53cd33c95f28.png" 
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
