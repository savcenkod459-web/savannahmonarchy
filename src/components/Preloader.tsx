import { useEffect, useState } from "react";
import { Crown } from "lucide-react";

const Preloader = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-1000"
      style={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? 'auto' : 'none' }}>
      <div className="relative">
        {/* Animated circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-4 border-primary/20 rounded-full animate-ping" />
          <div className="absolute w-24 h-24 border-4 border-primary/40 rounded-full animate-pulse" />
        </div>
        
        {/* Crown logo */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <Crown className="w-16 h-16 text-primary animate-gold-pulse drop-shadow-[0_0_30px_rgba(217,179,112,0.8)]" />
            <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse" />
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="font-display font-black text-3xl text-luxury-gradient luxury-text-shadow animate-shimmer">
              SavannahDynasty
            </h1>
            <div className="flex gap-2 justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
