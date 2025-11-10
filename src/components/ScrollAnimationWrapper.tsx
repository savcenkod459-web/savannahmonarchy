import { ReactNode } from 'react';
import { useScrollAnimation, useParallax } from '@/hooks/useScrollAnimation';

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'none';
  parallax?: boolean;
  parallaxSpeed?: number;
  className?: string;
  delay?: number;
}

const ScrollAnimationWrapper = ({ 
  children, 
  animation = 'fade', 
  parallax = false,
  parallaxSpeed = 0.5,
  className = '',
  delay = 0
}: ScrollAnimationWrapperProps) => {
  const { elementRef: scrollRef, isVisible } = useScrollAnimation({ 
    threshold: 0.1, 
    triggerOnce: true 
  });
  
  const { elementRef: parallaxRef, offsetY } = useParallax(parallaxSpeed);

  const getAnimationClass = () => {
    if (!isVisible || animation === 'none') return 'opacity-0';
    
    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-[slide-up_0.8s_ease-out_forwards]';
      case 'slide-left':
        return 'animate-[slide-left_0.8s_ease-out_forwards]';
      case 'slide-right':
        return 'animate-[slide-right_0.8s_ease-out_forwards]';
      case 'scale':
        return 'animate-scale-in';
      default:
        return '';
    }
  };

  const combinedRef = (node: HTMLDivElement) => {
    scrollRef.current = node;
    if (parallax) {
      parallaxRef.current = node;
    }
  };

  return (
    <div 
      ref={combinedRef}
      className={`transition-all duration-1000 ${getAnimationClass()} ${className}`}
      style={{
        transform: parallax ? `translateY(${offsetY}px)` : undefined,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

export default ScrollAnimationWrapper;
