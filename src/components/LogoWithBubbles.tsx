
const LogoWithBubbles = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      <img 
        src="/lovable-uploads/1ba4525c-c51d-4215-8393-0e0fb2741ed8.png" 
        alt="EcoInBox Logo" 
        className="h-8 w-8 object-contain"
      />
    </div>
  );
};

export default LogoWithBubbles;
