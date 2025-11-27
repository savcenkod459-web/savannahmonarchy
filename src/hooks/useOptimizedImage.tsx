import { useState, useEffect } from 'react';
import { useMediaOptimization } from './useMediaOptimization';
import { useIsMobile } from './use-mobile';

interface UseOptimizedImageProps {
  src: string;
  lowQualitySrc?: string;
}

export const useOptimizedImage = ({ src, lowQualitySrc }: UseOptimizedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { imageQuality } = useMediaOptimization();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!src) return;
    
    const img = new Image();
    img.decoding = 'async';
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };
    
    // Start loading high quality image
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const generateSrcSet = () => {
    if (!src) return undefined;
    // Generate responsive srcset for different screen sizes
    return `${src} 1x, ${src} 2x`;
  };
  
  const generateSizes = () => {
    if (isMobile) return '(max-width: 768px) 100vw, 50vw';
    return '(max-width: 1200px) 50vw, 33vw';
  };

  return {
    currentSrc,
    isLoading,
    error,
    imageQuality,
    isMobile,
    generateSrcSet,
    generateSizes,
  };
};