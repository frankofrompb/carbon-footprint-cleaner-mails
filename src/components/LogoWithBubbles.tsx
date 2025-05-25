
import { Mail } from "lucide-react";

const LogoWithBubbles = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      {/* Enveloppe principale */}
      <div className="relative z-10">
        <Mail className="h-8 w-8 text-[#38c39d]" />
      </div>
      
      {/* Bulles de savon animées */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Bulle 1 */}
        <div className="absolute -top-2 -right-1 w-3 h-3 bg-gradient-to-br from-blue-200 to-transparent rounded-full opacity-60 animate-bounce" 
             style={{ animationDelay: '0s', animationDuration: '2s' }} />
        
        {/* Bulle 2 */}
        <div className="absolute -top-3 left-1 w-2 h-2 bg-gradient-to-br from-cyan-200 to-transparent rounded-full opacity-70 animate-bounce" 
             style={{ animationDelay: '0.5s', animationDuration: '2.5s' }} />
        
        {/* Bulle 3 */}
        <div className="absolute -top-4 right-2 w-1.5 h-1.5 bg-gradient-to-br from-blue-100 to-transparent rounded-full opacity-50 animate-bounce" 
             style={{ animationDelay: '1s', animationDuration: '3s' }} />
        
        {/* Bulle 4 */}
        <div className="absolute -top-5 left-3 w-2.5 h-2.5 bg-gradient-to-br from-teal-200 to-transparent rounded-full opacity-40 animate-bounce" 
             style={{ animationDelay: '1.5s', animationDuration: '2.2s' }} />
        
        {/* Bulle 5 */}
        <div className="absolute -top-1 -left-2 w-1 h-1 bg-gradient-to-br from-cyan-300 to-transparent rounded-full opacity-60 animate-bounce" 
             style={{ animationDelay: '0.8s', animationDuration: '2.8s' }} />
      </div>
    </div>
  );
};

export default LogoWithBubbles;
