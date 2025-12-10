import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import SEOHead from "@/components/SEOHead";
import { Crown, Sparkles, HelpCircle, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const { t, i18n } = useTranslation();

  // FAQ items with translation keys
  const faqItems = [
    { key: "whatIsSavannah" },
    { key: "savannahPrice" },
    { key: "f1VsF2" },
    { key: "savannahSize" },
    { key: "savannahPersonality" },
    { key: "savannahLegal" },
    { key: "savannahLifespan" },
    { key: "savannahCare" },
    { key: "savannahDiet" },
    { key: "savannahOtherPets" },
    { key: "savannahChildren" },
    { key: "buyingSavannah" },
    { key: "savannahHealth" },
    { key: "savannahShipping" },
    { key: "savannahDeposit" },
  ];

  // Generate structured data for SEO
  const generateFaqStructuredData = () => {
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqItems.map((item) => ({
        "@type": "Question",
        "name": t(`faq.items.${item.key}.question`),
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t(`faq.items.${item.key}.answer`)
        }
      }))
    };
  };

  return (
    <div className="min-h-screen">
      <SEOHead
        titleKey="seo.faq.title"
        descriptionKey="seo.faq.description"
        keywordsKey="seo.faq.keywords"
        canonicalUrl="https://savannahmonarchy.com/faq"
        page="faq"
        structuredData={generateFaqStructuredData()}
      />
      <Navigation />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="py-20 bg-secondary/30 relative overflow-hidden">
          <div className="absolute top-20 left-10 opacity-5">
            <Crown className="w-32 h-32 text-primary animate-float" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-5">
            <HelpCircle className="w-40 h-40 text-accent animate-float" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full mb-4 micro-interaction">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold tracking-widest uppercase text-primary">
                  {t('faq.badge')}
                </span>
              </div>
              <h1 className="font-display font-black text-luxury-gradient luxury-text-shadow py-[10px]">
                {t('faq.title')}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-light">
                {t('faq.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <ScrollAnimationWrapper animation="fade" delay={100}>
          <section className="py-20">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqItems.map((item, index) => (
                    <AccordionItem 
                      key={item.key} 
                      value={item.key}
                      className="glass-card rounded-2xl border-2 border-primary/10 px-6 hover:border-primary/30 transition-all duration-300 hover:shadow-gold animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <AccordionTrigger className="text-left py-6 hover:no-underline group">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-300 flex-shrink-0 mt-1">
                            <HelpCircle className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-display font-bold text-lg md:text-xl text-foreground group-hover:text-primary transition-colors duration-300">
                            {t(`faq.items.${item.key}.question`)}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 pt-2">
                        <div className="pl-14 pr-4">
                          <p className="text-muted-foreground leading-relaxed text-base md:text-lg font-light whitespace-pre-line">
                            {t(`faq.items.${item.key}.answer`)}
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>

        {/* Contact CTA */}
        <ScrollAnimationWrapper animation="fade" delay={150}>
          <section className="py-20 bg-secondary/30">
            <div className="container mx-auto px-6">
              <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
                <h2 className="font-display font-black text-3xl md:text-4xl luxury-text-shadow">
                  {t('faq.cta.title')}
                </h2>
                <p className="text-lg text-muted-foreground font-light">
                  {t('faq.cta.subtitle')}
                </p>
                <a 
                  href="/contact" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-bold text-lg transition-all duration-500 hover:shadow-glow hover:-translate-y-1 hover:scale-105"
                >
                  {t('faq.cta.button')}
                </a>
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default FAQ;
