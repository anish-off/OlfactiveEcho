const fs = require('fs');
const path = require('path');

function fixInvalidOccasions() {
  const filePath = path.join(__dirname, '..', 'data', 'realPerfumeData.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Valid occasions: ['daily', 'office', 'evening', 'party', 'romantic', 'formal', 'casual', 'sport']
  
  // Replace all invalid occasion values
  content = content.replace(/"relaxation"/g, '"casual"');
  content = content.replace(/"elegant"/g, '"formal"');
  content = content.replace(/"timeless"/g, '"formal"');
  content = content.replace(/"progressive"/g, '"office"');
  content = content.replace(/"sophisticated"/g, '"formal"');
  content = content.replace(/"modern"/g, '"office"');
  content = content.replace(/"classic"/g, '"formal"');
  content = content.replace(/"luxurious"/g, '"formal"');
  content = content.replace(/"fresh"/g, '"daily"');
  content = content.replace(/"work"/g, '"office"');
  content = content.replace(/"business"/g, '"office"');
  content = content.replace(/"date"/g, '"romantic"');
  content = content.replace(/"night"/g, '"evening"');
  content = content.replace(/"nightout"/g, '"evening"');
  content = content.replace(/"special"/g, '"evening"');
  content = content.replace(/"celebration"/g, '"party"');
  content = content.replace(/"weekend"/g, '"casual"');
  content = content.replace(/"daytime"/g, '"daily"');
  content = content.replace(/"professional"/g, '"office"');

  // Remove duplicate values in occasions arrays
  const occasionRegex = /occasions: \[([^\]]+)\]/g;
  content = content.replace(occasionRegex, (match, occasionsStr) => {
    // Extract all occasion values
    const occasions = occasionsStr.match(/"[^"]+"/g) || [];
    // Remove duplicates
    const uniqueOccasions = [...new Set(occasions)];
    return `occasions: [${uniqueOccasions.join(', ')}]`;
  });

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed all invalid occasion values and removed duplicates');
}

if (require.main === module) {
  fixInvalidOccasions();
}

module.exports = { fixInvalidOccasions };