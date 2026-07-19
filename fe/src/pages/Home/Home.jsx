import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useGetProductsQuery } from '../../features/products/productApi';
import ProductCard from '../../components/product/ProductCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const { data: products, isLoading } = useGetProductsQuery();
  
  // Testimonial slider setup
  const testimonials = [
    { text: '"ShopNest has completely transformed my home. The curation is impeccable—every piece I\'ve bought feels like an investment in quality that will last forever."', author: 'ELEANOR V., NEW YORK' },
    { text: '"Finally, a store that understands the balance between minimalism and warmth. The sustainable fashion line is simply stunning."', author: 'MARCUS T., LONDON' },
    { text: '"Expertly packaged, incredibly fast shipping, and pieces that look even better in person than they do online. A masterpiece of retail."', author: 'SOPHIA L., PARIS' }
  ];
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [fade, setFade] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        setFade(true);
      }, 500); // 500ms fade-out transition duration
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const scrollTrending = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleJoinCollectiveSubmit = (e) => {
    e.preventDefault();
    alert("Welcome to the Collective! Check your inbox for your 10% gift code (WELCOME10).");
  };

  return (
    <div className="space-y-0">
      {/* Hero Section */}
      <section className="relative h-[80vh] md:h-[921px] flex items-center overflow-hidden mb-xl">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover"
            alt="Minimalist linen editorial representation"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPIMI9BToxboMyGHhPgATPmBvIoWxBJlyzIrd1KHq7DspdOJcYqZMWjmnP92iiJjzdofhGkoLcmrygHl9M0z2IzdMoc36mgka19PuouMvnEseQPJ9EP9rp5EHLBgRZS_ZfQuPX7jYEHjNjiVuHtHFIn7MtdOLeXFFCaDw_dGE2bM8SYZOsnYOGx01RA5tYebQhjmVWoCCdd0GFWQZgmWCc49y6Pgua23a3vBBA1IobQXq5sYG05qaS"
          />
          <div className="absolute inset-0 bg-primary/10"></div>
        </div>
        <div className="relative z-10 px-gutter max-w-container-max mx-auto w-full">
          <div className="max-w-2xl">
            <span className="font-label-caps text-label-caps text-primary tracking-widest block mb-4">SEASONAL CAMPAIGN 2024</span>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-8 leading-tight">
              Timeless Essentials
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
              Curated pieces designed to endure beyond the seasons. Discover the intersection of artisanal craft and modern minimalist design.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/products')}
                className="bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-button hover:opacity-90 transition-opacity tracking-wider shadow-sm"
              >
                Shop the Collection
              </button>
              <button
                onClick={() => navigate('/products')}
                className="border border-primary text-primary px-8 py-4 rounded-xl font-button text-button hover:bg-primary/5 transition-colors tracking-wider"
              >
                View Campaign
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Bento Grid */}
      <section className="px-gutter max-w-container-max mx-auto mb-xl">
        <div className="flex flex-col sm:flex-row justify-between items-baseline mb-md gap-2">
          <h2 className="font-headline-md text-headline-md text-primary">Curated Categories</h2>
          <span
            onClick={() => navigate('/products')}
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary underline cursor-pointer transition-colors"
          >
            Explore All
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-base h-auto md:h-[600px] gap-y-4 md:gap-y-0">
          {/* Large Bento Tile */}
          <div
            onClick={() => navigate('/products')}
            className="md:col-span-8 relative rounded-xl overflow-hidden group cursor-pointer h-[400px] md:h-full border border-outline-variant/10 shadow-xs hover:shadow-md transition-shadow"
          >
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt="Minimalist Living Space"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxyUGZZrdm7Ok-Mqks3M7quhQWZOLve4Dok91B4BV7ntzqPbiZZrrvJoyOPVZNqMcNG4HKh7wJuI3fe2mt63VNTZ6zS9xMbGJFGRdQodn7wGg1Vn9dUm6X5fGbVgSvB_vB9ZE3tkQTCJlPO7793yVWtOBzB80_nJ8WzteXMWUZroL7cXNd71iSvqzUK5Qsz8w392bJQgBvVK81tyU_neT0pGU3M68eUcmmR8RM4vjMQPXtOxLAuvHW"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <h3 className="font-headline-sm text-headline-sm text-white mb-2">Minimalist Living</h3>
              <p className="text-white/85 font-body-sm mb-4">Functional beauty for the modern home.</p>
              <span className="text-white font-label-caps border-b border-white pb-1 tracking-widest uppercase text-[11px]">Shop Now</span>
            </div>
          </div>

          {/* Stacked Side Tiles */}
          <div className="md:col-span-4 grid grid-rows-2 gap-base h-[400px] md:h-full gap-y-4 md:gap-y-0">
            <div
              onClick={() => navigate('/products')}
              className="relative rounded-xl overflow-hidden group cursor-pointer h-full border border-outline-variant/10 shadow-xs"
            >
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Sustainable Fashion closeup"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBI7ur7_o85M41p0ju_W4ImvzvDiwXoxzz5iC0vWLo2IvDOO54slqIo31_iwLMvPchf2cG1KqiP53kI2hEUj5pLS4QMKwZBKWMntraTcqR-jBaudQIPgfa1zW4FlNwWGjqdNhRZlKYOfynxFtkWeuaFsLzc2zJFQgddhmTCfc29_oUgOwTP6eBXf8G-I0YlEWHqf7RZYM83wSnZ4YvTRq4eMySdDYBOzwDjIOGjz5uY9HO02ds7-yA1"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="font-headline-sm text-headline-sm text-white">Sustainable Fashion</h3>
              </div>
            </div>
            
            <div
              onClick={() => navigate('/products')}
              className="relative rounded-xl overflow-hidden group cursor-pointer h-full border border-outline-variant/10 shadow-xs"
            >
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                alt="Iconic Decor tabletop arrangement"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2AeiFopVXVUHoEUqwk3jfKEtbr64EeZ6guOXdkBT81d7w5X71SFyUGbnakjA-eO-OZQaZa28MoVvXzX7RZP4zY71exd364l8Bahwi05rCqbmQk3vMbYFMT6QtZV0YiMcCdDuOyM6hluCmlpLXKL-3Yd_UR5Af3M6tGA_4PZsJfwgzYbWpkA7DQGUdDsKvmeGQUCAMA0stVTNq3ZqwxVJkQG00_4Ev7RgzdonZ1WPl42E44G1l5t3G"
              />
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="font-headline-sm text-headline-sm text-white">Iconic Decor</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="bg-surface-container-low py-xl overflow-hidden">
        <div className="px-gutter max-w-container-max mx-auto">
          <div className="flex justify-between items-center mb-lg">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">Trending Now</h2>
              <p className="font-body-md text-on-surface-variant">The pieces everyone is talking about.</p>
            </div>
            <div className="flex space-x-base">
              <button
                onClick={() => scrollTrending('left')}
                className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center bg-transparent hover:bg-surface transition-colors cursor-pointer"
                title="Scroll Left"
              >
                <ChevronLeft size={20} className="text-primary" />
              </button>
              <button
                onClick={() => scrollTrending('right')}
                className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center bg-transparent hover:bg-surface transition-colors cursor-pointer"
                title="Scroll Right"
              >
                <ChevronRight size={20} className="text-primary" />
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex space-x-gutter overflow-x-auto hide-scrollbar pb-base scroll-smooth snap-x"
            >
              {products?.slice(0, 4).map((product) => (
                <div key={product.id} className="min-w-[280px] md:min-w-[300px] max-w-[300px] snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals Showcase */}
      <section className="px-gutter max-w-container-max mx-auto py-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg items-center">
          <div className="relative rounded-xl overflow-hidden h-[400px] md:h-[700px]">
            <img
              className="w-full h-full object-cover"
              alt="High fashion representation"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4cFTtYsA8JWj85wKrgvyo30DDQuGE6bwfFdE5uZu8hpYd4SjxnVQNOSCooZYDnE61HJxc62RPr5rTdeyafezdnijuSmG9q36bCJY3WUgYVi4fWM_60ETrONV246IxDnY_G4UPgWqz7USmE8Ix6ZIEf6nynYuQxBwv2ry3xAxn_VUVtsZn0ycx3OCbqpDe77rAvOH1tX48g-8O6QLmW78hg4iA2i8Kbg5il_6rR_DopPxToutuDQu6"
            />
            <div className="absolute inset-0 bg-primary/5"></div>
          </div>
          
          <div className="md:pl-12">
            <h2 className="font-headline-md text-headline-md mb-6 italic text-primary">The New Guard</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 leading-relaxed">
              Our latest arrivals from independent designers across the globe. Each piece is selected for its commitment to quality and unique aesthetic voice.
            </p>
            
            <div className="space-y-base mb-10">
              <div
                onClick={() => navigate('/products')}
                className="flex items-center space-x-4 p-4 border border-outline-variant rounded-xl group hover:bg-surface transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt="Gold structural cuff bracelet"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_6eeNODC9GxpUvyhGbC-wN3-nHy7blNNZlK82UEgxhgzUFXkZKGlJVyTKBitHTLVUQOEGm1gyWGO8l-jkJtsaSME6SR5ElrjOohNydthAqeOSYo8b9LH0LwEkpuFFPj5wWmOCnFcGtQVUuG-Z8oT3KubI7Uj2PaxfFHhC6INUQLp5lto3KfBSruBx1sg8rW7dR6zYNchVe1mFv-G55_cWLyEt55bSWQ6T65S2NtlxRSLho8KzA0YW"
                  />
                </div>
                <div className="flex-grow">
                  <h5 className="font-body-md font-bold text-primary">Aura Jewelry Collective</h5>
                  <p className="text-on-surface-variant text-body-sm">Handcrafted structural gold.</p>
                </div>
                <ArrowRight size={18} className="text-primary transition-transform group-hover:translate-x-1" />
              </div>
              
              <div
                onClick={() => navigate('/products')}
                className="flex items-center space-x-4 p-4 border border-outline-variant rounded-xl group hover:bg-surface transition-colors cursor-pointer"
              >
                <div className="w-16 h-16 bg-surface-container rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt="Linen textiles"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR654lbNzz5fGkD5QwlnYmrrSbyqC7JtnI0g5ncxsN1x1Kup6XlUbNN2dwSIcxhTyIagxkcjTdo9Sgy8SnwgEgx5sfu7RhbaK4EjJwlQNYYcsKkDsR4tZdF_K2znuiFi22QAx2P_YXQig-bX_LIPjLf2cGkVbR33nF4tpdzlE5gDDh4GbhIAH0JwZMcgMrWoObXh-WLwBOWlUEnczkSuks0BQiALug_gT0n9_IHU7jo54dwQlk0rb-"
                  />
                </div>
                <div className="flex-grow">
                  <h5 className="font-body-md font-bold text-primary">Nordic Weaves</h5>
                  <p className="text-on-surface-variant text-body-sm">Ethically sourced organic linens.</p>
                </div>
                <ArrowRight size={18} className="text-primary transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            
            <button
              onClick={() => navigate('/products')}
              className="bg-primary text-on-primary px-8 py-4 rounded-xl font-button text-button w-full md:w-auto hover:opacity-90 transition-opacity tracking-wider shadow-sm"
            >
              View All New Arrivals
            </button>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="bg-primary py-xl text-on-primary">
        <div className="px-gutter max-w-container-max mx-auto text-center">
          <span className="font-label-caps text-label-caps text-on-primary/60 tracking-widest mb-8 block uppercase">
            WHAT OUR COMMUNITY SAYS
          </span>
          <div className="max-w-3xl mx-auto h-[240px] md:h-[200px] flex flex-col justify-between items-center relative">
            <div className={`transition-opacity duration-500 flex flex-col items-center ${fade ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex justify-center mb-6 text-secondary-container">
                <span className="material-symbols-outlined active-icon text-[18px]">star</span>
                <span className="material-symbols-outlined active-icon text-[18px]">star</span>
                <span className="material-symbols-outlined active-icon text-[18px]">star</span>
                <span className="material-symbols-outlined active-icon text-[18px]">star</span>
                <span className="material-symbols-outlined active-icon text-[18px]">star</span>
              </div>
              <p className="font-headline-sm text-headline-sm italic mb-8 px-4 text-white leading-relaxed">
                {testimonials[currentTestimonial].text}
              </p>
              <div className="font-label-caps text-[11px] text-white/80 tracking-widest">
                {testimonials[currentTestimonial].author}
              </div>
            </div>
            
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i === currentTestimonial ? 'bg-white' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / Join the Collective Section */}
      <section className="py-xl px-gutter">
        <div className="max-w-4xl mx-auto bg-surface-container rounded-3xl p-lg md:p-xl flex flex-col md:flex-row items-center gap-lg border border-outline-variant/10 shadow-xs">
          <div className="md:w-1/2">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Join the Collective</h2>
            <p className="font-body-md text-on-surface-variant leading-relaxed">
              Subscribe for early access to new collections, exclusive editorial content, and a 10% welcome gift.
            </p>
          </div>
          <div className="md:w-1/2 w-full">
            <form onSubmit={handleJoinCollectiveSubmit} className="space-y-4">
              <div className="relative flex items-center bg-white border border-outline-variant/60 rounded-xl overflow-hidden focus-within:border-primary transition-colors">
                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  className="w-full bg-white border-none focus:ring-0 px-6 py-4 font-body-sm text-body-sm outline-none text-primary"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 bg-primary text-on-primary px-6 rounded-lg font-button text-button hover:opacity-90 transition-opacity tracking-wider"
                >
                  Join
                </button>
              </div>
              <p className="text-[10px] text-on-surface-variant/60 text-center md:text-left leading-normal">
                By subscribing, you agree to our Privacy Policy and Terms of Service.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
