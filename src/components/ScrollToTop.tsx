import { useState, useEffect, useCallback, memo } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTop = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    let timeoutId: number;
    
    const toggleVisibility = () => {
      const shouldShow = window.scrollY > 300;
      
      if (shouldShow) {
        setIsVisible(true);
        setShouldRender(true);
        setIsLeaving(false);
      } else if (isVisible) {
        setIsLeaving(true);
        timeoutId = window.setTimeout(() => {
          setIsVisible(false);
          setShouldRender(false);
          setIsLeaving(false);
        }, 500);
      }
    };
    
    // Use passive listener for better scroll performance
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", toggleVisibility);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible]);
  
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }, []);
  
  if (!shouldRender) return null;
  
  return (
    <button
      onClick={scrollToTop}
      className="group fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground cursor-pointer border border-primary/30 transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 active:translate-y-0"
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        zIndex: 9999,
        boxShadow: '0 0 30px hsl(43 96% 56% / 0.4), 0 0 60px hsl(43 96% 56% / 0.2)',
        animation: isLeaving ? 'fadeOutSlide 0.5s ease-out forwards' : 'fadeInSlide 0.5s ease-out forwards',
        willChange: 'transform, opacity',
        contain: 'layout style paint'
      }}
    >
      <ArrowUp className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 group-active:scale-90" />
    </button>
  );
});

ScrollToTop.displayName = 'ScrollToTop';

export default ScrollToTop;