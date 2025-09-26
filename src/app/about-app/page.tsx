import Header from "@/components/about-app/Header";
import HeroSection from "@/components/about-app/HeroSection";
import FeaturesSection from "@/components/about-app/FeaturesSection";
import CTASection from "@/components/about-app/CTASection";
import Footer from "@/components/about-app/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
