import * as React from "react";

const PageLoadWave = () => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <div 
        className="absolute inset-x-0 h-[200vh] -top-[100vh] animate-wave-down"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(217, 179, 112, 0.3) 30%, rgba(217, 179, 112, 0.6) 50%, rgba(217, 179, 112, 0.3) 70%, transparent 100%)',
          boxShadow: '0 0 100px 50px rgba(217, 179, 112, 0.4)',
        }}
      />
      
      <div 
        className="absolute inset-x-0 h-[150vh] -top-[75vh] animate-wave-down-delayed"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(255, 215, 0, 0.2) 40%, rgba(255, 215, 0, 0.4) 50%, rgba(255, 215, 0, 0.2) 60%, transparent 100%)',
          animationDelay: '0.3s',
        }}
      />
      
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary animate-sparkle-fall"
          style={{
            left: `${10 + i * 12}%`,
            top: '-20px',
            animationDelay: `${i * 0.15}s`,
            boxShadow: '0 0 20px 5px rgba(217, 179, 112, 0.8)',
          }}
        />
      ))}
    </div>
  );
};

export default PageLoadWave;