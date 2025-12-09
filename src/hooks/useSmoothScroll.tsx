import { useEffect, useRef } from 'react';
import { useIsMobile } from './use-mobile';

export const useSmoothScroll = () => {
  const isMobile = useIsMobile();
  const rafId = useRef<number | null>(null);
  
  useEffect(() => {
    // Полностью отключаем на мобильных для максимальной производительности
    if (isMobile) return;
    
    // Отключаем на устройствах с слабым процессором
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return;

    let scrollTarget = window.scrollY;
    let currentScroll = window.scrollY;
    let velocity = 0;

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor;
    };

    const smoothScroll = () => {
      const difference = scrollTarget - currentScroll;
      
      // Ультра-плавное замедление с сильной инерцией
      velocity = lerp(velocity, difference, 0.008);
      currentScroll += velocity;
      
      // Продолжаем анимацию пока есть минимальное движение
      if (Math.abs(velocity) > 0.01 || Math.abs(difference) > 0.1) {
        window.scrollTo(0, currentScroll);
        rafId.current = requestAnimationFrame(smoothScroll);
      } else {
        currentScroll = scrollTarget;
        window.scrollTo(0, currentScroll);
        velocity = 0;
        rafId.current = null;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      // Синхронизация с реальной позицией скролла
      const actualScroll = window.scrollY;
      if (Math.abs(actualScroll - currentScroll) > 150) {
        scrollTarget = actualScroll;
        currentScroll = actualScroll;
        velocity = 0;
      }
      
      // Ультра-медленная скорость для престижного ощущения
      const scrollAmount = e.deltaY * 0.08;
      scrollTarget += scrollAmount;
      
      // Ограничение границ
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = Math.max(0, Math.min(scrollTarget, maxScroll));
      
      // Запуск анимации если не запущена
      if (!rafId.current) {
        rafId.current = requestAnimationFrame(smoothScroll);
      }
    };

    const handleScrollEnd = () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      handleScrollEnd();
    };
  }, [isMobile]);
};
