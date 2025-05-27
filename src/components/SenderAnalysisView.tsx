
import { useMemo, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanState } from "@/types";
import { formatNumber } from "@/lib/utils";
import { Trash2, UserMinus, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
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
  const [dragDirection, setDragDirection] = useState<string | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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
        // Simulation du taux d'ouverture (dans un vrai contexte, cela viendrait de l'API Gmail)
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

    return senders.sort((a, b) => b.emailCount - a.emailCount);
  }, [scanState.results?.emails]);

  const handleTouchStart = (e: React.TouchEvent, senderEmail: string) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    
    setDraggedSender(senderEmail);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentTouch = moveEvent.touches[0];
      const deltaX = currentTouch.clientX - startX;
      const deltaY = currentTouch.clientY - startY;
      
      const card = cardRefs.current.get(senderEmail);
      if (card) {
        card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        // Déterminer la direction du swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setDragDirection(deltaX > 0 ? 'right' : 'left');
        } else {
          setDragDirection(deltaY > 0 ? 'down' : 'up');
        }
      }
    };

    const handleTouchEnd = () => {
      const card = cardRefs.current.get(senderEmail);
      if (card) {
        card.style.transform = '';
      }
      
      if (dragDirection) {
        handleSwipeAction(senderEmail, dragDirection);
      }
      
      setDraggedSender(null);
      setDragDirection(null);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleSwipeAction = (senderEmail: string, direction: string) => {
    const sender = senderData.find(s => s.email === senderEmail);
    if (!sender) return;

    switch (direction) {
      case 'left':
        toast({
          title: "Suppression et désabonnement",
          description: `${sender.sender} - Emails supprimés et désabonnement effectué`,
        });
        break;
      case 'right':
        // Ne rien faire
        break;
      case 'up':
        toast({
          title: "Suppression sans désabonnement",
          description: `${sender.sender} - Emails supprimés uniquement`,
        });
        break;
      case 'down':
        // Ne rien faire
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent, senderEmail: string) => {
    const startX = e.clientX;
    const startY = e.clientY;
    
    setDraggedSender(senderEmail);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const card = cardRefs.current.get(senderEmail);
      if (card) {
        card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setDragDirection(deltaX > 0 ? 'right' : 'left');
        } else {
          setDragDirection(deltaY > 0 ? 'down' : 'up');
        }
      }
    };

    const handleMouseUp = () => {
      const card = cardRefs.current.get(senderEmail);
      if (card) {
        card.style.transform = '';
      }
      
      if (dragDirection) {
        handleSwipeAction(senderEmail, dragDirection);
      }
      
      setDraggedSender(null);
      setDragDirection(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!scanState.results) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Analyse des expéditeurs</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Glissez les cartes pour effectuer des actions sur les emails
        </p>
        <div className="flex justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            <span>Supprimer + désabonner</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowRight className="h-3 w-3" />
            <span>Ignorer</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowUp className="h-3 w-3" />
            <span>Supprimer uniquement</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDown className="h-3 w-3" />
            <span>Ignorer</span>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {senderData.map((sender) => (
          <Card
            key={sender.email}
            ref={(el) => {
              if (el) {
                cardRefs.current.set(sender.email, el);
              }
            }}
            className={`cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
              draggedSender === sender.email ? 'shadow-lg scale-105' : ''
            }`}
            onMouseDown={(e) => handleMouseDown(e, sender.email)}
            onTouchStart={(e) => handleTouchStart(e, sender.email)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg truncate" title={sender.sender}>
                    {sender.sender}
                  </h4>
                  <p className="text-sm text-muted-foreground truncate" title={sender.email}>
                    {sender.email}
                  </p>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Taux d'ouverture</p>
                    <p className="text-lg font-bold text-blue-600">
                      {sender.openRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Emails reçus</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatNumber(sender.emailCount)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {senderData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Aucun expéditeur trouvé</p>
        </div>
      )}
    </div>
  );
};

export default SenderAnalysisView;
