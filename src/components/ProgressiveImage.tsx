import { memo } from "react";
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
  const { currentSrc, isLoading, imageQuality, isMobile, generateSrcSet } = useOptimizedImage({ 
    src, 
    lowQualitySrc: lowQualitySrc || src 
  });

  return (
    <img
      src={currentSrc}
      srcSet={generateSrcSet()}
      sizes={isMobile ? "(max-width: 768px) 100vw, 768px" : "100vw"}
      alt={alt}
      className={`${className} ${isLoading && lowQualitySrc ? 'blur-sm scale-105' : 'blur-0 scale-100'} transition-all duration-500`}
      onClick={onClick}
      loading="lazy"
      decoding="async"
      fetchPriority={imageQuality === 'high' ? 'high' : 'low'}
    />
  );
};

export const ProgressiveImage = memo(ProgressiveImageComponent);
