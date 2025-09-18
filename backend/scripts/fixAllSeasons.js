const fs = require('fs');
const path = require('path');

function fixAllSeasons() {
  const filePath = path.join(__dirname, '..', 'data', 'realPerfumeData.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all instances of "casual" in seasons arrays with "summer"
  content = content.replace(/seasons: \[([^\]]*)"casual"([^\]]*)\]/g, (match, before, after) => {
    // Replace casual with summer, but preserve other valid season values
    const beforeFixed = before.replace(/,\s*$/, '');
    const afterFixed = after.replace(/^\s*,/, '');
    
    if (beforeFixed && afterFixed) {
      return `seasons: [${beforeFixed}, "summer"${afterFixed}]`;
    } else if (beforeFixed) {
      return `seasons: [${beforeFixed}, "summer"]`;
    } else if (afterFixed) {
      return `seasons: ["summer"${afterFixed}]`;
    } else {
      return 'seasons: ["summer"]';
    }
  });

  // Fix any other common patterns
  content = content.replace(/seasons: \["casual"\]/g, 'seasons: ["summer"]');
  content = content.replace(/seasons: \["casual", "spring"\]/g, 'seasons: ["summer", "spring"]');
  content = content.replace(/seasons: \["spring", "casual"\]/g, 'seasons: ["spring", "summer"]');
  content = content.replace(/seasons: \["casual", "autumn"\]/g, 'seasons: ["summer", "autumn"]');
  content = content.replace(/seasons: \["spring", "casual", "autumn"\]/g, 'seasons: ["spring", "summer", "autumn"]');

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed all seasons references');
}

if (require.main === module) {
  fixAllSeasons();
}

module.exports = { fixAllSeasons };