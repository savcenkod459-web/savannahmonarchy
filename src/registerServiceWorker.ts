import { Workbox } from 'workbox-window';

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');

    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        console.log('New content is available; please refresh.');
        // Можно показать toast с предложением обновить страницу
        if (confirm('Доступна новая версия сайта. Обновить сейчас?')) {
          window.location.reload();
        }
      } else {
        console.log('Content is cached for offline use.');
      }
    });

    wb.addEventListener('waiting', () => {
      console.log('A new service worker has installed, but it is waiting to activate.');
    });

    wb.addEventListener('controlling', () => {
      console.log('Service worker is now controlling the page.');
      window.location.reload();
    });

    wb.addEventListener('activated', (event) => {
      if (!event.isUpdate) {
        console.log('Service worker activated for the first time!');
      }
    });

    wb.register().catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  }
}
