import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowRight, Crown, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import savannah1 from "@/assets/savannah-f1-1.jpg";
import savannah2 from "@/assets/savannah-f2-1.jpg";
import kitten from "@/assets/savannah-kitten-1.jpg";

type Cat = {
  id: string;
  name: string;
  breed: string;
  price: number;
  image: string;
  traits: string[];
};

const imageMap: Record<string, string> = {
  '/src/assets/savannah-f1-1.jpg': savannah1,
  '/src/assets/savannah-f2-1.jpg': savannah2,
  '/src/assets/savannah-kitten-1.jpg': kitten,
};

const FeaturedCollection = () => {
  // Fetch cats from Supabase
  const { data: cats, isLoading } = useQuery({
    queryKey: ['featured-cats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cats')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      
      return (data as Cat[]).map(cat => ({
        ...cat,
        image: imageMap[cat.image] || cat.image,
        price: `${cat.price.toLocaleString("en-US")} €`,
      }));
    },
  });
  return <section className="py-32 relative overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" style={{
        animationDelay: '3s'
      }} />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center space-y-6 mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-4 micro-interaction">
            <Crown className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold tracking-widest uppercase text-primary">Эксклюзив</span>
          </div>
          <h2 className="font-display font-black text-luxury-gradient luxury-text-shadow py-[10px]">
            Наша роскошная коллекция
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
            Испытайте элегантность и красоту наших тщательно отобранных элитных кошек
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : cats && cats.length > 0 ? (
            cats.map((cat, index) => <Link key={cat.id} to={`/catalog/${cat.id}`} className="group animate-scale-in" style={{
          animationDelay: `${index * 100}ms`
        }}>
              <div className="glass-card rounded-3xl overflow-hidden shadow-soft hover:shadow-elegant transition-all duration-500 hover-lift hover-scale micro-interaction">
                <div className="relative aspect-[3/4] overflow-hidden image-blur-edges">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Иконка премиум качества */}
                  <div className="absolute top-4 right-4 p-2 glass-effect rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-2xl font-display font-bold mb-1 luxury-text-shadow">{cat.name}</h3>
                    <p className="text-muted-foreground font-light flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-primary" />
                      {cat.breed}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {cat.traits.map((trait, i) => <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-accent/90 to-primary/90 text-white text-xs rounded-full font-semibold tracking-wide micro-interaction hover:scale-105">
                        {trait}
                      </span>)}
                  </div>
                  
                  <div className="pt-4 border-t border-primary/10 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Цена</p>
                      <span className="font-display font-black text-luxury-gradient text-4xl">
                        {cat.price}
                      </span>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-all duration-500">
                      <ArrowRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                  </div>
                </div>
              </Link>)
          ) : null}
        </div>

        <div className="text-center">
          <Link to="/catalog">
            <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 rounded-2xl border-2 hover:bg-secondary transition-all duration-400">
              Посмотреть всю коллекцию
              <ArrowRight className="ml-2 h-4 md:h-5 w-4 md:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>;
};
export default FeaturedCollection;