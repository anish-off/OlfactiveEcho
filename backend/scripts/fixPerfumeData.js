const fs = require('fs');
const path = require('path');

// Fix perfume data to match model enum values
function fixPerfumeData() {
  const filePath = path.join(__dirname, '..', 'data', 'realPerfumeData.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix longevity values
  const longevityMap = {
    '5-7 hours': '6-8 hours',
    '7-9 hours': '6-8 hours',
    '9+ hours': '8+ hours',
    '10+ hours': '8+ hours',
    '12+ hours': '8+ hours'
  };

  // Fix longevity
  Object.entries(longevityMap).forEach(([invalid, valid]) => {
    const regex = new RegExp(`longevity: "${invalid}"`, 'g');
    content = content.replace(regex, `longevity: "${valid}"`);
  });

  // Fix occasions more precisely using word boundaries and context
  const occasionReplacements = [
    { from: /occasions: \[(.*?)"summer"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"casual"${after.replace(/^\s*,/, '')}]`;
    }},
    { from: /occasions: \[(.*?)"winter"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"evening"${after.replace(/^\s*,/, '')}]`;
    }},
    { from: /occasions: \[(.*?)"vacation"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"casual"${after.replace(/^\s*,/, '')}]`;
    }},
    { from: /occasions: \[(.*?)"cozy"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"evening"${after.replace(/^\s*,/, '')}]`;
    }},
    { from: /occasions: \[(.*?)"clean"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"daily"${after.replace(/^\s*,/, '')}]`;
    }},
    { from: /occasions: \[(.*?)"energizing"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"sport"${after.replace(/^\s*,/, '')}]`;
    }},
    { from: /occasions: \[(.*?)"meditation"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"casual"${after.replace(/^\s*,/, '')}]`;
    }},
    { from: /occasions: \[(.*?)"spa"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"casual"${after.replace(/^\s*,/, '')}]`;
    }},
    { from: /occasions: \[(.*?)"luxury"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"formal"${after.replace(/^\s*,/, '')}]`;
    }},
    { from: /occasions: \[(.*?)"special"(.*?)\]/g, replace: (match, before, after) => {
      return `occasions: [${before.replace(/,\s*$/, '')}"formal"${after.replace(/^\s*,/, '')}]`;
    }}
  ];

  // Apply occasion replacements
  occasionReplacements.forEach(({ from, replace }) => {
    content = content.replace(from, replace);
  });

  // Fix remaining invalid occasions with simple replacements in occasions arrays only
  const simpleOccasionFixes = {
    '"gala"': '"formal"',
    '"beach"': '"casual"',
    '"fun"': '"party"',
    '"tropical"': '"casual"',
    '"urban"': '"office"',
    '"modern"': '"daily"',
    '"nightlife"': '"party"',
    '"electric"': '"party"',
    '"vintage"': '"formal"',
    '"sophisticated"': '"formal"',
    '"classic"': '"formal"',
    '"fireplace"': '"evening"',
    '"rain"': '"casual"',
    '"natural"': '"casual"',
    '"garden"': '"casual"',
    '"fresh"': '"daily"',
    '"aquatic"': '"sport"',
    '"ocean"': '"casual"',
    '"deep"': '"evening"',
    '"gothic"': '"evening"',
    '"mysterious"': '"evening"',
    '"masculine"': '"office"',
    '"everyday"': '"daily"',
    '"spiritual"': '"evening"'
  };

  // Only replace these in occasions context
  Object.entries(simpleOccasionFixes).forEach(([invalid, valid]) => {
    const regex = new RegExp(`(occasions: \\[[^\\]]*?)${invalid.replace(/"/g, '\\"')}([^\\]]*?\\])`, 'g');
    content = content.replace(regex, `$1${valid}$2`);
  });

  // Fix seasons that got accidentally changed
  content = content.replace(/seasons: \["casual"\]/g, 'seasons: ["summer"]');
  content = content.replace(/seasons: \["evening"\]/g, 'seasons: ["winter"]');
  content = content.replace(/seasons: \["daily"\]/g, 'seasons: ["spring", "summer"]');

  // Write the fixed content back
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed perfume data enum values');
}

if (require.main === module) {
  fixPerfumeData();
}

module.exports = { fixPerfumeData };