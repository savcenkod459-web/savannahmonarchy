import { useState, useEffect } from 'react';
import { useMediaOptimization } from './useMediaOptimization';
import { useIsMobile } from './use-mobile';

interface UseOptimizedImageProps {
  src: string;
  lowQualitySrc?: string;
}

export const useOptimizedImage = ({ src, lowQualitySrc }: UseOptimizedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const { imageQuality } = useMediaOptimization();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!src) return;
    
    // Convert to WebP if browser supports it
    const convertToWebP = (url: string) => {
      // Check if it's already a WebP or if it's an external URL
      if (url.endsWith('.webp') || url.startsWith('http')) {
        return url;
      }
      
      // For local images, suggest WebP alternative
      const webpUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      
      // Check if WebP is supported
      const canvas = document.createElement('canvas');
      const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      
      return supportsWebP ? webpUrl : url;
    };
    
    const optimizedSrc = convertToWebP(src);
    setCurrentSrc(optimizedSrc);
    setIsLoading(false);
  }, [src]);

  const generateSrcSet = () => {
    if (!src) return undefined;
    
    // Generate srcSet for responsive images
    const base = src.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const ext = src.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.webp';
    
    return `${base}${ext} 1x, ${base}@2x${ext} 2x`;
  };
  
  const generateSizes = () => {
    // Optimize sizes based on device
    return isMobile ? '100vw' : '(max-width: 768px) 100vw, 50vw';
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