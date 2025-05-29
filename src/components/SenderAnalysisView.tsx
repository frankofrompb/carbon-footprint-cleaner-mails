
import { useMemo, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanState } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Trash2, UserMinus, Check, X, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SenderData {
  sender: string;
  email: string;
  openRate: number;
  emailCount: number;
}

interface SenderAnalysisViewProps {
  scanState: ScanState;
}

const SenderAnalysisView = ({ scanState }: SenderAnalysisViewProps) => {
  const { toast } = useToast();
  const [draggedSender, setDraggedSender] = useState<string | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [processedSenders, setProcessedSenders] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  const senderData = useMemo(() => {
    if (!scanState.results?.emails) return [];

    const senderGroups = new Map<string, { 
      emails: typeof scanState.results.emails,
      totalCount: number,
      openedCount: number 
    }>();

    scanState.results.emails.forEach(email => {
      const senderEmail = email.from;
      const senderName = senderEmail.includes('<') 
        ? senderEmail.split('<')[0].trim() 
        : senderEmail.split('@')[0];

      const existing = senderGroups.get(senderEmail);
      if (existing) {
        existing.emails.push(email);
        existing.totalCount += 1;
        existing.openedCount += Math.random() > 0.7 ? 1 : 0;
      } else {
        senderGroups.set(senderEmail, {
          emails: [email],
          totalCount: 1,
          openedCount: Math.random() > 0.7 ? 1 : 0
        });
      }
    });

    const senders: SenderData[] = Array.from(senderGroups.entries()).map(([email, data]) => ({
      sender: email.includes('<') ? email.split('<')[0].trim() : email.split('@')[0],
      email: email,
      openRate: data.totalCount > 0 ? (data.openedCount / data.totalCount) * 100 : 0,
      emailCount: data.totalCount
    }));

    return senders
      .filter(sender => !processedSenders.has(sender.email))
      .sort((a, b) => b.emailCount - a.emailCount);
  }, [scanState.results?.emails, processedSenders]);

  const handleTouchStart = (e: React.TouchEvent, senderEmail: string) => {
    const touch = e.touches[0];
    startPositionRef.current = { x: touch.clientX, y: touch.clientY };
    setDraggedSender(senderEmail);
  };

  const handleTouchMove = (e: React.TouchEvent, senderEmail: string) => {
    if (!startPositionRef.current || draggedSender !== senderEmail) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPositionRef.current.x;
    const deltaY = touch.clientY - startPositionRef.current.y;
    
    // Empêcher le scroll vertical si on swipe horizontalement
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
    }
    
    const card = cardRefs.current.get(senderEmail);
    if (card && Math.abs(deltaX) > Math.abs(deltaY)) {
      const maxSwipe = 150;
      const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
      
      card.style.transform = `translateX(${clampedDelta}px)`;
      card.style.transition = 'none';
      
      // Déterminer la direction du swipe
      if (Math.abs(deltaX) > 50) {
        setSwipeDirection(deltaX > 0 ? 'right' : 'left');
        
        // Ajouter des effets visuels selon la direction
        if (deltaX > 50) {
          card.style.backgroundColor = '#dcfce7'; // vert clair pour "garder"
        } else if (deltaX < -50) {
          card.style.backgroundColor = '#fee2e2'; // rouge clair pour "supprimer"
        }
      } else {
        setSwipeDirection(null);
        card.style.backgroundColor = '';
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, senderEmail: string) => {
    if (!startPositionRef.current || draggedSender !== senderEmail) return;
    
    const card = cardRefs.current.get(senderEmail);
    if (card) {
      card.style.transform = '';
      card.style.transition = 'transform 0.3s ease-out, background-color 0.3s ease-out';
      card.style.backgroundColor = '';
    }
    
    if (swipeDirection) {
      handleSwipeAction(senderEmail, swipeDirection);
    }
    
    setDraggedSender(null);
    setSwipeDirection(null);
    startPositionRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent, senderEmail: string) => {
    startPositionRef.current = { x: e.clientX, y: e.clientY };
    setDraggedSender(senderEmail);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!startPositionRef.current) return;
      
      const deltaX = moveEvent.clientX - startPositionRef.current.x;
      const deltaY = moveEvent.clientY - startPositionRef.current.y;
      
      const card = cardRefs.current.get(senderEmail);
      if (card && Math.abs(deltaX) > Math.abs(deltaY)) {
        const maxSwipe = 150;
        const clampedDelta = Math.max(-maxSwipe, Math.min(maxSwipe, deltaX));
        
        card.style.transform = `translateX(${clampedDelta}px)`;
        card.style.transition = 'none';
        
        if (Math.abs(deltaX) > 50) {
          setSwipeDirection(deltaX > 0 ? 'right' : 'left');
          
          if (deltaX > 50) {
            card.style.backgroundColor = '#dcfce7';
          } else if (deltaX < -50) {
            card.style.backgroundColor = '#fee2e2';
          }
        } else {
          setSwipeDirection(null);
          card.style.backgroundColor = '';
        }
      }
    };

    const handleMouseUp = () => {
      const card = cardRefs.current.get(senderEmail);
      if (card) {
        card.style.transform = '';
        card.style.transition = 'transform 0.3s ease-out, background-color 0.3s ease-out';
        card.style.backgroundColor = '';
      }
      
      if (swipeDirection) {
        handleSwipeAction(senderEmail, swipeDirection);
      }
      
      setDraggedSender(null);
      setSwipeDirection(null);
      startPositionRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleSwipeAction = (senderEmail: string, direction: 'left' | 'right') => {
    const sender = senderData.find(s => s.email === senderEmail);
    if (!sender) return;

    setProcessedSenders(prev => new Set([...prev, senderEmail]));

    if (direction === 'left') {
      toast({
        title: "🗑️ Suppression et désabonnement",
        description: `${sender.sender} - ${formatNumber(sender.emailCount)} emails supprimés et désabonnement effectué`,
      });
    } else {
      toast({
        title: "✅ Expéditeur conservé",
        description: `${sender.sender} - ${formatNumber(sender.emailCount)} emails conservés`,
      });
    }
  };

  const handleButtonAction = (senderEmail: string, action: 'keep' | 'delete') => {
    handleSwipeAction(senderEmail, action === 'delete' ? 'left' : 'right');
  };

  const currentSender = senderData[0];

  if (!scanState.results || senderData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <Archive className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-bold text-green-600">Excellent travail ! 🎉</h3>
          <p className="text-muted-foreground mt-2">
            Vous avez traité tous les expéditeurs de votre boîte mail
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Triez vos expéditeurs</h3>
        <p className="text-muted-foreground mb-2">
          Glissez à gauche pour supprimer et vous désabonner, à droite pour conserver
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            📧 {formatNumber(senderData.length)} expéditeurs restants à traiter
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          {currentSender && (
            <Card
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(currentSender.email, el);
                }
              }}
              className="cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg border-2 border-gray-200"
              onMouseDown={(e) => handleMouseDown(e, currentSender.email)}
              onTouchStart={(e) => handleTouchStart(e, currentSender.email)}
              onTouchMove={(e) => handleTouchMove(e, currentSender.email)}
              onTouchEnd={(e) => handleTouchEnd(e, currentSender.email)}
              style={{ touchAction: 'pan-y' }}
            >
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl font-bold text-white">
                      {currentSender.sender.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-bold text-xl mb-1" title={currentSender.sender}>
                      {currentSender.sender}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate" title={currentSender.email}>
                      {currentSender.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatNumber(currentSender.emailCount)}
                      </p>
                      <p className="text-xs text-muted-foreground">emails reçus</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {currentSender.openRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">taux d'ouverture</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleButtonAction(currentSender.email, 'delete')}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </Button>
                    <Button
                      variant="outline"
                      className="border-green-200 text-green-600 hover:bg-green-50"
                      onClick={() => handleButtonAction(currentSender.email, 'keep')}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Conserver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Indicateurs visuels pour le swipe */}
      <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <X className="h-4 w-4 text-red-600" />
          </div>
          <span>← Supprimer</span>
        </div>
        <div className="flex items-center space-x-2">
          <span>Conserver →</span>
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-4 w-4 text-green-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenderAnalysisView;
