// Image utility functions for handling perfume images

// Create a proxied image URL to avoid CORS issues with external images
export const getProxiedImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === 'null' || imageUrl === 'undefined') {
    return null;
  }

  // If it's already a local URL, return as is
  if (imageUrl.startsWith('/') || imageUrl.startsWith('./') || imageUrl.includes('localhost')) {
    return imageUrl;
  }

  // For external URLs (like Fragrantica), use backend proxy
  if (imageUrl.startsWith('http')) {
    return `http://localhost:5000/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
  }

  return imageUrl;
};

// Get image with fallbacks in priority order
export const getImageWithFallbacks = ({ image_url, imageUrl, image, name }) => {
  // Priority order: image_url (from JSON) -> imageUrl -> image -> generated fallback
  const candidates = [
    image_url,
    imageUrl, 
    image
  ].filter(Boolean);

  if (candidates.length > 0) {
    return candidates[0];
  }

  // Generate fallback based on perfume name
  return generateFallbackImage(name);
};

// Generate fallback image URL based on perfume name
const generateFallbackImage = (name) => {
  if (!name) {
    return '/perfume-images/Unknown.jpg';
  }

  // Try to match with local SVG files
  const cleanName = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Common perfume image names in the public folder
  const commonImages = [
    'alpine-fresh.svg',
    'amber-nights.svg', 
    'chocolate-temptation.svg',
    'citrus-burst.svg',
    'eternal-spring.svg',
    'forest-path.svg',
    'jasmine-nights.svg',
    'mediterranean-breeze.svg',
    'mystic-oud.svg',
    'ocean-breeze.svg',
    'rose-garden-dreams.svg',
    'royal-saffron.svg',
    'sandalwood-serenity.svg',
    'vanilla-dreams.svg'
  ];

  // Try to find a matching image based on keywords
  const keywords = cleanName.split('-');
  for (const keyword of keywords) {
    const matchingImage = commonImages.find(img => 
      img.includes(keyword) || keyword.includes(img.split('.')[0].split('-')[0])
    );
    if (matchingImage) {
      return `/perfume-images/${matchingImage}`;
    }
  }

  // Default fallback
  return '/fragrance_images/Unknown.jpg';
};

// Preload image to check if it exists
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

// Get the best available image with async validation
export const getBestImage = async ({ image_url, imageUrl, image, name }) => {
  const primaryImage = getImageWithFallbacks({ image_url, imageUrl, image, name });
  
  if (!primaryImage) {
    return generateFallbackImage(name);
  }

  try {
    // Try the proxied version first for external URLs
    const proxiedUrl = getProxiedImageUrl(primaryImage);
    await preloadImage(proxiedUrl);
    return proxiedUrl;
  } catch (error) {
    console.warn(`Failed to load primary image: ${primaryImage}`, error);
    return generateFallbackImage(name);
  }
};

export default {
  getProxiedImageUrl,
  getImageWithFallbacks,
  getBestImage,
  preloadImage
};