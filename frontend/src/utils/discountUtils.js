// This utility adds sample discount data to perfumes for testing
// You can integrate this with your existing data or modify your backend to include discount fields

export const addDiscountData = (perfumes) => {
  return perfumes.map((perfume, index) => {
    // Add discount to every 3rd product for variety
    const shouldHaveDiscount = index % 3 === 0;
    
    if (shouldHaveDiscount) {
      const discountPercent = [20, 30, 40, 50, 60, 70][Math.floor(Math.random() * 6)];
      const originalPrice = perfume.price * (1 + discountPercent / 100);
      
      return {
        ...perfume,
        originalPrice: Math.round(originalPrice),
        salePrice: perfume.price,
        discount: discountPercent,
        discountPercentage: discountPercent, // Add this field for component compatibility
        saleType: discountPercent >= 50 ? 'flash' : discountPercent >= 30 ? 'seasonal' : 'regular',
        discountType: discountPercent >= 50 ? 'flash' : discountPercent >= 30 ? 'seasonal' : 'regular', // Add this field
        isOnSale: true
      };
    }
    
    // Add some products as "premium deals" without traditional discounts
    if (index % 7 === 0) {
      return {
        ...perfume,
        saleType: 'premium',
        isPremiumDeal: true,
        freeShipping: true
      };
    }
    
    return perfume;
  });
};

export const mockDiscountProducts = [
  {
    _id: 'discount-1',
    name: 'Midnight Elegance',
    brand: 'Luxury Scents',
    description: 'A sophisticated evening fragrance with deep, mysterious notes',
    price: 2999,
    originalPrice: 4999,
    salePrice: 2999,
    discount: 40,
    saleType: 'flash',
    image_url: '/perfume-images/default-perfume.svg',
    rating: 4.5,
    reviewCount: 128,
    stock: 15,
    isPopular: true,
    category: 'luxury'
  },
  {
    _id: 'discount-2',
    name: 'Citrus Burst Premium',
    brand: 'Fresh Collection',
    description: 'Energizing citrus blend perfect for daytime wear',
    price: 1499,
    originalPrice: 2499,
    salePrice: 1499,
    discount: 40,
    saleType: 'seasonal',
    image_url: '/perfume-images/citrus-burst.svg',
    rating: 4.2,
    reviewCount: 89,
    stock: 8,
    isNew: true,
    category: 'fresh'
  },
  {
    _id: 'discount-3',
    name: 'Royal Amber',
    brand: 'Oriental Essence',
    description: 'Rich amber fragrance with oriental spices',
    price: 3499,
    originalPrice: 5999,
    salePrice: 3499,
    discount: 42,
    saleType: 'flash',
    image_url: '/perfume-images/amber-nights.svg',
    rating: 4.7,
    reviewCount: 156,
    stock: 5,
    isPopular: true,
    category: 'oriental'
  },
  {
    _id: 'discount-4',
    name: 'Woody Escape',
    brand: 'Forest Collection',
    description: 'Earthy woody fragrance inspired by nature',
    price: 1899,
    originalPrice: 2999,
    salePrice: 1899,
    discount: 37,
    saleType: 'seasonal',
    image_url: '/perfume-images/cedarwood-majesty.svg',
    rating: 4.3,
    reviewCount: 67,
    stock: 12,
    category: 'woody'
  },
  {
    _id: 'discount-5',
    name: 'Vanilla Dreams',
    brand: 'Sweet Sensations',
    description: 'Warm vanilla with hints of caramel and cream',
    price: 1799,
    originalPrice: 3199,
    salePrice: 1799,
    discount: 44,
    saleType: 'flash',
    image_url: '/perfume-images/vanilla-delight.svg',
    rating: 4.4,
    reviewCount: 92,
    stock: 3,
    category: 'sweet'
  },
  {
    _id: 'discount-6',
    name: 'Ocean Breeze',
    brand: 'Aquatic Scents',
    description: 'Fresh marine fragrance reminiscent of ocean waves',
    price: 1399,
    originalPrice: 2299,
    salePrice: 1399,
    discount: 39,
    saleType: 'seasonal',
    image_url: '/perfume-images/deep-blue.svg',
    rating: 4.1,
    reviewCount: 74,
    stock: 20,
    category: 'aquatic'
  }
];