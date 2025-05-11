
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Leaf } from "lucide-react";

interface HeaderProps {
  isAuthenticated: boolean;
  userEmail?: string | null;
  onLogout: () => void;
}

const Header = ({ isAuthenticated, userEmail, onLogout }: HeaderProps) => {
  return (
    <header className="w-full bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-eco-green" />
          <span className="font-bold text-lg">EcoMailCleaner</span>
        </div>
        
        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:inline-block">
              {userEmail}
            </span>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              Déconnexion
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
