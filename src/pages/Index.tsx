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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <WhyChooseUs />
        <PremiumBreeds />
        <FeaturedCollection />
        <RaritySection />
        <PricingSection />
        <PaymentMethods />
        <FinalCTA />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
