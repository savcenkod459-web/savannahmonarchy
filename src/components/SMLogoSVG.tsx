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
        const softEdge = 20;
        
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const brightness = (r + g + b) / 3;
          
          if (brightness > threshold) {
            data[i + 3] = 0;
          } else if (brightness > threshold - softEdge) {
            const alpha = Math.round(255 * (1 - (brightness - (threshold - softEdge)) / softEdge));
            data[i + 3] = Math.min(data[i + 3], alpha);
          }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Find bounding box of non-transparent pixels (crop the hitbox)
        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        const croppedData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            if (croppedData[idx + 3] > 10) { // If pixel is not fully transparent
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }
        
        // Add small padding
        const padding = 2;
        minX = Math.max(0, minX - padding);
        minY = Math.max(0, minY - padding);
        maxX = Math.min(canvas.width - 1, maxX + padding);
        maxY = Math.min(canvas.height - 1, maxY + padding);
        
        const croppedWidth = maxX - minX + 1;
        const croppedHeight = maxY - minY + 1;
        
        // Create cropped canvas
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = croppedWidth;
        croppedCanvas.height = croppedHeight;
        const croppedCtx = croppedCanvas.getContext('2d');
        
        if (croppedCtx) {
          croppedCtx.drawImage(canvas, minX, minY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
          setProcessedSrc(croppedCanvas.toDataURL('image/png', 1.0));
        }
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
