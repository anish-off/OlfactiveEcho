const fs = require('fs');
const path = require('path');

function fixSeasonsValidation() {
  const filePath = path.join(__dirname, '..', 'data', 'realPerfumeData.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all instances of "evening" in seasons arrays with "winter"
  content = content.replace(/seasons: \[([^[\]]*)"evening"([^[\]]*)\]/g, (match, before, after) => {
    // Replace evening with winter, but preserve other valid season values
    const beforeFixed = before.replace(/,\s*$/, '');
    const afterFixed = after.replace(/^\s*,/, '');
    
    if (beforeFixed && afterFixed) {
      return `seasons: [${beforeFixed}, "winter"${afterFixed}]`;
    } else if (beforeFixed) {
      return `seasons: [${beforeFixed}, "winter"]`;
    } else if (afterFixed) {
      return `seasons: ["winter"${afterFixed}]`;
    } else {
      return 'seasons: ["winter"]';
    }
  });

  // Also fix any other invalid season values
  content = content.replace(/seasons: \["evening"\]/g, 'seasons: ["winter"]');
  content = content.replace(/seasons: \["autumn", "evening"\]/g, 'seasons: ["autumn", "winter"]');
  content = content.replace(/seasons: \["evening", "autumn"\]/g, 'seasons: ["winter", "autumn"]');

  // Fix any other invalid seasons that might exist
  content = content.replace(/seasons: \[([^[\]]*)"daily"([^[\]]*)\]/g, 'seasons: ["spring", "summer"]');
  content = content.replace(/seasons: \[([^[\]]*)"office"([^[\]]*)\]/g, 'seasons: ["autumn", "winter"]');
  content = content.replace(/seasons: \[([^[\]]*)"formal"([^[\]]*)\]/g, 'seasons: ["autumn", "winter"]');
  content = content.replace(/seasons: \[([^[\]]*)"party"([^[\]]*)\]/g, 'seasons: ["autumn", "winter"]');
  content = content.replace(/seasons: \[([^[\]]*)"romantic"([^[\]]*)\]/g, 'seasons: ["spring", "summer"]');
  content = content.replace(/seasons: \[([^[\]]*)"casual"([^[\]]*)\]/g, 'seasons: ["spring", "summer"]');
  content = content.replace(/seasons: \[([^[\]]*)"sport"([^[\]]*)\]/g, 'seasons: ["summer"]');

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed all seasons validation issues');
}

if (require.main === module) {
  fixSeasonsValidation();
}

module.exports = { fixSeasonsValidation };