
import { Leaf } from "lucide-react";

const LogoWithBubbles = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Leaf 
        className="h-8 w-8 text-[#38c39d]" 
        fill="currentColor"
      />
    </div>
  );
};

export default LogoWithBubbles;
