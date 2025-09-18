const fs = require('fs');
const path = require('path');

// Fix the remaining seasons issues
function fixSeasons() {
  const filePath = path.join(__dirname, '..', 'data', 'realPerfumeData.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all remaining seasons: ["casual"] with seasons: ["summer"]
  content = content.replace(/seasons: \["casual"\]/g, 'seasons: ["summer"]');
  
  // Fix any other invalid seasons values that might have been introduced
  content = content.replace(/seasons: \["evening"\]/g, 'seasons: ["winter"]');
  content = content.replace(/seasons: \["daily"\]/g, 'seasons: ["spring", "summer"]');
  content = content.replace(/seasons: \["all seasons"\]/g, 'seasons: ["spring", "summer", "autumn", "winter"]');

  // Fix duplicate occasions
  content = content.replace(/occasions: \["casual", "casual", "casual"\]/g, 'occasions: ["casual"]');
  content = content.replace(/occasions: \["sport", "casual", "sport"\]/g, 'occasions: ["sport", "casual"]');
  content = content.replace(/occasions: \["casual", "party", "casual"\]/g, 'occasions: ["casual", "party"]');

  // Write back
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed seasons and duplicate occasions');
}

if (require.main === module) {
  fixSeasons();
}

module.exports = { fixSeasons };