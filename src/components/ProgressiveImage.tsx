import * as React from "react";
import { useOptimizedImage } from "@/hooks/useOptimizedImage";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  lowQualitySrc?: string;
  onClick?: () => void;
}

const ProgressiveImageComponent = ({ 
  src, 
  alt, 
  className = "", 
  lowQualitySrc,
  onClick 
}: ProgressiveImageProps) => {
  const { currentSrc, isLoading, imageQuality, generateSrcSet, generateSizes } = useOptimizedImage({ 
    src, 
    lowQualitySrc: lowQualitySrc || src 
  });

  return (
    <img
      src={currentSrc}
      srcSet={generateSrcSet()}
      sizes={generateSizes()}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      onClick={onClick}
      loading="lazy"
      decoding="async"
      fetchPriority={imageQuality === 'high' ? 'high' : 'low'}
      style={{
        transform: 'translateZ(0)',
        willChange: 'opacity'
      }}
    />
  );
};

export const ProgressiveImage = React.memo(ProgressiveImageComponent);