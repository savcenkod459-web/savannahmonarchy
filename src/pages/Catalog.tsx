import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import SEOHead from "@/components/SEOHead";
import SocialMediaCTA from "@/components/SocialMediaCTA";
import { useState, useEffect, memo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Crown, Sparkles, Diamond, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CatDetailModal } from "@/components/CatDetailModal";
import { CatCard } from "@/components/CatCard";
import { CatCardSkeleton } from "@/components/CatCardSkeleton";
import { useTranslation } from "react-i18next";
import { useDataCache } from "@/hooks/useImageCache";
import { useImagePrefetch } from "@/hooks/usePrefetch";
import savannah1 from "@/assets/savannah-f1-1.jpg";
import savannah2 from "@/assets/savannah-f2-1.jpg";
import kitten from "@/assets/savannah-kitten-1.jpg";

type Cat = {
  id: string;
  name: string;
  breed: string;
  age: string;
  gender: string;
  price: number;
  image: string;
  description: string;
  traits: string[];
  additional_images: string[];
  video?: string;
};

const imageMap: Record<string, string> = {
  '/src/assets/savannah-f1-1.jpg': savannah1,
  '/src/assets/savannah-f2-1.jpg': savannah2,
  '/src/assets/savannah-kitten-1.jpg': kitten
};

// Remove unused preloadImages function - now using usePrefetch hook
const Catalog = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const breedFromUrl = searchParams.get('breed') || 'all';
  const [selectedBreed, setSelectedBreed] = useState<string>(breedFromUrl);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalVideo, setModalVideo] = useState<string | undefined>();
  const { saveToCache } = useDataCache<Cat[]>('catalog_cats', 30 * 60 * 1000);
  const { prefetchImages } = useImagePrefetch();
  
  // Infinite scroll state
  const [page, setPage] = useState(1);
  const [displayedCats, setDisplayedCats] = useState<Cat[]>([]);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    if (breedFromUrl !== 'all') {
      setSelectedBreed(breedFromUrl);
    }
  }, [breedFromUrl]);

  const openCatDetail = (cat: Cat) => {
    const allImages = [cat.image, ...(cat.additional_images || [])];
    setModalImages(allImages);
    setModalVideo(cat.video);
    setModalOpen(true);
  };

  // Fetch cats from Supabase - всегда загружаем свежие данные
  const {
    data: cats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['cats'],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('cats').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      
      const processedData = (data as Cat[]).map(cat => ({
        ...cat,
        image: imageMap[cat.image] || cat.image
      }));
      
      // Сохраняем в кэш для оффлайн-доступа
      saveToCache(processedData);
      
      return processedData;
    },
    staleTime: 0,
    refetchOnMount: 'always'
  });
  const allCats = cats || [];
  const filteredCats = allCats.filter(cat => {
    if (selectedBreed !== "all" && cat.breed !== selectedBreed) return false;
    return true;
  });

  // Update displayed cats when filteredCats changes
  useEffect(() => {
    const itemsToShow = filteredCats.slice(0, page * ITEMS_PER_PAGE);
    setDisplayedCats(itemsToShow);
  }, [filteredCats, page]);

  // Reset page when breed filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedBreed]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Load more when user is 800px from bottom
      if (documentHeight - scrollPosition < 800 && displayedCats.length < filteredCats.length) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayedCats.length, filteredCats.length]);

  // Prefetch adjacent images on card interaction
  const prefetchAdjacentImages = useCallback((index: number) => {
    const imagesToPrefetch: string[] = [];
    
    // Prefetch next and previous cat images
    [-1, 1].forEach(offset => {
      const adjacentIndex = index + offset;
      if (adjacentIndex >= 0 && adjacentIndex < displayedCats.length) {
        const adjacentCat = displayedCats[adjacentIndex];
        imagesToPrefetch.push(adjacentCat.image);
        if (adjacentCat.additional_images) {
          imagesToPrefetch.push(...adjacentCat.additional_images);
        }
      }
    });
    
    if (imagesToPrefetch.length > 0) {
      prefetchImages(imagesToPrefetch);
    }
  }, [displayedCats, prefetchImages]);

  return <div className="min-h-screen">
      <SEOHead
        titleKey="seo.catalog.title"
        descriptionKey="seo.catalog.description"
        keywordsKey="seo.catalog.keywords"
        canonicalUrl="https://savannahmonarchy.com/catalog"
        page="catalog"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Savannah Cats for Sale",
          "description": "Browse our collection of elite F1 and F2 Savannah cats available for purchase",
          "url": "https://savannahmonarchy.com/catalog",
          "numberOfItems": allCats.length,
          "itemListElement": allCats.slice(0, 5).map((cat, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Product",
              "name": cat.name,
              "description": cat.description,
              "offers": {
                "@type": "Offer",
                "price": cat.price,
                "priceCurrency": "USD"
              }
            }
          }))
        }}
      />
      <Navigation />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-secondary/30 relative overflow-hidden">
          <div className="absolute top-20 left-10 opacity-5">
            <Crown className="w-32 h-32 text-primary animate-float" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-5">
            <Diamond className="w-40 h-40 text-accent animate-float" style={{
            animationDelay: '2s'
          }} />
          </div>
          
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-4 micro-interaction">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold tracking-widest uppercase text-primary">{t('catalog.badge')}</span>
              </div>
              <h1 className="font-display font-black text-luxury-gradient luxury-text-shadow py-[10px]">
                {t('catalog.title')}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
                {t('catalog.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Catalog Grid with Infinite Scroll */}
        <ScrollAnimationWrapper animation="fade" delay={100}>
          <section className="py-20">
            <div className="container mx-auto px-6">
              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <CatCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-xl text-red-500">
                    Ошибка загрузки данных. Попробуйте перезагрузить страницу.
                  </p>
                </div>
              ) : filteredCats.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-xl text-muted-foreground">
                    Нет кошек, соответствующих выбранным фильтрам
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 py-6">
                    {displayedCats.map((cat, index) => (
                      <CatCard 
                        key={cat.id}
                        cat={cat} 
                        onCardClick={openCatDetail}
                        animationDelay={index * 100}
                        onHover={() => prefetchAdjacentImages(index)}
                      />
                    ))}
                  </div>
                  
                  {displayedCats.length < filteredCats.length && (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <span className="ml-3 text-muted-foreground">Загрузка...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </ScrollAnimationWrapper>

        {/* Social Media CTA */}
        <ScrollAnimationWrapper animation="fade" delay={100}>
          <SocialMediaCTA />
        </ScrollAnimationWrapper>
      </main>
      
      <Footer />
      <ScrollToTop />
      <CatDetailModal images={modalImages} video={modalVideo} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>;
};
export default memo(Catalog);