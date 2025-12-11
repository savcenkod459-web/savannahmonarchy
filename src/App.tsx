import { useState, useEffect, lazy, Suspense, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { useSmoothScroll } from "./hooks/useSmoothScroll";
import { useTranslations } from "./hooks/useTranslations";
import { useAutoTranslation } from "./hooks/useAutoTranslation";
import { AdminTranslationWrapper } from "./components/AdminTranslationWrapper";
import Preloader from "./components/Preloader";
import { GalleryProvider } from "./contexts/GalleryContext";

// Lazy load для улучшения производительности
const MobileFloatingButtons = lazy(() => import("./components/MobileFloatingButtons"));
const ScrollToTopOnRouteChange = lazy(() => import("./components/ScrollToTopOnRouteChange"));

// Главная страница загружается сразу для быстрого LCP
import Index from "./pages/Index";

// Остальные страницы lazy load для уменьшения начального bundle
const About = lazy(() => import("./pages/About"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Breeders = lazy(() => import("./pages/Breeders"));
const Guide = lazy(() => import("./pages/Guide"));
const Payment = lazy(() => import("./pages/Payment"));
const Warranty = lazy(() => import("./pages/Warranty"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const Profile = lazy(() => import("./pages/Profile"));
const Pedigree = lazy(() => import("./pages/Pedigree"));
const AdminCats = lazy(() => import("./pages/AdminCats"));
const AdminPedigree = lazy(() => import("./pages/AdminPedigree"));
const AdminImages = lazy(() => import("./pages/AdminImages"));
const AdminMessages = lazy(() => import("./pages/AdminMessages"));
const AdminTranslations = lazy(() => import("./pages/AdminTranslations"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Компонент для отображения загрузки страниц
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Оптимизированная конфигурация QueryClient для максимального кэширования
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 минут - данные остаются свежими
      gcTime: 30 * 60 * 1000, // 30 минут - время хранения в кэше
      retry: 2,
      refetchOnWindowFocus: false, // Уменьшаем ненужные перезагрузки
      refetchOnMount: false, // Используем кэшированные данные когда возможно
      refetchOnReconnect: true, // Перезагрузка при восстановлении соединения
    },
  },
});

const AppContent = () => {
  const [isContentVisible, setIsContentVisible] = useState(false);
  
  // Загружаем переводы из БД
  const { isLoaded: translationsLoaded } = useTranslations();
  useAutoTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsContentVisible(true);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      <Preloader />
      <Toaster />
      <Sonner />
      <Suspense fallback={null}>
        <MobileFloatingButtons />
      </Suspense>
      <BrowserRouter>
        <GalleryProvider>
        <Suspense fallback={null}>
          <ScrollToTopOnRouteChange />
        </Suspense>
        <AdminTranslationWrapper>
          <div 
            className={`transition-opacity duration-1000 ${
              isContentVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/breeders" element={<Breeders />} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/warranty" element={<Warranty />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/pedigree/:catId" element={<Pedigree />} />
                <Route path="/admin/cats" element={<AdminCats />} />
                <Route path="/admin/pedigree" element={<AdminPedigree />} />
                <Route path="/admin/images" element={<AdminImages />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/translations" element={<AdminTranslations />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </AdminTranslationWrapper>
        </GalleryProvider>
      </BrowserRouter>
    </>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
