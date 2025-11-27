import * as React from 'react';
import { useIsMobile } from './use-mobile';

interface MediaOptimization {
  videoPreload: 'none' | 'metadata' | 'auto';
  imageQuality: 'low' | 'medium' | 'high';
  shouldLazyLoad: boolean;
  maxVideoResolution: string;
  enableAdaptiveBitrate: boolean;
}

export const useMediaOptimization = (): MediaOptimization => {
  const isMobile = useIsMobile();
  const [optimization, setOptimization] = React.useState<MediaOptimization>({
    videoPreload: 'metadata',
    imageQuality: 'high',
    shouldLazyLoad: true,
    maxVideoResolution: '1080p',
    enableAdaptiveBitrate: true,
  });

  React.useEffect(() => {
    const detectOptimalSettings = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const effectiveType = connection?.effectiveType || '4g';
      const saveData = connection?.saveData || false;
      
      const deviceMemory = (navigator as any).deviceMemory || 4;
      const hardwareConcurrency = navigator.hardwareConcurrency || 4;

      let videoPreload: 'none' | 'metadata' | 'auto' = 'metadata';
      let imageQuality: 'low' | 'medium' | 'high' = 'high';
      let maxVideoResolution = '1080p';

      if (saveData) {
        videoPreload = 'none';
        imageQuality = 'low';
        maxVideoResolution = '480p';
      }
      else if (effectiveType === '2g' || effectiveType === 'slow-2g') {
        videoPreload = 'none';
        imageQuality = 'low';
        maxVideoResolution = '360p';
      }
      else if (effectiveType === '3g') {
        videoPreload = 'none';
        imageQuality = 'medium';
        maxVideoResolution = '480p';
      }
      else if (isMobile) {
        videoPreload = 'metadata';
        imageQuality = 'high';
        maxVideoResolution = '720p';
      }
      else if (deviceMemory <= 2 || hardwareConcurrency <= 2) {
        videoPreload = 'metadata';
        imageQuality = 'medium';
        maxVideoResolution = '720p';
      }
      else {
        videoPreload = 'auto';
        imageQuality = 'high';
        maxVideoResolution = '1080p';
      }

      setOptimization({
        videoPreload,
        imageQuality,
        shouldLazyLoad: true,
        maxVideoResolution,
        enableAdaptiveBitrate: isMobile || effectiveType !== '4g',
      });
    };

    detectOptimalSettings();

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (connection) {
      connection.addEventListener('change', detectOptimalSettings);
      return () => connection.removeEventListener('change', detectOptimalSettings);
    }
  }, [isMobile]);

  return optimization;
};