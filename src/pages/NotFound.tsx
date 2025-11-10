import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, Crown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[150px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[200px] animate-pulse" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto animate-fade-in">
        {/* 404 Icon */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
          <div className="relative bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-xl rounded-full p-8 border-2 border-primary/30 shadow-glow animate-scale-in">
            <AlertCircle className="w-24 h-24 text-primary animate-gold-pulse" strokeWidth={1.5} />
          </div>
        </div>

        {/* 404 Text */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="font-display font-black text-8xl md:text-9xl text-luxury-gradient luxury-text-shadow mb-4 animate-shimmer">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
            <Crown className="w-6 h-6 text-primary animate-float" />
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />
          </div>
        </div>

        {/* Description */}
        <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Страница не найдена
          </h2>
          <p className="text-lg text-foreground/60 max-w-md mx-auto leading-relaxed">
            К сожалению, страница которую вы ищете не существует или была перемещена.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Button
            onClick={() => navigate('/')}
            size="lg"
            className="group relative overflow-hidden bg-gradient-to-r from-primary to-accent hover:shadow-glow transition-all duration-500 hover:scale-105 min-w-[200px]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Home className="w-5 h-5 mr-2 relative z-10 group-hover:animate-float" />
            <span className="relative z-10 font-semibold">Главная страница</span>
          </Button>

          <Button
            onClick={() => navigate('/catalog')}
            size="lg"
            variant="outline"
            className="group relative overflow-hidden border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:shadow-gold transition-all duration-500 hover:scale-105 min-w-[200px]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Search className="w-5 h-5 mr-2 relative z-10 group-hover:animate-float" />
            <span className="relative z-10 font-semibold">Каталог котят</span>
          </Button>
        </div>

        {/* Decorative elements */}
        <div className="mt-16 flex justify-center gap-2 animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
