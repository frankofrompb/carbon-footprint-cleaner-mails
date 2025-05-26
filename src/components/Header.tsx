
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Play } from "lucide-react";
import LogoWithBubbles from "./LogoWithBubbles";

interface HeaderProps {
  isAuthenticated: boolean;
  userEmail?: string | null;
  onLogout: () => void;
  onToggleMusic?: () => void;
}

const Header = ({ isAuthenticated, userEmail, onLogout, onToggleMusic }: HeaderProps) => {
  // Générer les initiales à partir de l'email
  const getInitials = (email: string) => {
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleActivateMusic = () => {
    if (onToggleMusic) {
      onToggleMusic();
    }
    // Déclencher l'événement pour activer la musique
    window.dispatchEvent(new CustomEvent('activateMusic'));
  };

  return (
    <header className="w-full bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoWithBubbles />
          <div className="flex items-center">
            <span className="font-bold text-lg flex items-center translate-y-1"><span className="text-[#38c39d]">Eco</span>InBox</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Bouton play pour la musique */}
          {onToggleMusic && (
            <Button
              onClick={handleActivateMusic}
              variant="ghost"
              size="sm"
              className="h-8 w-8 rounded-full hover:bg-gray-100"
              style={{ color: '#4878fe' }}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          
          {isAuthenticated && userEmail && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#38c39d] text-white text-sm">
                      {getInitials(userEmail)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Mon compte</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
