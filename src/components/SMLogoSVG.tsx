import { useEffect, useRef, useState } from "react";
import smLogoOriginal from "@/assets/sm-logo-original.png";

const SMLogoSVG = ({ className = "w-12 h-12" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    const processImage = async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) return;
        
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Make white/near-white pixels transparent
        const threshold = 235;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Check if pixel is white or near-white (with some tolerance for anti-aliasing)
          if (r > threshold && g > threshold && b > threshold) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        setProcessedSrc(canvas.toDataURL('image/png'));
      };
      img.src = smLogoOriginal;
    };
    
    processImage();
  }, []);

  if (!processedSrc) {
    // Show placeholder while processing
    return <div className={className} />;
  }

  return (
    <img 
      src={processedSrc} 
      alt="SM Logo" 
      className={`${className} object-contain`}
      style={{ aspectRatio: '1/1' }}
    />
  );
};

export default SMLogoSVG;
