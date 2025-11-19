import { useState, useEffect, memo } from "react";

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
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Create a new image to preload the high-quality version
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={`${className} ${isLoading && lowQualitySrc ? 'blur-sm scale-105' : 'blur-0 scale-100'} transition-all duration-500`}
      onClick={onClick}
      loading="lazy"
      decoding="async"
    />
  );
};

export const ProgressiveImage = memo(ProgressiveImageComponent);
