import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import ScrollAnimationWrapper from "@/components/ui/ScrollAnimationWrapper";
import { listPerfumes } from "@/api/perfume";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listPerfumes({ limit: 100 });
        const products = Array.isArray(data) ? data : (data.perfumes || []);
        setProducts(products);
      } catch (e) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <div className="py-10 text-center">Loading products...</div>;
  if (error)
    return (
      <div className="py-10 text-center text-red-500">{error}</div>
    );

  return (
    <div className="w-full">
      <div className="text-center mb-16">
        <motion.h2
          className="text-4xl font-bold tracking-tight text-gray-900 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Our{" "}
          <span className="text-primary">Signature</span> Collection
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
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 },
          },
        }}
      >
        {products.map((product) => (
          <motion.div
            key={product._id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <ProductCard {...product} />
          </motion.div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No products found.
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ProductList;