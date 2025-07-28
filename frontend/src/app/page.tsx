import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import ProductListSection from '@/components/home/ProductListSection';

export default function HomePage() {
  return (
    <div className="bg-white">
      <HeroSection />
      <CategorySection />
      <ProductListSection />
    </div>
  );
}
