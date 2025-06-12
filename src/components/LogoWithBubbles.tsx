
const LogoWithBubbles = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src="/lovable-uploads/aec75153-e8dd-4904-b1f7-38a352b8d1d7.png" 
        alt="EcoInBox Logo" 
        className="h-32 w-32 object-contain"
      />
    </div>
  );
};

export default LogoWithBubbles;
