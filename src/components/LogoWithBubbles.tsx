
const LogoWithBubbles = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src="/lovable-uploads/7a0e0363-28ec-445e-b85b-ba6b9b6a4315.png" 
        alt="EcoInBox Logo" 
        className="h-12 w-12 object-contain"
      />
    </div>
  );
};

export default LogoWithBubbles;
