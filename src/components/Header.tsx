
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { HelpCircle } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import GoogleCloudGuide from "./GoogleCloudGuide";
import LogoWithBubbles from "./LogoWithBubbles";

interface HeaderProps {
  isAuthenticated: boolean;
  userEmail?: string | null;
  onLogout: () => void;
}

const Header = ({ isAuthenticated, userEmail, onLogout }: HeaderProps) => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <header className="w-full bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoWithBubbles />
          <div className="flex items-center">
            <span className="font-bold text-lg flex items-center translate-y-0.5"><span className="text-[#38c39d]">Eco</span>InBox</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowGuide(true)}
            className="flex items-center gap-1"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden md:inline">Configuration</span>
          </Button>
          
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {userEmail}
              </span>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Guide de Configuration</DialogTitle>
          </DialogHeader>
          <GoogleCloudGuide />
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
