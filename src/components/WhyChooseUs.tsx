import { Award, Heart, ShieldCheck, Headphones, Crown, Sparkles, Star, Diamond } from "lucide-react";
const features = [{
  icon: Award,
  title: "Премиум родословная",
  description: "Все наши кошки имеют проверенные чемпионские линии и полные сертификаты здоровья"
}, {
  icon: ShieldCheck,
  title: "Гарантия здоровья",
  description: "Комплексная гарантия здоровья и пожизненная поддержка для вашего драгоценного компаньона"
}, {
  icon: Heart,
  title: "Любящий уход",
  description: "Каждая кошка выращена с исключительной любовью и социализацией в роскошных условиях"
}, {
  icon: Headphones,
  title: "Экспертная поддержка",
  description: "Поддержка 24/7 от нашей команды специалистов по уходу за кошками и ветеринаров"
}];
const WhyChooseUs = () => {
  return <section className="py-32 bg-secondary/30 relative overflow-hidden">
      {/* Декоративные элементы люкса */}
      <div className="absolute top-20 left-10 opacity-5">
        <Crown className="w-32 h-32 text-primary animate-float" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-5">
        <Diamond className="w-40 h-40 text-accent animate-float" style={{
        animationDelay: '2s'
      }} />
      </div>
      
      <div className="container mx-auto px-6">
        <div className="text-center space-y-6 mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-4 micro-interaction">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold tracking-widest uppercase text-primary">Премиум качество</span>
          </div>
          <h2 className="font-display text-luxury-gradient font-black luxury-text-shadow py-[10px] text-3xl md:text-4xl lg:text-5xl xl:text-6xl">Почему выбирают SavannahDynasty?</h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">Мы предоставляем высочайший стандарт элитных кошек породы Саванна с непревзойденным качеством и заботой</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => <div key={index} className="group p-8 glass-card rounded-3xl shadow-soft hover:shadow-elegant transition-all duration-500 hover-lift animate-scale-in hover-scale micro-interaction" style={{
          animationDelay: `${index * 100}ms`
        }}>
              <div className="mb-6 inline-flex p-5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-500 shadow-soft">
                <feature.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3 luxury-text-shadow">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">{feature.description}</p>
              
              {/* Минималистичный индикатор люкса */}
              <div className="mt-6 pt-6 border-t border-primary/10 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary animate-pulse" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
              </div>
            </div>)}
        </div>
      </div>
    </section>;
};
export default WhyChooseUs;