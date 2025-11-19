/**
 * Утилита для мониторинга и оптимизации производительности на мобильных устройствах
 */

export const performanceMonitor = {
  // Проверяем поддержку современных API
  supportsWebP: () => {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  },

  // Получаем информацию о производительности устройства
  getDevicePerformance: () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const memory = (navigator as any).deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    
    return {
      isLowEnd: memory <= 2 || cores <= 2,
      isMobile: /Mobile|Android|iPhone/i.test(navigator.userAgent),
      connectionType: connection?.effectiveType || '4g',
      saveData: connection?.saveData || false,
      memory,
      cores
    };
  },

  // Очищаем кеш при нехватке памяти
  setupMemoryPressureHandler: () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(({ usage, quota }) => {
        const percentUsed = ((usage || 0) / (quota || 1)) * 100;
        console.log(`Storage used: ${percentUsed.toFixed(2)}%`);
        
        // Если использовано более 80% хранилища, очищаем кеш
        if (percentUsed > 80) {
          console.warn('Storage quota exceeded 80%, clearing cache...');
          caches.keys().then(keys => {
            keys.forEach(key => {
              if (key.includes('images-cache') || key.includes('videos-cache')) {
                caches.delete(key);
              }
            });
          });
          
          // Очищаем IndexedDB кеш
          const dbRequest = indexedDB.deleteDatabase('ImageCacheDB');
          dbRequest.onsuccess = () => console.log('IndexedDB cache cleared');
        }
      });
    }
  },

  // Оптимизируем производительность скролла
  optimizeScrollPerformance: () => {
    let ticking = false;
    
    const optimizeScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Отключаем тяжелые эффекты во время скролла
          document.body.classList.add('is-scrolling');
          
          setTimeout(() => {
            document.body.classList.remove('is-scrolling');
          }, 150);
          
          ticking = false;
        });
        
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', optimizeScroll, { passive: true });
  },

  // Добавляем глобальные стили для оптимизации
  injectOptimizationStyles: () => {
    const style = document.createElement('style');
    style.textContent = `
      /* Отключаем тяжелые эффекты во время скролла */
      .is-scrolling * {
        pointer-events: none !important;
      }
      
      .is-scrolling .animate-float,
      .is-scrolling .animate-gold-pulse,
      .is-scrolling .animate-pulse {
        animation-play-state: paused !important;
      }
      
      /* Оптимизация для мобильных устройств */
      @media (max-width: 768px) {
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        img, video {
          will-change: auto;
        }
        
        .hover\\:shadow-\\[0_0_60px_rgba\\(217\\,179\\,112\\,0\\.8\\)\\]:hover {
          box-shadow: 0 0 30px rgba(217,179,112,0.4) !important;
        }
      }
      
      /* Для слабых устройств отключаем сложные анимации */
      @media (max-width: 768px) and (prefers-reduced-motion: no-preference) {
        [class*="animate-"] {
          animation-duration: 0.3s !important;
        }
      }
    `;
    document.head.appendChild(style);
  },

  // Инициализация всех оптимизаций
  init: () => {
    performanceMonitor.setupMemoryPressureHandler();
    performanceMonitor.optimizeScrollPerformance();
    performanceMonitor.injectOptimizationStyles();
    
    const deviceInfo = performanceMonitor.getDevicePerformance();
    console.log('Device performance info:', deviceInfo);
    
    // Для слабых устройств уменьшаем частоту обновления анимаций
    if (deviceInfo.isLowEnd || deviceInfo.saveData) {
      document.documentElement.style.setProperty('--animation-duration', '0.3s');
    }
  }
};
