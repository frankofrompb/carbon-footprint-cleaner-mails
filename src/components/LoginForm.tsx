
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import VirtuousCircle from "./VirtuousCircle";

interface LoginFormProps {
  onLoginWithGmail: () => void;
  isLoading: boolean;
}

const LoginForm = ({ onLoginWithGmail, isLoading }: LoginFormProps) => {
  return (
    <div className="w-full space-y-8">
      {/* Cercle vertueux */}
      <VirtuousCircle />
      
      {/* Carte de connexion */}
      <div className="flex justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Commencez votre nettoyage</CardTitle>
            <CardDescription>
              Connectez-vous avec votre compte Gmail pour analyser et nettoyer vos emails
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">
                🔒 Vos données restent privées et sécurisées
              </p>
              <p className="text-sm">
                Nous analysons uniquement les métadonnées de vos emails pour vous proposer un nettoyage intelligent
              </p>
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
    </div>
  );
};

export default LoginForm;
