
const LogoWithBubbles = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src="/lovable-uploads/2962cc7d-e9ec-4dbf-8773-bd64c9ed5f8e.png" 
        alt="EcoInBox Logo" 
        className="h-8 w-8 object-contain"
      />
    </div>
  );
};

export default LogoWithBubbles;
