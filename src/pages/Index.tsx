import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import WhyChooseUs from "@/components/WhyChooseUs";
import PremiumBreeds from "@/components/PremiumBreeds";
import RaritySection from "@/components/RaritySection";
import PricingSection from "@/components/PricingSection";
import FeaturedCollection from "@/components/FeaturedCollection";
import PaymentMethods from "@/components/PaymentMethods";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import ScrollAnimationWrapper from "@/components/ScrollAnimationWrapper";
import SEOHead from "@/components/SEOHead";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SEOHead
        title="Buy F1 & F2 Savannah Cats - Elite Exotic Cat Breeder"
        description="Buy elite Savannah F1 and F2 cats from SavannahMonarchy - premium exotic cat breeder. African Serval hybrid kittens for sale with health guarantee, pedigree certification. Worldwide delivery. Savannah cat price from $15,000."
        keywords="Savannah cat, F1 Savannah cat, F2 Savannah cat, buy Savannah cat, Savannah kitten for sale, exotic cat breeder, African Serval hybrid, Savannah cat price, SavannahMonarchy, elite Savannah cats"
        canonicalUrl="https://savannahmonarchy.com/"
      />
      <Navigation />
      <main>
        <Hero />
        <ScrollAnimationWrapper animation="fade" delay={100}>
          <WhyChooseUs />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper animation="fade" delay={150}>
          <PremiumBreeds />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper animation="fade" delay={100}>
          <FeaturedCollection />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper animation="fade" delay={150}>
          <RaritySection />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper animation="fade" delay={100}>
          <PricingSection />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper animation="fade" delay={150}>
          <PaymentMethods />
        </ScrollAnimationWrapper>
        <ScrollAnimationWrapper animation="fade" delay={100}>
          <FinalCTA />
        </ScrollAnimationWrapper>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
