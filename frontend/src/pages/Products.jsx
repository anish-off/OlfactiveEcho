import React from "react";
import { motion } from "framer-motion";
import ScrollAnimationWrapper from "../components/ui/ScrollAnimationWrapper";
import FeaturedProduct from "../components/product/FeaturedProduct";
import Testimonials from "../components/product/Testimonials";
import Footer from "../components/Footer";
import { Link } from 'react-router-dom';

const Products = () => {
  return (
    <main className="bg-gradient-to-br from-white via-gray-50/30 to-primary/5">
      {/* Full Viewport Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-16">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-primary via-amber-600 to-primary bg-clip-text text-transparent">
              Signature Collection
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Discover premium fragrances crafted for unique moments and exceptional experiences
          </p>
          
          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <Link
              to="/products/all"
              className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-primary to-amber-600 hover:from-primary/90 hover:to-amber-600/90 text-white rounded-full text-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Explore All Products
            </Link>
            
            {/* Scroll indicator */}
            <motion.div
              className="mt-16 flex flex-col items-center text-gray-500"
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

      {/* Featured Products Carousel - Appears on scroll */}
      <section className="min-h-screen flex items-center py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ScrollAnimationWrapper>
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                Featured <span className="text-primary">Fragrances</span>
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 max-w-2xl mx-auto"
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
      <section className="min-h-screen flex items-center py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <ScrollAnimationWrapper delay={0.2}>
            <div className="text-center mb-16">
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                Loved by Our <span className="text-primary">Community</span>
              </motion.h2>
              <motion.p
                className="text-xl text-gray-600 max-w-2xl mx-auto"
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