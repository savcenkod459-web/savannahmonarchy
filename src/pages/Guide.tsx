import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Utensils, Home, Heart, Activity, Crown, Sparkles, Diamond, Star, Book, AlertCircle, Layers, Target, HandHeart } from "lucide-react";
const ageStages = [{
  age: "1–3 месяца",
  title: "Ранний возраст",
  subtitle: "Период основания",
  icon: Heart,
  sections: [{
    title: "Питание",
    content: "До 8 недель котёнок должен питаться материнским молоком. При отсутствии кошки-кормилицы — специальные заменители. С 8 недель — постепенный переход на влажный корм премиум-класса для котят или сырое мясо по согласованию с заводчиком. Кормление: 5–6 раз в день маленькими порциями."
  }, {
    title: "Уход",
    content: "Мягкая подстилка в тёплом, безопасном месте. Поддержание температуры помещения: не ниже 21°C. Регулярная смена подстилки. Приучение к лотку: используйте лоток с невысокими бортиками и без запаха."
  }, {
    title: "Здоровье",
    content: "Дегельминтизация — по рекомендациям заводчика. Первая вакцинация — с 8 недель. Обработка от блох и клещей — строго по возрасту."
  }]
}, {
  age: "3–6 месяцев",
  title: "Этап активного роста",
  subtitle: "Период развития",
  icon: Activity,
  sections: [{
    title: "Питание",
    content: "Переход на сбалансированный сухой и влажный корм класса суперпремиум. Допускается сырое мясо (индейка, курица, говядина) — только после консультации с ветеринаром. Кормление: 4 раза в день."
  }, {
    title: "Уход",
    content: "Игровая активность: обязательны интеллектуальные игрушки, лазалки, когтеточки. Привыкание к чистке ушей, стрижке когтей. Начало приучения к шлейке и поводку."
  }, {
    title: "Здоровье",
    content: "Повторная вакцинация (ревакцинация). Плановое обследование у ветеринара. Чипирование (по желанию владельца или в зависимости от страны проживания)."
  }]
}, {
  age: "6 месяцев – 1 год",
  title: "Подростковый возраст",
  subtitle: "Подростковый период",
  icon: Home,
  sections: [{
    title: "Питание",
    content: "Переход на корм для молодых кошек. Питание — 3 раза в день. Свежая вода — всегда в доступе."
  }, {
    title: "Поведение и воспитание",
    content: "Продолжение социализации. Игры, обучение простым командам. Использование когтеточек для предотвращения порчи мебели."
  }, {
    title: "Здоровье",
    content: "Продолжение обработки от паразитов."
  }]
}, {
  age: "1–2 года",
  title: "Формирование взрослой особи",
  subtitle: "Период созревания",
  icon: Utensils,
  sections: [{
    title: "Питание",
    content: "Переход на рацион для взрослых кошек крупных пород. 2–3 кормления в день. Рекомендуется комбинировать сухой и влажный корм."
  }, {
    title: "Уход",
    content: "Регулярный груминг (хотя шерсть Саванны короткая, вычёсывание помогает избавиться от пыли и поддерживать блеск). Гигиена ушей, глаз и зубов."
  }, {
    title: "Активность",
    content: "Саванны очень энергичны — обязательны ежедневные игры и физическая нагрузка. По возможности — выгул на поводке в безопасном месте."
  }, {
    title: "Поведение",
    content: 'Это "кошачьи собаки" — очень умны, могут открывать двери, учатся на имя и команды. Требуют внимания и тесного контакта с хозяином.'
  }]
}];
const Guide = () => {
  return <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-secondary/30 relative overflow-hidden">
          <div className="absolute top-20 left-10 opacity-5">
            <Crown className="w-32 h-32 text-primary animate-float" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-5">
            <Book className="w-40 h-40 text-accent animate-float" style={{
            animationDelay: '2s'
          }} />
          </div>
          
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-4 micro-interaction">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold tracking-widest uppercase text-primary">Экспертный уход</span>
              </div>
              <h1 className="font-display font-black text-luxury-gradient luxury-text-shadow py-[10px]">
                Инструкция по уходу за котами породы Саванна
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
                Коты породы Саванна — это не просто питомцы, а настоящие представители дикой элегантности 
                в домашней обстановке. Умные, активные, преданные и требующие особого подхода, эти кошки 
                нуждаются в грамотном уходе, особенно в первые годы жизни.
              </p>
            </div>
          </div>
        </section>

        {/* Age Stages */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="space-y-16">
              {ageStages.map((stage, index) => <div key={index} className="max-w-5xl mx-auto animate-fade-in" style={{
              animationDelay: `${index * 100}ms`
            }}>
                  <div className="mb-8 flex items-center gap-4">
                    <div className="p-5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl shadow-soft">
                      <stage.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display font-black text-3xl md:text-4xl luxury-text-shadow">{stage.age}</h2>
                      <p className="text-lg text-muted-foreground font-light">{stage.title}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stage.sections.map((section, sIdx) => <div key={sIdx} className="group p-6 glass-card rounded-2xl shadow-soft hover:shadow-elegant transition-all duration-500 hover-lift micro-interaction">
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-4 h-4 text-primary animate-pulse" />
                          <h3 className="text-xl font-display font-bold luxury-text-shadow">{section.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-light">
                          {section.content}
                        </p>
                      </div>)}
                  </div>
                </div>)}
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
              <h2 className="font-display font-black text-4xl text-center mb-12 flex items-center justify-center gap-3">
                <AlertCircle className="w-10 h-10 text-primary" />
                Важно знать
              </h2>

              <div className="space-y-6">
                <div className="group p-8 glass-card rounded-3xl shadow-soft hover:shadow-glow transition-all duration-500 hover-lift micro-interaction bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl shadow-soft">
                      <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-display font-bold luxury-text-shadow">
                      Уровни поколений
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Саванна — гибридная порода (домашняя кошка + сервалы). Уровень поколения (F1–F5) 
                    влияет на поведение, размеры и требования. Чем ближе к дикой природе (F1, F2), 
                    тем выше требования к уходу, пространству, питанию.
                  </p>
                  <div className="mt-4 pt-4 border-t border-primary/10 flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary animate-pulse" />
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                  </div>
                </div>

                <div className="group p-8 glass-card rounded-3xl shadow-soft hover:shadow-glow transition-all duration-500 hover-lift micro-interaction bg-gradient-to-br from-primary/5 to-accent/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl shadow-soft">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-2xl font-display font-bold luxury-text-shadow">
                      Требования к образу жизни
                    </h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Порода не подходит для замкнутого образа жизни в маленькой квартире без выгула и 
                    активности. Саванны требуют пространства, физической нагрузки и умственной стимуляции.
                  </p>
                  <div className="mt-4 pt-4 border-t border-primary/10 flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary animate-pulse" />
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-primary/50 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Support Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <h2 className="font-display font-black text-4xl flex items-center justify-center gap-3">
                <HandHeart className="w-10 h-10 text-primary" />
                Поддержка новых владельцев
              </h2>
              <div className="p-8 glass-card rounded-3xl shadow-glow border border-primary/20 bg-card/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl shadow-soft">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                  <p className="text-xl font-display font-bold text-primary">
                    Мы предоставляем:
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors duration-300">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0 shadow-soft" />
                    <span className="text-muted-foreground leading-relaxed">Ответы на важные вопросы от заводчика в первые дни/недели жизни котенка</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors duration-300">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0 shadow-soft" />
                    <span className="text-muted-foreground leading-relaxed">Помощь в выборе корма, аксессуаров</span>
                  </li>
                  <li className="flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-colors duration-300">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0 shadow-soft" />
                    <span className="text-muted-foreground leading-relaxed">Рекомендации ветклиник в вашем регионе</span>
                  </li>
                </ul>
                <div className="relative pt-6 border-t border-primary/20">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Diamond className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <p className="text-2xl font-display font-bold text-center text-luxury-gradient luxury-text-shadow">
                    Любите, ухаживайте и общайтесь с вашей Саванной — и она ответит вам преданностью и ярким характером!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>;
};
export default Guide;