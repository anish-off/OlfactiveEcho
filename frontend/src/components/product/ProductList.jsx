import React from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import ScrollAnimationWrapper from "@/components/ui/ScrollAnimationWrapper";

// Import images
import mysticBloomImage from "../../assests/mysticbloom.png";
import oceanBreezeImage from "../../assests/oceanbreeze.png";
import goldenHourImage from "../../assests/goldhour.png";

const sampleProducts = [
  {
    name: "Mystic Bloom",
    description: "A captivating blend of rare florals and warm spices.",
    price: "₹2,500",
    image: mysticBloomImage,
  },
  {
    name: "Ocean Breeze",
    description: "Fresh and invigorating, like a walk along the coast.",
    price: "₹2,200",
    image: oceanBreezeImage,
  },
  {
    name: "Golden Hour",
    description: "Warm and inviting, reminiscent of a sunset glow.",
    price: "₹2,800",
    image: goldenHourImage,
  },
];

const ProductList = () => {
  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <motion.h2 
          className="text-4xl font-bold tracking-tight text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our <span className="text-primary">Signature</span> Collection
        </motion.h2>
        <motion.p 
          className="text-lg text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Each fragrance is crafted with precision and passion.
        </motion.p>
      </div>
      
      <motion.div 
        className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2,
              delayChildren: 0.4
            }
          }
        }}
      >
        {sampleProducts.map((product, index) => (
          <motion.div
            key={product.name}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 }
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <ProductCard {...product} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default ProductList;