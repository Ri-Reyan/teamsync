import ProblemSection from "@/global_components/ProblemSection";
import StatsSection from "@/global_components/StatsSection";
import PricingSection from "@/global_components/PricingSection";
import HeroSection from "@/global_components/HeroSection";
import FaqSection from "@/global_components/FaqSection";
import StickyReviewSection from "@/global_components/StickyReviewSection";
import Footer from "@/global_components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#FFFDF5]">
      <HeroSection />
      <StatsSection />
      <ProblemSection />
      <PricingSection />
      <FaqSection />
      <StickyReviewSection />
      <Footer />
    </main>
  );
}
