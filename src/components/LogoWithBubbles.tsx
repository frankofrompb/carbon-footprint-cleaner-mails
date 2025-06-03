
const LogoWithBubbles = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src="/lovable-uploads/6b9aeb93-7434-42c2-a47a-ac1184e0200a.png" 
        alt="EcoInBox Logo" 
        className="h-8 w-8 object-contain"
      />
    </div>
  );
};

export default LogoWithBubbles;
