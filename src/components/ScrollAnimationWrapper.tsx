import { ReactNode, memo } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface ScrollAnimationWrapperProps {
  children: ReactNode;
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'none';
  className?: string;
  delay?: number;
}

const ScrollAnimationWrapperComponent = ({ 
  children, 
  animation = 'fade', 
  className = '',
  delay = 0
}: ScrollAnimationWrapperProps) => {
  const { elementRef, isVisible } = useScrollAnimation({ 
    threshold: 0.05, // Более низкий порог для раннего запуска
    triggerOnce: true,
    rootMargin: '50px' // Предзагрузка анимаций
  });

  const getAnimationClass = () => {
    if (!isVisible || animation === 'none') return 'opacity-0';
    
    switch (animation) {
      case 'fade':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-[slide-up_0.6s_ease-out_forwards]';
      case 'slide-left':
        return 'animate-[slide-left_0.6s_ease-out_forwards]';
      case 'slide-right':
        return 'animate-[slide-right_0.6s_ease-out_forwards]';
      case 'scale':
        return 'animate-scale-in';
      default:
        return '';
    }
  };

  return (
    <div 
      ref={elementRef}
      className={`transition-opacity duration-700 ${getAnimationClass()} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
        contain: 'layout style paint'
      }}
    >
      {children}
    </div>
  );
};

export default memo(ScrollAnimationWrapperComponent);
