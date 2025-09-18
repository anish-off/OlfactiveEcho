const fs = require('fs');
const path = require('path');
const realPerfumeData = require('../data/realPerfumeData');

// Define color schemes and icons for each scent family
const scentFamilyStyles = {
  citrus: { colors: ["#FFA500", "#FFD700", "#32CD32", "#00CED1"], icon: "🍋" },
  floral: { colors: ["#FF69B4", "#DDA0DD", "#FFB6C1", "#F0E68C"], icon: "�" },
  woody: { colors: ["#8B4513", "#D2691E", "#A0522D", "#228B22"], icon: "🌳" },
  oriental: { colors: ["#6A0DAD", "#B8860B", "#DC143C", "#8B008B"], icon: "�" },
  fresh: { colors: ["#87CEEB", "#E0FFFF", "#00FFFF", "#7FFFD4"], icon: "💧" },
  gourmand: { colors: ["#D2691E", "#F5DEB3", "#DEB887", "#CD853F"], icon: "�" }
};

// Function to get color for a perfume based on its index within scent family
const getColorForPerfume = (scentFamily, index) => {
  const familyColors = scentFamilyStyles[scentFamily]?.colors || ["#808080"];
  return familyColors[index % familyColors.length];
};

// Function to get icon for scent family
const getIconForFamily = (scentFamily) => {
  return scentFamilyStyles[scentFamily]?.icon || "�";
};

// Generate perfume image data from our real perfume collection
const generatePerfumeImageData = () => {
  const scentFamilyCounts = {};
  
  return realPerfumeData.map(perfume => {
    // Count occurrences of each scent family for color variation
    if (!scentFamilyCounts[perfume.scentFamily]) {
      scentFamilyCounts[perfume.scentFamily] = 0;
    }
    
    const familyIndex = scentFamilyCounts[perfume.scentFamily];
    scentFamilyCounts[perfume.scentFamily]++;
    
    const filename = perfume.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '.svg';
    
    return {
      name: perfume.name,
      filename: filename,
      color: getColorForPerfume(perfume.scentFamily, familyIndex),
      family: perfume.scentFamily,
      icon: getIconForFamily(perfume.scentFamily),
      concentration: perfume.concentration || 'EDT',
      brand: perfume.brand
    };
  });
};

const generateBottleSVG = (perfumeData) => {
  const { name, color, icon, concentration, brand } = perfumeData;
  
  return `<svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.7" />
      <stop offset="50%" style="stop-color:${color};stop-opacity:0.9" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E8E8E8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B8B8B8;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="4" stdDeviation="4" flood-opacity="0.3"/>
    </filter>
    <filter id="innerShadow">
      <feOffset dx="0" dy="2"/>
      <feGaussianBlur stdDeviation="2" result="offset-blur"/>
      <feFlood flood-color="#000" flood-opacity="0.2"/>
      <feComposite in2="offset-blur" operator="in"/>
    </filter>
  </defs>
  
  <!-- Bottle Body -->
  <rect x="75" y="120" width="150" height="230" rx="20" ry="20" fill="url(#bottleGrad)" stroke="#333" stroke-width="2" filter="url(#shadow)"/>
  
  <!-- Liquid Level -->
  <rect x="80" y="130" width="140" height="210" rx="15" ry="15" fill="${color}" opacity="0.6"/>
  
  <!-- Bottle Neck -->
  <rect x="120" y="80" width="60" height="50" fill="url(#bottleGrad)" stroke="#333" stroke-width="2"/>
  
  <!-- Bottle Cap -->
  <rect x="110" y="55" width="80" height="35" rx="8" ry="8" fill="url(#capGrad)" stroke="#333" stroke-width="2" filter="url(#shadow)"/>
  
  <!-- Cap Highlight -->
  <rect x="115" y="60" width="70" height="8" rx="4" ry="4" fill="white" opacity="0.6"/>
  
  <!-- Main Label Background -->
  <rect x="85" y="180" width="130" height="90" rx="8" ry="8" fill="white" opacity="0.95" stroke="#ddd" stroke-width="1"/>
  
  <!-- Brand Name -->
  <text x="150" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="11" font-weight="bold" fill="#2c2c2c">${brand.split(' ')[0]}</text>
  <text x="150" y="213" text-anchor="middle" font-family="Georgia, serif" font-size="11" font-weight="bold" fill="#2c2c2c">${brand.split(' ').slice(1).join(' ')}</text>
  
  <!-- Decorative Line -->
  <line x1="95" y1="220" x2="205" y2="220" stroke="#ddd" stroke-width="1"/>
  
  <!-- Perfume Name -->
  <text x="150" y="240" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="500" fill="#444">${name.length > 18 ? name.substring(0, 15) + '...' : name}</text>
  
  <!-- Family Icon -->
  <text x="150" y="260" text-anchor="middle" font-size="18">${icon}</text>
  
  <!-- Bottle Highlights -->
  <ellipse cx="120" cy="160" rx="8" ry="15" fill="white" opacity="0.4"/>
  <circle cx="130" cy="300" r="4" fill="white" opacity="0.3"/>
  
  <!-- Volume and Concentration -->
  <text x="150" y="320" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="500" fill="#555">100ml ${concentration}</text>
  
  <!-- Decorative Bottom Element -->
  <rect x="140" y="330" width="20" height="2" fill="#ddd" opacity="0.8"/>
  
  <!-- Atomizer/Spray (if EDT/EDP) -->
  ${concentration !== 'Parfum' ? `
  <rect x="145" y="48" width="10" height="12" fill="#C0C0C0" stroke="#999" stroke-width="1"/>
  <circle cx="150" cy="45" r="2" fill="#666"/>
  ` : ''}
</svg>`;
};

// Generate all perfume images
const generateAllImages = () => {
  const perfumeImages = generatePerfumeImageData();
  const outputDir = path.join(__dirname, '..', '..', 'frontend', 'public', 'perfume-images');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  console.log(`🧪 Generating ${perfumeImages.length} perfume bottle images...`);
  console.log(`📁 Output directory: ${outputDir}`);
  
  let successCount = 0;
  const familyStats = {};
  
  perfumeImages.forEach(perfumeData => {
    try {
      const svgContent = generateBottleSVG(perfumeData);
      const filePath = path.join(outputDir, perfumeData.filename);
      
      fs.writeFileSync(filePath, svgContent);
      
      // Update family stats
      if (!familyStats[perfumeData.family]) {
        familyStats[perfumeData.family] = 0;
      }
      familyStats[perfumeData.family]++;
      
      console.log(`✅ Generated: ${perfumeData.filename} (${perfumeData.family})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to generate ${perfumeData.filename}:`, error.message);
    }
  });
  
  console.log('\n📊 Generation Summary:');
  console.log(`✅ Successfully generated: ${successCount}/${perfumeImages.length} images`);
  console.log('\n🏷️ By Scent Family:');
  Object.entries(familyStats).forEach(([family, count]) => {
    console.log(`   ${scentFamilyStyles[family]?.icon || '🌺'} ${family}: ${count} bottles`);
  });
  
  console.log('\n🎉 Perfume bottle image generation complete!');
  
  return { successCount, totalCount: perfumeImages.length, familyStats };
};

// Run the generation if this script is executed directly
if (require.main === module) {
  generateAllImages();
}

module.exports = { generateAllImages, generatePerfumeImageData };