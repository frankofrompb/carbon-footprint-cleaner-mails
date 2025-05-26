
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Play, X } from "lucide-react";
import { useState } from "react";

interface MusicPromptProps {
  onActivateMusic: () => void;
  onDismiss: () => void;
}

const MusicPrompt = ({ onActivateMusic, onDismiss }: MusicPromptProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleActivateMusic = () => {
    setIsAnimating(true);
    onActivateMusic();
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-[#38c39d] border-2 bg-gradient-to-r from-green-50 to-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Music className={`h-6 w-6 text-[#38c39d] ${isAnimating ? 'animate-bounce' : ''}`} />
            <h3 className="font-semibold text-gray-800">Ambiance zen</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Activez une musique d'ambiance relaxante pendant l'analyse de vos emails ?
        </p>
        
        <div className="flex space-x-2">
          <Button
            onClick={handleActivateMusic}
            className="flex-1 bg-[#38c39d] hover:bg-[#2ea384] text-white"
            disabled={isAnimating}
          >
            <Play className={`mr-2 h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`} />
            {isAnimating ? 'Activation...' : 'Activer'}
          </Button>
          <Button
            onClick={onDismiss}
            variant="outline"
            className="flex-1"
          >
            Plus tard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MusicPrompt;
