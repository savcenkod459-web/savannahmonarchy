import { useState, useEffect } from 'react';
import { useImageCache } from './useImageCache';
import { useMediaOptimization } from './useMediaOptimization';
import { useIsMobile } from './use-mobile';

interface UseOptimizedImageProps {
  src: string;
  lowQualitySrc?: string;
}

export const useOptimizedImage = ({ src, lowQualitySrc }: UseOptimizedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getFromCache, saveToCache } = useImageCache();
  const { imageQuality } = useMediaOptimization();
  const isMobile = useIsMobile();

  useEffect(() => {
    let isMounted = true;
    let img: HTMLImageElement | null = null;
    
    const loadImage = async () => {
      if (!src) return;
      
      setIsLoading(true);
      setError(false);

      // Check cache first
      const cachedImage = getFromCache(src);
      if (cachedImage && isMounted) {
        setCurrentSrc(cachedImage);
        setIsLoading(false);
        return;
      }

      img = new Image();
      
      // Try WebP first for better compression
      const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      const tryLoad = (source: string) => {
        return new Promise<string>((resolve, reject) => {
          if (!img) return reject();
          img.src = source;
          img.onload = () => resolve(source);
          img.onerror = () => reject();
        });
      };

      try {
        // Try WebP first
        const loadedSrc = await tryLoad(webpSrc).catch(() => tryLoad(src));
        
        if (isMounted) {
          setCurrentSrc(loadedSrc);
          setIsLoading(false);
          saveToCache(src, loadedSrc);
        }
      } catch {
        if (isMounted) {
          setError(true);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      if (img) {
        img.onload = null;
        img.onerror = null;
      }
    };
  }, [src, getFromCache, saveToCache]);

  const generateSrcSet = () => {
    if (!isMobile || !currentSrc) return undefined;
    
    const baseUrl = currentSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const extension = currentSrc.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
    
    return `${baseUrl}-small${extension} 480w, ${baseUrl}-medium${extension} 768w, ${currentSrc} 1200w`;
  };

  return {
    currentSrc,
    isLoading,
    error,
    imageQuality,
    isMobile,
    generateSrcSet,
  };
};