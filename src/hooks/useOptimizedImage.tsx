import * as React from 'react';
import { useMediaOptimization } from './useMediaOptimization';
import { useIsMobile } from './use-mobile';

interface UseOptimizedImageProps {
  src: string;
  lowQualitySrc?: string;
}

export const useOptimizedImage = ({ src, lowQualitySrc }: UseOptimizedImageProps) => {
  const [currentSrc, setCurrentSrc] = React.useState(lowQualitySrc || src);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const { imageQuality } = useMediaOptimization();
  const isMobile = useIsMobile();

  React.useEffect(() => {
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
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  const generateSrcSet = () => {
    if (!src) return undefined;
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