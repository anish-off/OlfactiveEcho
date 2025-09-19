// data/realPerfumeData.js
const fs = require('fs').promises;
const path = require('path');

// Path to combined_perfumes.json
const perfumesFilePath = path.join(__dirname, '..', 'combined_perfumes.json');

// Function to load perfume data from JSON file
async function loadPerfumeData() {
  try {
    const data = await fs.readFile(perfumesFilePath, 'utf8');
    const perfumes = JSON.parse(data);
    return perfumes;
  } catch (error) {
    console.error('Error loading perfume data:', error);
    return []; // Return empty array on error to prevent crashes
  }
}
module.exports = realPerfumeData;
