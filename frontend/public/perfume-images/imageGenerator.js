// Script to create placeholder perfume bottle images
// These represent the image files that would be created

const perfumeImages = [
  // Citrus Family
  {
    filename: "citrus-burst.jpg",
    description: "Bright orange/yellow gradient bottle with citrus slice patterns",
    color: "#FFA500",
    family: "citrus"
  },
  {
    filename: "mediterranean-breeze.jpg", 
    description: "Ocean blue bottle with wave patterns and sea salt crystals",
    color: "#0099CC",
    family: "citrus"
  },

  // Floral Family
  {
    filename: "rose-garden-dreams.jpg",
    description: "Pink gradient bottle with rose petal embossing",
    color: "#FF69B4",
    family: "floral"
  },
  {
    filename: "jasmine-nights.jpg",
    description: "Deep purple bottle with star patterns and gold accents",
    color: "#4B0082",
    family: "floral"
  },
  {
    filename: "eternal-spring.jpg",
    description: "Light green bottle with delicate flower etching",
    color: "#98FB98",
    family: "floral"
  },

  // Woody Family
  {
    filename: "sandalwood-serenity.jpg",
    description: "Warm brown bottle with wood grain texture",
    color: "#8B4513",
    family: "woody"
  },
  {
    filename: "forest-path.jpg",
    description: "Dark green bottle with tree bark texture and leaf patterns",
    color: "#228B22",
    family: "woody"
  },

  // Oriental Family
  {
    filename: "mystic-oud.jpg",
    description: "Black and gold ornate bottle with middle eastern patterns",
    color: "#000000",
    family: "oriental"
  },
  {
    filename: "amber-nights.jpg",
    description: "Amber/golden glass bottle with warm glow",
    color: "#FFBF00",
    family: "oriental"
  },
  {
    filename: "royal-saffron.jpg",
    description: "Regal purple bottle with gold crown cap and saffron thread designs",
    color: "#6A0DAD",
    family: "oriental"
  },

  // Fresh Family
  {
    filename: "ocean-breeze.jpg",
    description: "Clear blue bottle with wave patterns and sea foam effect",
    color: "#87CEEB",
    family: "fresh"
  },
  {
    filename: "alpine-fresh.jpg",
    description: "Crystal clear bottle with mountain peak cap and green accents",
    color: "#E0FFFF",
    family: "fresh"
  },

  // Gourmand Family
  {
    filename: "vanilla-dreams.jpg",
    description: "Cream colored bottle with vanilla bean patterns",
    color: "#F5DEB3",
    family: "gourmand"
  },
  {
    filename: "chocolate-temptation.jpg",
    description: "Rich brown bottle with cocoa bean texture and gold foil",
    color: "#7B3F00",
    family: "gourmand"
  }
];

// SVG Template for generating perfume bottle images
const generateBottleSVG = (color, family, name) => {
  const familyIcons = {
    citrus: "🍋",
    floral: "🌸", 
    woody: "🌳",
    oriental: "🏺",
    fresh: "💧",
    gourmand: "🍯"
  };

  return `
<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <!-- Bottle Background -->
  <defs>
    <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Bottle Body -->
  <rect x="75" y="120" width="150" height="220" rx="15" ry="15" fill="url(#bottleGrad)" stroke="#333" stroke-width="2"/>
  
  <!-- Bottle Neck -->
  <rect x="120" y="80" width="60" height="50" fill="url(#bottleGrad)" stroke="#333" stroke-width="2"/>
  
  <!-- Bottle Cap -->
  <rect x="110" y="60" width="80" height="30" rx="5" ry="5" fill="#C0C0C0" stroke="#333" stroke-width="2"/>
  
  <!-- Label -->
  <rect x="85" y="180" width="130" height="80" rx="5" ry="5" fill="white" opacity="0.9" stroke="#333" stroke-width="1"/>
  
  <!-- Brand Name -->
  <text x="150" y="205" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="#333">Olfactive Echo</text>
  
  <!-- Perfume Name -->
  <text x="150" y="225" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">${name}</text>
  
  <!-- Family Icon -->
  <text x="150" y="245" text-anchor="middle" font-size="20">${familyIcons[family]}</text>
  
  <!-- Decorative Elements -->
  <circle cx="150" cy="140" r="5" fill="white" opacity="0.7"/>
  <circle cx="150" cy="300" r="3" fill="white" opacity="0.5"/>
</svg>`;
};

// Generate image data for each perfume
const imageData = perfumeImages.map(img => ({
  ...img,
  svg: generateBottleSVG(img.color, img.family, img.filename.replace('-', ' ').replace('.jpg', ''))
}));

console.log('Perfume Image Generation Plan:');
console.log('=============================');
imageData.forEach(img => {
  console.log(`📸 ${img.filename}`);
  console.log(`   Family: ${img.family}`);
  console.log(`   Color: ${img.color}`);
  console.log(`   Description: ${img.description}`);
  console.log('');
});

module.exports = { perfumeImages, imageData, generateBottleSVG };