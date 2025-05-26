
const LogoWithBubbles = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img 
        src="/lovable-uploads/f90ea943-59ee-429f-b6ff-abbb2c91fad7.png" 
        alt="EcoInBox Logo" 
        className="h-8 w-8 object-contain"
      />
    </div>
  );
};

export default LogoWithBubbles;
