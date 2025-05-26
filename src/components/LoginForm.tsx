
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
      
      {/* Carte de connexion */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md shadow-lg" style={{backgroundColor: '#c2edfc'}}>
          <CardContent className="space-y-4 pt-6">
            {/* Champ Email avec le style demandé */}
            <div className="space-y-2">
              <div className="bg-white rounded-full px-4 py-3 flex items-center shadow-sm">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-600 placeholder:text-gray-400"
                />
                <Button 
                  className="ml-2 bg-[#6366f1] hover:bg-[#5855eb] text-white px-6 py-2 rounded-full"
                >
                  Commencez le nettoyage
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={onLoginWithGmail} 
              disabled={isLoading} 
              className="w-full py-6 text-lg bg-[#38c39d] hover:bg-[#2d8b61]"
            >
              {isLoading ? "Connexion en cours..." : "Se connecter avec Gmail"}
            </Button>
          </CardFooter>
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
