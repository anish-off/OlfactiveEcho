import React from "react";
import { motion } from "framer-motion";
import ScrollAnimationWrapper from "../components/ui/ScrollAnimationWrapper";
import FeaturedProduct from "../components/product/FeaturedProduct";
import Testimonials from "../components/product/Testimonials";
import Footer from "../components/Footer";
import { Link } from 'react-router-dom';
import DiscountBanner from '../components/discount/DiscountBanner';
import AdvancedOffersBanner from '../components/discount/AdvancedOffersBanner';

const Products = () => {
  return (
    <main className="bg-gradient-to-br from-white via-gray-50/30 to-primary/5">
      {/* Discount Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-4">
        <DiscountBanner
          title="Great Fragrance Festival"
          subtitle="Up to 70% OFF + Extra 10% OFF on Premium Perfumes"
          endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)} // 7 days from now
          theme="sale"
        />
      </div>

      {/* Full Viewport Hero Section */}
      <section className="flex items-center justify-center px-6 py-12">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-[#c69a2d] via-[#b8860b] to-[#a06800] bg-clip-text text-transparent">
              Signature Collection
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Discover premium fragrances crafted for unique moments and exceptional experiences
          </p>
          
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <Link
              to="/collections"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#c69a2d] to-[#b8860b] hover:from-[#b8860b] hover:to-[#a06800] text-white rounded-full text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Explore Our Collections
            </Link>
            
            {/* Scroll indicator */}
            <motion.div
              className="mt-8 flex flex-col items-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <p className="text-sm font-medium mb-2">Scroll to discover more</p>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-1 h-3 bg-gray-400 rounded-full mt-2"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Advanced Offers Banner - Mega Promotional Section */}
      <section>
        <AdvancedOffersBanner showAll={true} />
      </section>

      {/* Featured Products Carousel - Appears on scroll */}
      <section className="flex items-center py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ScrollAnimationWrapper>
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                Featured <span className="text-primary">Fragrances</span>
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                Handpicked selections from our premium collection
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <FeaturedProduct />
            </motion.div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Testimonials Section - Appears on scroll */}
      <section className="flex items-center py-12 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ScrollAnimationWrapper delay={0.2}>
            <div className="text-center mb-12">
              <motion.h2
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                Loved by Our <span className="text-primary">Community</span>
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                Hear what our customers say about their Olfactive Echo experience
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Testimonials />
            </motion.div>
          </ScrollAnimationWrapper>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
};
export default Products;