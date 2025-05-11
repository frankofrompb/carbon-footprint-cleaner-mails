
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";

interface LoginFormProps {
  onLoginWithGmail: () => void;
  isLoading: boolean;
}

const LoginForm = ({ onLoginWithGmail, isLoading }: LoginFormProps) => {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Nettoyage Écologique d'Emails</CardTitle>
        <CardDescription>
          Connectez-vous avec votre compte email pour commencer à réduire votre empreinte carbone
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-6 rounded-full bg-muted">
            <Mail className="h-12 w-12 text-eco-green" />
          </div>
          <p className="text-center text-muted-foreground">
            Cette application analysera vos emails non lus de plus d'un an 
            et vous proposera de les supprimer pour réduire votre empreinte carbone
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onLoginWithGmail} 
          disabled={isLoading} 
          className="w-full py-6 text-lg"
          variant="outline"
        >
          {isLoading ? "Connexion en cours..." : "Se connecter avec Gmail"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
