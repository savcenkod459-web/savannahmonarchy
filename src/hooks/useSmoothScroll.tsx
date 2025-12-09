import { useEffect } from 'react';

export const useSmoothScroll = () => {
  useEffect(() => {
    // Enable native smooth scrolling via CSS
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);
};
