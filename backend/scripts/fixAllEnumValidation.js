const fs = require('fs');
const path = require('path');

function fixAllEnumValidation() {
  const filePath = path.join(__dirname, '..', 'data', 'realPerfumeData.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix scentFamily values - replace "daily" and other invalid values with appropriate scent families
  content = content.replace(/scentFamily: "daily"/g, 'scentFamily: "fresh"');
  content = content.replace(/scentFamily: "office"/g, 'scentFamily: "woody"');
  content = content.replace(/scentFamily: "evening"/g, 'scentFamily: "oriental"');
  content = content.replace(/scentFamily: "party"/g, 'scentFamily: "oriental"');
  content = content.replace(/scentFamily: "romantic"/g, 'scentFamily: "floral"');
  content = content.replace(/scentFamily: "formal"/g, 'scentFamily: "woody"');
  content = content.replace(/scentFamily: "casual"/g, 'scentFamily: "fresh"');
  content = content.replace(/scentFamily: "sport"/g, 'scentFamily: "fresh"');

  // Fix occasions values - replace invalid season values with proper occasions
  content = content.replace(/occasions: \[([^[\]]*)"spring"([^[\]]*)\]/g, 'occasions: ["daily", "casual"]');
  content = content.replace(/occasions: \[([^[\]]*)"summer"([^[\]]*)\]/g, 'occasions: ["daily", "casual", "sport"]');
  content = content.replace(/occasions: \[([^[\]]*)"autumn"([^[\]]*)\]/g, 'occasions: ["daily", "office"]');
  content = content.replace(/occasions: \[([^[\]]*)"winter"([^[\]]*)\]/g, 'occasions: ["daily", "office", "formal"]');

  // Fix seasons values - replace any occasion values with proper seasons
  content = content.replace(/seasons: \[([^[\]]*)"daily"([^[\]]*)\]/g, 'seasons: ["spring", "summer"]');
  content = content.replace(/seasons: \[([^[\]]*)"office"([^[\]]*)\]/g, 'seasons: ["autumn", "winter"]');
  content = content.replace(/seasons: \[([^[\]]*)"party"([^[\]]*)\]/g, 'seasons: ["autumn", "winter"]');
  content = content.replace(/seasons: \[([^[\]]*)"romantic"([^[\]]*)\]/g, 'seasons: ["spring", "summer"]');
  content = content.replace(/seasons: \[([^[\]]*)"formal"([^[\]]*)\]/g, 'seasons: ["autumn", "winter"]');
  content = content.replace(/seasons: \[([^[\]]*)"casual"([^[\]]*)\]/g, 'seasons: ["spring", "summer"]');
  content = content.replace(/seasons: \[([^[\]]*)"sport"([^[\]]*)\]/g, 'seasons: ["summer"]');

  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed all enum validation issues (scentFamily, occasions, seasons)');
}

if (require.main === module) {
  fixAllEnumValidation();
}

module.exports = { fixAllEnumValidation };