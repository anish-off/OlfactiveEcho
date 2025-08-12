import React from "react";
import { motion } from "framer-motion";
import ScrollAnimationWrapper from "../components/ui/ScrollAnimationWrapper";
import ProductList from "../components/product/ProductList";
import FeaturedProduct from "../components/product/FeaturedProduct";
import WhyChooseUs from "../components/product/WhyChooseUs";
import Testimonials from "../components/product/Testimonials";
import ShopByCategory from "../components/product/ShopByCategory";
import CallToAction from "../components/product/CallToAction";

const Products = () => {
  return (
    <main className="relative overflow-hidden bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-center py-16 px-6 bg-gradient-to-br from-primary/5 via-white to-primary/5">
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615228939092-4c8c6f4e1b0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-70" /> {/* Subtle overlay */}
        </div>
        
        <ScrollAnimationWrapper>
          <div className="max-w-4xl mx-auto">
            <motion.h1 
              className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-amber-600 drop-shadow-md">
                Signature Fragrances
              </span>
            </motion.h1>
            
            <motion.p
              className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 drop-shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Crafted for the Discerning Individual
            </motion.p>
            
            <motion.p 
              className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 drop-shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Immerse yourself in an unparalleled sensory experience. Our exquisite collection of handcrafted perfumes is meticulously designed to evoke emotions, inspire memories, and tell a unique olfactory story that resonates with your individuality. Each bottle is a testament to artistry and passion.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <a 
                href="#products" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                Explore Collection
              </a>
            </motion.div>
          </div>
        </ScrollAnimationWrapper>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <section id="products" className="py-16 bg-white shadow-lg rounded-lg mb-16">
          <ScrollAnimationWrapper>
            <div className="w-full">
              <ProductList />
            </div>
          </ScrollAnimationWrapper>
        </section>

        <section className="py-16 bg-gray-100 shadow-lg rounded-lg mb-16">
          <ScrollAnimationWrapper delay={0.2}>
            <div className="w-full">
              <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">Featured Product</h2>
              <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">Highlighting a special item that embodies quality and craftsmanship.</p>
              <FeaturedProduct />
            </div>
          </ScrollAnimationWrapper>
        </section>

        <section className="py-16 bg-white shadow-lg rounded-lg mb-16">
          <ScrollAnimationWrapper delay={0.2}>
            <div className="w-full">
              <ShopByCategory />
            </div>
          </ScrollAnimationWrapper>
        </section>

        {/* <section className="py-16 bg-gray-100 shadow-lg rounded-lg mb-16">
          <ScrollAnimationWrapper delay={0.2}>
            <div className="w-full">
              <WhyChooseUs />
            </div>
          </ScrollAnimationWrapper>
        </section> */}

          <section className="py-16 bg-white shadow-lg rounded-lg mb-16">
            <ScrollAnimationWrapper delay={0.2}>
              <div className="w-full">
                <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">Loved by Our Community</h2>
                <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">Hear what our customers say about their Olfactive Echo experience.</p>
                <Testimonials />
              </div>
            </ScrollAnimationWrapper>
          </section>

          <section className="py-16 bg-white shadow-lg rounded-lg mb-16">
            <ScrollAnimationWrapper delay={0.2}>
              <div className="w-full">
                <h2 className="text-4xl font-bold text-gray-900 text-center mb-8">Ready to Explore?</h2>
                <p className="text-lg text-gray-600 text-center mb-12 max-w-3xl mx-auto">Join our community and embark on a journey of discovery with our unique offerings.</p>
                <CallToAction />
              </div>
            </ScrollAnimationWrapper>
          </section>
      </div>
    </main>
  );
};

export default Products;