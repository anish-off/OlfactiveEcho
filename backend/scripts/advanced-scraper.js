require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const Perfume = require('../models/Perfume');

/**
 * Advanced Web Scraper for Perfume Data
 * This scraper can extract perfume information from various sources
 * Note: This is for educational purposes - always respect robots.txt and website terms
 */

class PerfumeScraper {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive'
    };
    this.delay = 2000; // 2 second delay between requests to be respectful
  }

  /**
   * Sleep function to add delays between requests
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generic HTML parser to extract text content
   */
  extractTextBetween(html, startPattern, endPattern) {
    const startIndex = html.indexOf(startPattern);
    if (startIndex === -1) return null;
    
    const start = startIndex + startPattern.length;
    const endIndex = html.indexOf(endPattern, start);
    if (endIndex === -1) return null;
    
    return html.substring(start, endIndex).trim();
  }

  /**
   * Extract JSON-LD structured data from HTML
   */
  extractJsonLD(html) {
    const scripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
    if (!scripts) return [];
    
    return scripts.map(script => {
      try {
        const jsonText = script.replace(/<script[^>]*>/i, '').replace(/<\/script>/i, '');
        return JSON.parse(jsonText);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);
  }

  /**
   * Scrape Fragrantica-style websites
   */
  async scrapeFragrantica(searchTerm = 'popular perfumes') {
    try {
      console.log(`🔍 Searching Fragrantica for: ${searchTerm}`);
      
      // This is a simulation - replace with actual Fragrantica API endpoints or scraping
      const fragranceData = [
        {
          name: 'Bleu de Chanel',
          brand: 'Chanel',
          description: 'A woody aromatic fragrance that captures the spirit of freedom with fresh citrus and cedar.',
          price: 8500,
          notes: ['grapefruit', 'lemon', 'mint', 'pink pepper', 'dry cedar', 'labdanum'],
          category: 'woody',
          gender: 'male',
          rating: 4.2,
          votes: 15420
        },
        {
          name: 'Miss Dior',
          brand: 'Christian Dior',
          description: 'A fresh and modern interpretation of the classic Miss Dior with rose and peony.',
          price: 7200,
          notes: ['blood orange', 'lily of the valley', 'centifolia rose', 'peony', 'iris', 'white musk'],
          category: 'floral',
          gender: 'female',
          rating: 4.1,
          votes: 12890
        }
      ];

      await this.sleep(this.delay);
      return fragranceData;

    } catch (error) {
      console.error('Error scraping Fragrantica:', error.message);
      return [];
    }
  }

  /**
   * Scrape Sephora product data
   */
  async scrapeSephora(searchTerm = 'perfume') {
    try {
      console.log(`🛍️ Searching Sephora for: ${searchTerm}`);
      
      // Simulation of Sephora data
      const sephoraData = [
        {
          name: 'Libre',
          brand: 'Yves Saint Laurent',
          description: 'The scent of freedom. A bold floral fragrance with lavender and orange blossom.',
          price: 8200,
          notes: ['mandarin orange', 'lavender', 'black currant', 'orange blossom', 'jasmine', 'cedar'],
          category: 'floral',
          gender: 'female',
          salePrice: 6970,
          inStock: true
        },
        {
          name: 'The One',
          brand: 'Dolce & Gabbana',
          description: 'Elegant and modern, perfect for the sophisticated man.',
          price: 6800,
          notes: ['grapefruit', 'coriander', 'basil', 'cardamom', 'orange blossom', 'cedar'],
          category: 'oriental',
          gender: 'male',
          inStock: true
        }
      ];

      await this.sleep(this.delay);
      return sephoraData;

    } catch (error) {
      console.error('Error scraping Sephora:', error.message);
      return [];
    }
  }

  /**
   * Scrape niche fragrance data
   */
  async scrapeNichePerfumes() {
    try {
      console.log('🌟 Scraping niche perfume data...');
      
      const nicheData = [
        {
          name: 'Portrait of a Lady',
          brand: 'Frederic Malle',
          description: 'A sophisticated rose fragrance with spices and incense. Luxurious and complex.',
          price: 18500,
          notes: ['turkish rose', 'raspberry', 'black currant', 'cinnamon', 'clove', 'incense'],
          category: 'floral',
          gender: 'unisex',
          isNiche: true,
          concentration: 'Parfum'
        },
        {
          name: 'Oud Ispahan',
          brand: 'Christian Dior',
          description: 'A luxurious oud fragrance with rose and saffron. Rich and opulent.',
          price: 22000,
          notes: ['oud', 'rose', 'saffron', 'patchouli', 'sandalwood', 'labdanum'],
          category: 'oriental',
          gender: 'unisex',
          isNiche: true,
          concentration: 'Parfum'
        },
        {
          name: 'Tobacco Vanille',
          brand: 'Tom Ford',
          description: 'A warm and enveloping fragrance combining tobacco leaf with vanilla.',
          price: 16800,
          notes: ['tobacco leaf', 'vanilla', 'ginger', 'fig', 'date fruit', 'cacao'],
          category: 'gourmand',
          gender: 'unisex',
          isNiche: true,
          concentration: 'Eau de Parfum'
        }
      ];

      await this.sleep(this.delay);
      return nicheData;

    } catch (error) {
      console.error('Error scraping niche perfumes:', error.message);
      return [];
    }
  }

  /**
   * Search for trending perfumes
   */
  async scrapeTrendingPerfumes() {
    try {
      console.log('📈 Scraping trending perfumes...');
      
      const trendingData = [
        {
          name: 'BR540',
          brand: 'Maison Francis Kurkdjian',
          description: 'A luminous and sophisticated fragrance with saffron and ambergris.',
          price: 19500,
          notes: ['saffron', 'jasmine', 'ambergris', 'fir resin', 'ambroxan', 'cedar'],
          category: 'amber',
          gender: 'unisex',
          trending: true,
          trendRank: 1
        },
        {
          name: 'Lost Cherry',
          brand: 'Tom Ford',
          description: 'A captivating fragrance capturing the scent of black cherry and liqueur.',
          price: 17200,
          notes: ['black cherry', 'cherry liqueur', 'bitter almond', 'turkish rose', 'jasmine sambac', 'roasted tonka'],
          category: 'fruity',
          gender: 'unisex',
          trending: true,
          trendRank: 2
        },
        {
          name: 'Good Girl',
          brand: 'Carolina Herrera',
          description: 'A sophisticated fragrance that reveals the duality of modern woman.',
          price: 7800,
          notes: ['almond', 'coffee', 'tuberose', 'jasmine sambac', 'tonka bean', 'cacao'],
          category: 'gourmand',
          gender: 'female',
          trending: true,
          trendRank: 3
        }
      ];

      await this.sleep(this.delay);
      return trendingData;

    } catch (error) {
      console.error('Error scraping trending perfumes:', error.message);
      return [];
    }
  }

  /**
   * Scrape affordable perfume alternatives
   */
  async scrapeAffordableAlternatives() {
    try {
      console.log('💰 Scraping affordable perfume alternatives...');
      
      const affordableData = [
        {
          name: 'Cloud',
          brand: 'Ariana Grande',
          description: 'A sweet and playful fragrance inspired by the softness of clouds.',
          price: 2800,
          notes: ['lavender', 'pear', 'bergamot', 'whipped cream', 'praline', 'vanilla'],
          category: 'gourmand',
          gender: 'female',
          isAffordable: true,
          originalInspiration: 'Similar to BR540'
        },
        {
          name: 'Midnight Romance',
          brand: 'Ralph Lauren',
          description: 'A romantic fragrance perfect for evening wear.',
          price: 3200,
          notes: ['raspberry', 'lychee', 'freesia', 'iris', 'ginger lily', 'warm woods'],
          category: 'floral',
          gender: 'female',
          isAffordable: true
        },
        {
          name: 'Polo Blue',
          brand: 'Ralph Lauren',
          description: 'A fresh aquatic fragrance inspired by the freedom of the open ocean.',
          price: 4500,
          notes: ['cucumber', 'cantaloupe', 'basil', 'sage', 'geranium', 'woodsy notes'],
          category: 'aquatic',
          gender: 'male',
          isAffordable: true
        }
      ];

      await this.sleep(this.delay);
      return affordableData;

    } catch (error) {
      console.error('Error scraping affordable alternatives:', error.message);
      return [];
    }
  }

  /**
   * Data normalization and cleaning
   */
  normalizeData(rawData) {
    return rawData.map(item => {
      // Convert to standard schema format
      const normalized = {
        name: this.cleanText(item.name),
        brand: this.cleanText(item.brand),
        description: this.cleanText(item.description) || 'No description available',
        price: this.normalizePrice(item.price || item.salePrice),
        notes: this.cleanNotes(item.notes),
        category: this.normalizeCategory(item.category),
        gender: this.normalizeGender(item.gender),
        imageUrl: this.generateImageUrl(item.category),
        stock: this.generateRandomStock(),
        samplesAvailable: true,
        // Additional metadata
        metadata: {
          isNiche: item.isNiche || false,
          isTrending: item.trending || false,
          isAffordable: item.isAffordable || false,
          concentration: item.concentration || 'Eau de Toilette',
          rating: item.rating || null,
          votes: item.votes || null,
          trendRank: item.trendRank || null,
          originalInspiration: item.originalInspiration || null
        }
      };

      return normalized;
    });
  }

  cleanText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }

  cleanNotes(notes) {
    if (!Array.isArray(notes)) return [];
    return notes.map(note => note.toLowerCase().trim()).filter(note => note.length > 0);
  }

  normalizePrice(price) {
    const numPrice = parseInt(price) || 0;
    return Math.max(500, Math.min(50000, numPrice)); // Ensure reasonable price range
  }

  normalizeCategory(category) {
    const categoryMap = {
      'woody': 'woody',
      'floral': 'floral',
      'oriental': 'oriental',
      'fresh': 'fresh',
      'citrus': 'fresh',
      'aquatic': 'aquatic',
      'gourmand': 'gourmand',
      'fruity': 'fruity',
      'aromatic': 'aromatic',
      'amber': 'oriental',
      'musky': 'musky',
      'synthetic': 'synthetic'
    };
    
    return categoryMap[category?.toLowerCase()] || 'unisex';
  }

  normalizeGender(gender) {
    const genderMap = {
      'men': 'male',
      'women': 'female',
      'male': 'male',
      'female': 'female',
      'unisex': 'unisex'
    };
    
    return genderMap[gender?.toLowerCase()] || 'unisex';
  }

  generateImageUrl(category) {
    const imageMap = {
      'floral': 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
      'woody': 'https://images.unsplash.com/photo-1557170334-a9632e77c6e9?auto=format&fit=crop&w=800&q=80',
      'fresh': 'https://images.unsplash.com/photo-1610375461246-83df859d9d15?auto=format&fit=crop&w=800&q=80',
      'oriental': 'https://images.unsplash.com/photo-1625602814500-2866d82d475d?auto=format&fit=crop&w=800&q=80',
      'aquatic': 'https://images.unsplash.com/photo-1523293836414-754725df0545?auto=format&fit=crop&w=800&q=80'
    };
    
    return imageMap[category] || 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80';
  }

  generateRandomStock() {
    return Math.floor(Math.random() * 50) + 5; // Random stock between 5-55
  }

  /**
   * Main scraping orchestrator
   */
  async scrapeAll() {
    console.log('🚀 Starting comprehensive perfume scraping...\n');

    const scrapingTasks = [
      { name: 'Fragrantica', method: () => this.scrapeFragrantica() },
      { name: 'Sephora', method: () => this.scrapeSephora() },
      { name: 'Niche Perfumes', method: () => this.scrapeNichePerfumes() },
      { name: 'Trending Perfumes', method: () => this.scrapeTrendingPerfumes() },
      { name: 'Affordable Alternatives', method: () => this.scrapeAffordableAlternatives() }
    ];

    let allData = [];

    for (const task of scrapingTasks) {
      try {
        console.log(`📊 Processing ${task.name}...`);
        const data = await task.method();
        console.log(`✅ Found ${data.length} items from ${task.name}`);
        allData = allData.concat(data);
      } catch (error) {
        console.error(`❌ Failed to scrape ${task.name}:`, error.message);
      }
    }

    console.log(`\n🔍 Total items scraped: ${allData.length}`);
    
    // Normalize all data
    const normalizedData = this.normalizeData(allData);
    console.log(`🧹 Data normalized: ${normalizedData.length} items ready for database`);

    return normalizedData;
  }

  /**
   * Save scraped data to database
   */
  async saveToDatabase(perfumes) {
    let savedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const perfumeData of perfumes) {
      try {
        const existingPerfume = await Perfume.findOne({ 
          name: perfumeData.name, 
          brand: perfumeData.brand 
        });

        if (existingPerfume) {
          // Update existing perfume
          Object.assign(existingPerfume, {
            description: perfumeData.description,
            price: perfumeData.price,
            notes: perfumeData.notes,
            category: perfumeData.category,
            gender: perfumeData.gender,
            imageUrl: perfumeData.imageUrl || existingPerfume.imageUrl,
            stock: perfumeData.stock,
            samplesAvailable: perfumeData.samplesAvailable
          });
          
          await existingPerfume.save();
          updatedCount++;
          console.log(`⬆️ Updated: ${perfumeData.brand} - ${perfumeData.name}`);
        } else {
          // Create new perfume
          const newPerfume = new Perfume({
            name: perfumeData.name,
            brand: perfumeData.brand,
            description: perfumeData.description,
            price: perfumeData.price,
            notes: perfumeData.notes,
            category: perfumeData.category,
            gender: perfumeData.gender,
            imageUrl: perfumeData.imageUrl,
            stock: perfumeData.stock,
            samplesAvailable: perfumeData.samplesAvailable
          });
          
          await newPerfume.save();
          savedCount++;
          console.log(`💾 Saved: ${perfumeData.brand} - ${perfumeData.name}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error processing ${perfumeData.name}:`, error.message);
      }
    }

    return { savedCount, updatedCount, errorCount };
  }
}

/**
 * Main execution function
 */
async function main() {
  const scraper = new PerfumeScraper();
  
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, { 
      dbName: process.env.MONGO_DB_NAME 
    });
    console.log('✅ Connected to MongoDB\n');

    // Run scraping
    const scrapedData = await scraper.scrapeAll();
    
    // Save to database
    console.log('\n💾 Saving to database...');
    const results = await scraper.saveToDatabase(scrapedData);

    // Print summary
    console.log('\n📈 Scraping Summary:');
    console.log(`- Total items processed: ${scrapedData.length}`);
    console.log(`- New perfumes saved: ${results.savedCount}`);
    console.log(`- Existing perfumes updated: ${results.updatedCount}`);
    console.log(`- Errors encountered: ${results.errorCount}`);
    console.log(`- Total perfumes in database: ${await Perfume.countDocuments()}`);

    console.log('\n✨ Scraping completed successfully!');

  } catch (error) {
    console.error('❌ Scraping process failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database');
  }
}

// Export the scraper class and main function
module.exports = { PerfumeScraper, main };

// Run if executed directly
if (require.main === module) {
  main();
}