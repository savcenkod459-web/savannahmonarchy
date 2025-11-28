import { useEffect, useState } from "react";
import smLogoOriginal from "@/assets/sm-logo-original.png";

const SMLogoSVG = ({ className = "w-12 h-12" }: { className?: string }) => {
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        // Use original dimensions for best quality
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Enable high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Make white/near-white pixels transparent with smooth edges
        const threshold = 230;
        const softEdge = 20; // For smoother transitions
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate brightness
          const brightness = (r + g + b) / 3;
          
          if (brightness > threshold) {
            // Fully transparent for very white pixels
            data[i + 3] = 0;
          } else if (brightness > threshold - softEdge) {
            // Gradual transparency for edge pixels (anti-aliasing)
            const alpha = Math.round(255 * (1 - (brightness - (threshold - softEdge)) / softEdge));
            data[i + 3] = Math.min(data[i + 3], alpha);
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        setProcessedSrc(canvas.toDataURL('image/png', 1.0));
      };
      img.src = smLogoOriginal;
    };
    
    processImage();
  }, []);

  if (!processedSrc) {
    return <div className={className} />;
  }

  return (
    <img 
      src={processedSrc} 
      alt="SM Logo" 
      className={`${className} object-contain`}
      style={{ 
        imageRendering: 'crisp-edges',
      }}
    />
  );
};

export default SMLogoSVG;
