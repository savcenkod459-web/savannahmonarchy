import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Play, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SocialMediaCTA = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const smoothScrollTo = (targetY: number, duration: number = 1200) => {
    const startY = window.scrollY;
    const difference = targetY - startY;
    const startTime = performance.now();

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeInOutCubic(progress);
      
      window.scrollTo(0, startY + difference * easeProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  const handleClick = () => {
    navigate('/contact');
    setTimeout(() => {
      const element = document.getElementById('follow-us');
      if (element) {
        const targetPosition = element.getBoundingClientRect().top + window.scrollY - 160;
        smoothScrollTo(targetPosition, 1000);
      }
    }, 200);
  };

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          {/* Floating icons */}
          <div className="flex justify-center gap-4 mb-4">
            <div className="p-3 glass-card rounded-full animate-float">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div className="p-3 glass-card rounded-full animate-float" style={{ animationDelay: '0.5s' }}>
              <Play className="w-5 h-5 text-primary" />
            </div>
            <div className="p-3 glass-card rounded-full animate-float" style={{ animationDelay: '1s' }}>
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            {t('socialCTA.title')}
          </h3>
          
          {/* Subtitle */}
          <p className="text-lg text-muted-foreground">
            {t('socialCTA.subtitle')}
          </p>

          {/* Button */}
          <Button 
            size="lg"
            onClick={handleClick}
            className="mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-8 py-6 text-lg rounded-full shadow-glow hover:shadow-glow-lg transition-all duration-300 hover:scale-105"
          >
            <Play className="w-5 h-5 mr-2" />
            {t('socialCTA.button')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaCTA;
