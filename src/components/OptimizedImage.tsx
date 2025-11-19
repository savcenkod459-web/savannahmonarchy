import { useState, useEffect, memo } from "react";
import { useIndexedDBCache } from "@/hooks/useIndexedDBCache";
import { useMobileOptimization } from "@/hooks/useMobileOptimization";
import { useIsMobile } from "@/hooks/use-mobile";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  lowQualitySrc?: string;
}

const OptimizedImageComponent = ({ 
  src, 
  alt, 
  className = "", 
  onClick,
  lowQualitySrc 
}: OptimizedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getFromCache, saveToCache } = useIndexedDBCache({ maxEntries: 30 });
  const { imageQuality, shouldLazyLoadImages } = useMobileOptimization();
  const isMobile = useIsMobile();

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      setIsLoading(true);
      setError(false);

      // Проверяем кэш
      const cachedImage = await getFromCache(src);
      if (cachedImage && isMounted) {
        setCurrentSrc(cachedImage);
        setIsLoading(false);
        return;
      }

      // Для мобильных устройств с низким качеством загружаем напрямую
      if (isMobile && imageQuality === 'low') {
        const img = new Image();
        img.onload = () => {
          if (isMounted) {
            setCurrentSrc(src);
            setIsLoading(false);
          }
        };
        img.onerror = () => {
          if (isMounted) {
            setError(true);
            setIsLoading(false);
          }
        };
        img.src = src;
        return;
      }

      // Создаем WebP версию URL если возможно
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
      // Пробуем загрузить WebP
      const webpImg = new Image();
      webpImg.src = webpSrc;
      
      webpImg.onload = () => {
        if (isMounted) {
          setCurrentSrc(webpSrc);
          setIsLoading(false);
          // Сохраняем в кэш
          fetch(webpSrc)
            .then(res => res.blob())
            .then(blob => {
              const reader = new FileReader();
              reader.onloadend = () => {
                saveToCache(src, reader.result as string);
              };
              reader.readAsDataURL(blob);
            })
            .catch(console.error);
        }
      };
      
      webpImg.onerror = () => {
        // Если WebP не загрузился, пробуем оригинальный формат
        const originalImg = new Image();
        originalImg.src = src;
        
        originalImg.onload = () => {
          if (isMounted) {
            setCurrentSrc(src);
            setIsLoading(false);
            // Сохраняем в кэш
            fetch(src)
              .then(res => res.blob())
              .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  saveToCache(src, reader.result as string);
                };
                reader.readAsDataURL(blob);
              })
              .catch(console.error);
          }
        };
        
        originalImg.onerror = () => {
          if (isMounted) {
            setError(true);
            setIsLoading(false);
          }
        };
      };
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src, getFromCache, saveToCache, isMobile, imageQuality]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <span className="text-muted-foreground text-sm">Failed to load image</span>
      </div>
    );
  }

  // Генерируем srcset для адаптивных изображений
  const generateSrcSet = () => {
    if (!isMobile) return undefined;
    
    // Создаем версии для разных разрешений
    const baseUrl = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const extension = src.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
    
    return `${baseUrl}-small${extension} 480w, ${baseUrl}-medium${extension} 768w, ${src} 1200w`;
  };

  return (
    <img
      src={currentSrc}
      srcSet={generateSrcSet()}
      sizes={isMobile ? "(max-width: 768px) 100vw, 768px" : "100vw"}
      alt={alt}
      className={`${className} ${isLoading && lowQualitySrc ? 'blur-sm scale-105' : 'blur-0 scale-100'} transition-all duration-500`}
      onClick={onClick}
      loading={shouldLazyLoadImages ? "lazy" : "eager"}
      decoding="async"
      fetchPriority={imageQuality === 'high' ? 'high' : 'low'}
    />
  );
};

export const OptimizedImage = memo(OptimizedImageComponent);
