// Real perfume collection data for OlfactiveEcho
const realPerfumeData = [
  // CITRUS FAMILY
  {
    name: "Citrus Burst",
    brand: "Olfactive Echo",
    description: "A vibrant burst of fresh citrus that energizes your day. Perfect for those who love clean, crisp scents.",
    price: 2400,
    notes: {
      top: ["lemon", "bergamot", "grapefruit"],
      middle: ["neroli", "petitgrain"],
      base: ["white musk", "cedar"]
    },
    scentFamily: "citrus",
    gender: "unisex",
    intensity: "light",
    longevity: "4-6 hours",
    sillage: "moderate",
    occasions: ["daily", "office", "casual"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/citrus-burst.jpg",
    stock: 25,
    rating: 4.2,
    reviewCount: 48,
    volume: 100,
    concentration: "EDT"
  },
  {
    name: "Mediterranean Breeze",
    brand: "Olfactive Echo",
    description: "Escape to the Mediterranean coast with this refreshing blend of sea breeze and zesty citrus.",
    price: 2800,
    notes: {
      top: ["lime", "sea salt", "mint"],
      middle: ["rosemary", "lavender"],
      base: ["driftwood", "ambergris"]
    },
    scentFamily: "citrus",
    gender: "unisex",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["daily", "casual", "sport"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/mediterranean-breeze.jpg",
    stock: 18,
    rating: 4.5,
    reviewCount: 72,
    isPopular: true,
    volume: 100,
    concentration: "EDT"
  },

  // FLORAL FAMILY
  {
    name: "Rose Garden Dreams",
    brand: "Olfactive Echo",
    description: "An enchanting journey through a blooming rose garden at dawn, with delicate petals kissed by morning dew.",
    price: 3200,
    notes: {
      top: ["pink grapefruit", "green leaves"],
      middle: ["damascus rose", "peony", "lily of the valley"],
      base: ["white musk", "cedarwood", "soft amber"]
    },
    scentFamily: "floral",
    gender: "female",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["romantic", "evening", "formal"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/rose-garden-dreams.jpg",
    stock: 22,
    rating: 4.7,
    reviewCount: 156,
    isPopular: true,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Jasmine Nights",
    brand: "Olfactive Echo",
    description: "Intoxicating jasmine blooms under a starlit sky, creating an aura of mystery and romance.",
    price: 3600,
    notes: {
      top: ["mandarin", "black currant"],
      middle: ["jasmine sambac", "tuberose", "ylang-ylang"],
      base: ["sandalwood", "vanilla", "musk"]
    },
    scentFamily: "floral",
    gender: "female",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["evening", "party", "romantic"],
    seasons: ["summer", "autumn"],
    imageUrl: "/perfume-images/jasmine-nights.jpg",
    stock: 15,
    rating: 4.6,
    reviewCount: 89,
    volume: 100,
    concentration: "EDP"
  },

  // WOODY FAMILY
  {
    name: "Sandalwood Serenity",
    brand: "Olfactive Echo",
    description: "Find your inner peace with this calming blend of creamy sandalwood and warm spices.",
    price: 4200,
    notes: {
      top: ["cardamom", "pink pepper"],
      middle: ["sandalwood", "iris", "violet"],
      base: ["amber", "tonka bean", "white musk"]
    },
    scentFamily: "woody",
    gender: "unisex",
    intensity: "moderate",
    longevity: "8+ hours",
    sillage: "moderate",
    occasions: ["office", "formal", "evening"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/sandalwood-serenity.jpg",
    stock: 30,
    rating: 4.4,
    reviewCount: 123,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Forest Path",
    brand: "Olfactive Echo",
    description: "Walk through an ancient forest with this earthy, grounding fragrance that connects you to nature.",
    price: 3800,
    notes: {
      top: ["juniper", "grapefruit", "elemi"],
      middle: ["vetiver", "cedar", "cypress"],
      base: ["oakmoss", "patchouli", "ambergris"]
    },
    scentFamily: "woody",
    gender: "male",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["casual", "office", "evening"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/forest-path.jpg",
    stock: 20,
    rating: 4.3,
    reviewCount: 67,
    volume: 100,
    concentration: "EDT"
  },

  // ORIENTAL FAMILY
  {
    name: "Mystic Oud",
    brand: "Olfactive Echo",
    description: "Immerse yourself in the mystical world of oud, enhanced with precious saffron and exotic spices.",
    price: 5500,
    notes: {
      top: ["saffron", "nutmeg", "cinnamon"],
      middle: ["oud", "bulgarian rose", "geranium"],
      base: ["agarwood", "amber", "leather"]
    },
    scentFamily: "oriental",
    gender: "unisex",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "enormous",
    occasions: ["evening", "formal", "party"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/mystic-oud.jpg",
    stock: 12,
    rating: 4.8,
    reviewCount: 94,
    isPopular: true,
    volume: 100,
    concentration: "Parfum"
  },
  {
    name: "Amber Nights",
    brand: "Olfactive Echo",
    description: "Warm, enveloping amber creates a cocoon of comfort and luxury for those special evenings.",
    price: 4800,
    notes: {
      top: ["orange blossom", "aldehydes"],
      middle: ["amber", "benzoin", "labdanum"],
      base: ["vanilla", "tonka bean", "opoponax"]
    },
    scentFamily: "oriental",
    gender: "unisex",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["evening", "romantic", "formal"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/amber-nights.jpg",
    stock: 16,
    rating: 4.5,
    reviewCount: 78,
    volume: 100,
    concentration: "EDP"
  },

  // FRESH FAMILY
  {
    name: "Ocean Breeze",
    brand: "Olfactive Echo",
    description: "Feel the refreshing ocean breeze with this aquatic masterpiece that captures the essence of the sea.",
    price: 2600,
    notes: {
      top: ["sea spray", "lemon", "mint"],
      middle: ["marine accord", "water lily", "cucumber"],
      base: ["driftwood", "clean musk", "salt"]
    },
    scentFamily: "fresh",
    gender: "unisex",
    intensity: "light",
    longevity: "4-6 hours",
    sillage: "moderate",
    occasions: ["daily", "sport", "casual"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/ocean-breeze.jpg",
    stock: 35,
    rating: 4.1,
    reviewCount: 145,
    volume: 100,
    concentration: "EDT"
  },
  {
    name: "Alpine Fresh",
    brand: "Olfactive Echo",
    description: "Breathe in the crisp mountain air with this invigorating blend of alpine herbs and clean minerals.",
    price: 2900,
    notes: {
      top: ["eucalyptus", "pine", "bergamot"],
      middle: ["lavender", "mint", "sage"],
      base: ["clean musk", "amberwood", "mineral accord"]
    },
    scentFamily: "fresh",
    gender: "unisex",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["daily", "office", "sport"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/alpine-fresh.jpg",
    stock: 28,
    rating: 4.3,
    reviewCount: 89,
    volume: 100,
    concentration: "EDT"
  },

  // GOURMAND FAMILY
  {
    name: "Vanilla Dreams",
    brand: "Olfactive Echo",
    description: "Indulge in the sweetest dreams with this creamy vanilla blend that wraps you in warmth and comfort.",
    price: 3400,
    notes: {
      top: ["caramel", "cinnamon"],
      middle: ["madagascar vanilla", "tonka bean"],
      base: ["sandalwood", "benzoin", "white musk"]
    },
    scentFamily: "gourmand",
    gender: "female",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["evening", "romantic", "casual"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/vanilla-dreams.jpg",
    stock: 24,
    rating: 4.6,
    reviewCount: 167,
    isPopular: true,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Chocolate Temptation",
    brand: "Olfactive Echo",
    description: "Surrender to temptation with this decadent chocolate fragrance that's impossible to resist.",
    price: 3800,
    notes: {
      top: ["dark chocolate", "orange peel"],
      middle: ["coffee", "hazelnut", "cacao"],
      base: ["vanilla", "praline", "warm spices"]
    },
    scentFamily: "gourmand",
    gender: "unisex",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["evening", "party", "romantic"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/chocolate-temptation.jpg",
    stock: 19,
    rating: 4.4,
    reviewCount: 102,
    volume: 100,
    concentration: "EDP"
  },

  // ADDITIONAL PREMIUM COLLECTION
  {
    name: "Royal Saffron",
    brand: "Olfactive Echo Premium",
    description: "A regal composition featuring the world's most precious spice, saffron, in perfect harmony.",
    price: 6200,
    notes: {
      top: ["saffron", "cardamom", "bergamot"],
      middle: ["turkish rose", "jasmine", "nutmeg"],
      base: ["agarwood", "amber", "white musk"]
    },
    scentFamily: "oriental",
    gender: "unisex",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["formal", "evening", "party"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/royal-saffron.jpg",
    stock: 8,
    rating: 4.9,
    reviewCount: 34,
    isNew: true,
    volume: 100,
    concentration: "Parfum"
  },
  {
    name: "Eternal Spring",
    brand: "Olfactive Echo",
    description: "Capture the eternal beauty of spring with this delicate bouquet of the season's finest blooms.",
    price: 3100,
    notes: {
      top: ["green mandarin", "pink pepper"],
      middle: ["peony", "freesia", "magnolia"],
      base: ["white tea", "clean musk", "blonde woods"]
    },
    scentFamily: "floral",
    gender: "female",
    intensity: "light",
    longevity: "4-6 hours",
    sillage: "intimate",
    occasions: ["daily", "office", "casual"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/eternal-spring.jpg",
    stock: 32,
    rating: 4.2,
    reviewCount: 76,
    volume: 100,
    concentration: "EDT"
  },

  // EXPANDED CITRUS COLLECTION
  {
    name: "Sicilian Sunset",
    brand: "Olfactive Echo",
    description: "Capture the golden hour in Sicily with blood orange and Mediterranean herbs under a sunset sky.",
    price: 2700,
    notes: {
      top: ["blood orange", "mandarin", "lemon zest"],
      middle: ["orange blossom", "thyme", "rosemary"],
      base: ["amber", "cedar", "sea salt"]
    },
    scentFamily: "citrus",
    gender: "unisex",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["daily", "casual", "sport"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/sicilian-sunset.jpg",
    stock: 23,
    rating: 4.3,
    reviewCount: 85,
    volume: 100,
    concentration: "EDT"
  },
  {
    name: "Yuzu Morning",
    brand: "Olfactive Echo",
    description: "A zen-inspired blend featuring Japanese yuzu citrus with green tea and bamboo notes.",
    price: 3100,
    notes: {
      top: ["yuzu", "green mandarin", "shiso leaf"],
      middle: ["green tea", "bamboo", "ginger"],
      base: ["hinoki wood", "white musk", "mineral water"]
    },
    scentFamily: "citrus",
    gender: "unisex",
    intensity: "light",
    longevity: "4-6 hours",
    sillage: "intimate",
    occasions: ["daily", "casual", "office"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/yuzu-morning.jpg",
    stock: 31,
    rating: 4.5,
    reviewCount: 92,
    volume: 100,
    concentration: "EDT"
  },
  {
    name: "Amalfi Escape",
    brand: "Olfactive Echo Premium",
    description: "Escape to the Italian coast with this sophisticated blend of Amalfi lemon and coastal herbs.",
    price: 4200,
    notes: {
      top: ["amalfi lemon", "pink grapefruit", "sea breeze"],
      middle: ["tarragon", "fig leaves", "marine accord"],
      base: ["driftwood", "white amber", "musk"]
    },
    scentFamily: "citrus",
    gender: "unisex",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["casual", "evening", "romantic"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/amalfi-escape.jpg",
    stock: 18,
    rating: 4.6,
    reviewCount: 67,
    isPopular: true,
    volume: 100,
    concentration: "EDP"
  },

  // EXPANDED FLORAL COLLECTION
  {
    name: "Moonlight Gardenia",
    brand: "Olfactive Echo",
    description: "Intoxicating gardenia petals bloom under moonlight, creating an ethereal and romantic aura.",
    price: 3500,
    notes: {
      top: ["bergamot", "green leaves", "dew drops"],
      middle: ["gardenia", "white lily", "magnolia"],
      base: ["sandalwood", "white musk", "moonstone accord"]
    },
    scentFamily: "floral",
    gender: "female",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["romantic", "evening", "formal"],
    seasons: ["spring", "summer", "autumn"],
    imageUrl: "/perfume-images/moonlight-gardenia.jpg",
    stock: 19,
    rating: 4.7,
    reviewCount: 134,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Lavender Fields",
    brand: "Olfactive Echo",
    description: "Walk through endless lavender fields in Provence with this calming and aromatic masterpiece.",
    price: 2900,
    notes: {
      top: ["french lavender", "bergamot", "lemon"],
      middle: ["lavender honey", "geranium", "violet leaves"],
      base: ["cedar", "white musk", "dry wood"]
    },
    scentFamily: "floral",
    gender: "unisex",
    intensity: "light",
    longevity: "6-8 hours",
    sillage: "intimate",
    occasions: ["daily", "casual", "office"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/lavender-fields.jpg",
    stock: 27,
    rating: 4.4,
    reviewCount: 156,
    volume: 100,
    concentration: "EDT"
  },
  {
    name: "White Orchid Elegance",
    brand: "Olfactive Echo Premium",
    description: "The rare beauty of white orchids captured in this sophisticated and luxurious fragrance.",
    price: 5200,
    notes: {
      top: ["white orchid", "pink pepper", "mandarin"],
      middle: ["tuberose", "white tea", "lotus"],
      base: ["white sandalwood", "cashmere musk", "blonde woods"]
    },
    scentFamily: "floral",
    gender: "female",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["formal", "evening"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/white-orchid-elegance.jpg",
    stock: 12,
    rating: 4.8,
    reviewCount: 45,
    isNew: true,
    volume: 100,
    concentration: "Parfum"
  },
  {
    name: "Cherry Blossom Dreams",
    brand: "Olfactive Echo",
    description: "Delicate cherry blossoms dance in the spring breeze, capturing the essence of Japanese hanami.",
    price: 3300,
    notes: {
      top: ["cherry blossom", "pink grapefruit", "green leaves"],
      middle: ["sakura petals", "white tea", "lily of the valley"],
      base: ["blonde woods", "soft musk", "rice powder"]
    },
    scentFamily: "floral",
    gender: "female",
    intensity: "light",
    longevity: "4-6 hours",
    sillage: "intimate",
    occasions: ["daily", "casual"],
    seasons: ["spring"],
    imageUrl: "/perfume-images/cherry-blossom-dreams.jpg",
    stock: 25,
    rating: 4.5,
    reviewCount: 88,
    volume: 100,
    concentration: "EDT"
  },

  // EXPANDED WOODY COLLECTION
  {
    name: "Cedarwood Majesty",
    brand: "Olfactive Echo",
    description: "Majestic cedarwood forests inspire this powerful and grounding masculine fragrance.",
    price: 4000,
    notes: {
      top: ["bergamot", "black pepper", "ginger"],
      middle: ["atlas cedarwood", "vetiver", "cypress"],
      base: ["cedar bark", "leather", "amber"]
    },
    scentFamily: "woody",
    gender: "male",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["office", "evening", "formal"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/cedarwood-majesty.jpg",
    stock: 22,
    rating: 4.4,
    reviewCount: 78,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Ebony Sophistication",
    brand: "Olfactive Echo Premium",
    description: "The rare beauty of ebony wood combined with precious spices creates ultimate sophistication.",
    price: 5800,
    notes: {
      top: ["cardamom", "pink pepper", "elemi"],
      middle: ["ebony wood", "iris", "black tea"],
      base: ["oud", "ambergris", "leather"]
    },
    scentFamily: "woody",
    gender: "unisex",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "enormous",
    occasions: ["formal", "evening"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/ebony-sophistication.jpg",
    stock: 8,
    rating: 4.9,
    reviewCount: 28,
    isNew: true,
    volume: 100,
    concentration: "Parfum"
  },
  {
    name: "Bamboo Zen",
    brand: "Olfactive Echo",
    description: "Find inner peace with this minimalist blend of bamboo and green woods.",
    price: 3200,
    notes: {
      top: ["green bamboo", "mint", "lime"],
      middle: ["bamboo leaves", "white tea", "sage"],
      base: ["bamboo wood", "clean musk", "mineral accord"]
    },
    scentFamily: "woody",
    gender: "unisex",
    intensity: "light",
    longevity: "6-8 hours",
    sillage: "intimate",
    occasions: ["casual", "daily"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/bamboo-zen.jpg",
    stock: 34,
    rating: 4.2,
    reviewCount: 112,
    volume: 100,
    concentration: "EDT"
  },

  // EXPANDED ORIENTAL COLLECTION
  {
    name: "Persian Rose Oud",
    brand: "Olfactive Echo Premium",
    description: "A luxurious marriage of Persian roses and ancient oud wood creates an opulent masterpiece.",
    price: 6800,
    notes: {
      top: ["bulgarian rose", "saffron", "bergamot"],
      middle: ["damask rose", "oud", "frankincense"],
      base: ["agarwood", "amber", "musk"]
    },
    scentFamily: "oriental",
    gender: "unisex",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "enormous",
    occasions: ["formal", "evening"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/persian-rose-oud.jpg",
    stock: 6,
    rating: 4.9,
    reviewCount: 19,
    isNew: true,
    volume: 100,
    concentration: "Parfum"
  },
  {
    name: "Spice Market",
    brand: "Olfactive Echo",
    description: "Journey through an exotic spice market with this warm blend of cardamom, cinnamon, and amber.",
    price: 4600,
    notes: {
      top: ["cardamom", "coriander", "pink pepper"],
      middle: ["cinnamon", "clove", "nutmeg"],
      base: ["amber", "vanilla", "sandalwood"]
    },
    scentFamily: "oriental",
    gender: "unisex",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["evening", "party"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/spice-market.jpg",
    stock: 15,
    rating: 4.5,
    reviewCount: 63,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Golden Temple",
    brand: "Olfactive Echo",
    description: "Sacred incense and golden resins create a spiritual and meditative oriental experience.",
    price: 4100,
    notes: {
      top: ["frankincense", "myrrh", "lemon"],
      middle: ["sandalwood", "labdanum", "rose"],
      base: ["benzoin", "vanilla", "cedar"]
    },
    scentFamily: "oriental",
    gender: "unisex",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["casual", "evening"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/golden-temple.jpg",
    stock: 21,
    rating: 4.6,
    reviewCount: 74,
    volume: 100,
    concentration: "EDP"
  },

  // EXPANDED FRESH COLLECTION
  {
    name: "Arctic Mint",
    brand: "Olfactive Echo",
    description: "Experience the crisp freshness of Arctic mint with cooling menthol and ice crystals.",
    price: 2500,
    notes: {
      top: ["peppermint", "spearmint", "eucalyptus"],
      middle: ["mint leaves", "ice crystals", "green tea"],
      base: ["white musk", "cedar", "crystal accord"]
    },
    scentFamily: "fresh",
    gender: "unisex",
    intensity: "light",
    longevity: "2-4 hours",
    sillage: "moderate",
    occasions: ["sport", "casual"],
    seasons: ["summer"],
    imageUrl: "/perfume-images/arctic-mint.jpg",
    stock: 40,
    rating: 4.0,
    reviewCount: 67,
    volume: 100,
    concentration: "EDT"
  },
  {
    name: "Morning Dew",
    brand: "Olfactive Echo",
    description: "Capture the pure essence of morning dew on fresh grass with this clean aquatic blend.",
    price: 2800,
    notes: {
      top: ["water drops", "green leaves", "cucumber"],
      middle: ["lily of the valley", "green grass", "mint"],
      base: ["clean musk", "cedar", "transparent accord"]
    },
    scentFamily: "fresh",
    gender: "unisex",
    intensity: "light",
    longevity: "4-6 hours",
    sillage: "intimate",
    occasions: ["daily", "office"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/morning-dew.jpg",
    stock: 35,
    rating: 4.2,
    reviewCount: 91,
    volume: 100,
    concentration: "EDT"
  },

  // EXPANDED GOURMAND COLLECTION
  {
    name: "Caramel Delight",
    brand: "Olfactive Echo",
    description: "Indulgent salted caramel with creamy vanilla creates an irresistible gourmand masterpiece.",
    price: 3600,
    notes: {
      top: ["salted caramel", "bergamot", "pink pepper"],
      middle: ["vanilla orchid", "toffee", "cream"],
      base: ["sandalwood", "benzoin", "white musk"]
    },
    scentFamily: "gourmand",
    gender: "female",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["evening", "romantic"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/caramel-delight.jpg",
    stock: 26,
    rating: 4.5,
    reviewCount: 143,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Honey Almond",
    brand: "Olfactive Echo",
    description: "Sweet wildflower honey meets toasted almonds in this comforting gourmand embrace.",
    price: 3200,
    notes: {
      top: ["honey", "almond blossom", "lemon"],
      middle: ["toasted almond", "heliotrope", "orange blossom"],
      base: ["vanilla", "sandalwood", "soft musk"]
    },
    scentFamily: "gourmand",
    gender: "female",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["casual", "evening", "daily"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/honey-almond.jpg",
    stock: 29,
    rating: 4.3,
    reviewCount: 87,
    volume: 100,
    concentration: "EDP"
  },

  // NICHE & ARTISAN COLLECTION
  {
    name: "Midnight Tobacco",
    brand: "Olfactive Echo Artisan",
    description: "Dark and mysterious tobacco leaves with rum and leather create a sophisticated evening scent.",
    price: 5200,
    notes: {
      top: ["tobacco leaf", "rum", "black pepper"],
      middle: ["dark tobacco", "honey", "clove"],
      base: ["leather", "vanilla", "patchouli"]
    },
    scentFamily: "oriental",
    gender: "male",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["evening", "formal", "office"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/midnight-tobacco.jpg",
    stock: 14,
    rating: 4.7,
    reviewCount: 52,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Black Currant Noir",
    brand: "Olfactive Echo Artisan",
    description: "Dark and luscious black currants with blackberry and dark chocolate create gothic elegance.",
    price: 4800,
    notes: {
      top: ["black currant", "blackberry", "bergamot"],
      middle: ["dark rose", "violet", "black tea"],
      base: ["dark chocolate", "patchouli", "musk"]
    },
    scentFamily: "gourmand",
    gender: "unisex",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["evening"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/black-currant-noir.jpg",
    stock: 11,
    rating: 4.6,
    reviewCount: 38,
    volume: 100,
    concentration: "EDP"
  },

  // ADDITIONAL LUXURY COLLECTION
  {
    name: "Diamond Dust",
    brand: "Olfactive Echo Luxury",
    description: "Sparkling aldehydes and precious white flowers create this crystalline luxury fragrance.",
    price: 7200,
    notes: {
      top: ["aldehydes", "diamond accord", "pink pepper"],
      middle: ["white lily", "magnolia", "iris"],
      base: ["white sandalwood", "cashmere musk", "crystal accord"]
    },
    scentFamily: "floral",
    gender: "female",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "enormous",
    occasions: ["formal"],
    seasons: ["spring", "summer", "autumn", "winter"],
    imageUrl: "/perfume-images/diamond-dust.jpg",
    stock: 5,
    rating: 4.9,
    reviewCount: 12,
    isNew: true,
    volume: 100,
    concentration: "Parfum"
  },

  // TROPICAL & EXOTIC COLLECTION
  {
    name: "Coconut Paradise",
    brand: "Olfactive Echo",
    description: "Escape to a tropical paradise with creamy coconut and exotic tropical fruits.",
    price: 2900,
    notes: {
      top: ["coconut water", "pineapple", "lime"],
      middle: ["coconut cream", "frangipani", "tiare flower"],
      base: ["sandalwood", "vanilla", "white musk"]
    },
    scentFamily: "gourmand",
    gender: "unisex",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["casual"],
    seasons: ["summer"],
    imageUrl: "/perfume-images/coconut-paradise.jpg",
    stock: 33,
    rating: 4.1,
    reviewCount: 95,
    volume: 100,
    concentration: "EDT"
  },
  {
    name: "Mango Tango",
    brand: "Olfactive Echo",
    description: "Dance with the exotic sweetness of ripe mango and tropical passion fruit.",
    price: 2700,
    notes: {
      top: ["mango", "passion fruit", "mandarin"],
      middle: ["tropical fruits", "orange blossom", "coconut"],
      base: ["white musk", "cedar", "vanilla"]
    },
    scentFamily: "gourmand",
    gender: "unisex",
    intensity: "light",
    longevity: "4-6 hours",
    sillage: "moderate",
    occasions: ["casual", "party"],
    seasons: ["summer"],
    imageUrl: "/perfume-images/mango-tango.jpg",
    stock: 28,
    rating: 4.0,
    reviewCount: 72,
    volume: 100,
    concentration: "EDT"
  },

  // MODERN URBAN COLLECTION
  {
    name: "Urban Steel",
    brand: "Olfactive Echo Modern",
    description: "Contemporary urban masculinity with metallic accords and modern woods.",
    price: 3800,
    notes: {
      top: ["metallic accord", "grapefruit", "black pepper"],
      middle: ["steel accord", "vetiver", "geranium"],
      base: ["modern woods", "graphite", "white musk"]
    },
    scentFamily: "woody",
    gender: "male",
    intensity: "strong",
    longevity: "6-8 hours",
    sillage: "strong",
    occasions: ["office", "daily"],
    seasons: ["spring", "summer", "autumn", "winter"],
    imageUrl: "/perfume-images/urban-steel.jpg",
    stock: 20,
    rating: 4.3,
    reviewCount: 68,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Neon Nights",
    brand: "Olfactive Echo Modern",
    description: "Electric energy of the city nightlife with neon-bright citrus and electric florals.",
    price: 3600,
    notes: {
      top: ["electric lime", "neon grapefruit", "energy accord"],
      middle: ["electric rose", "night blooming jasmine", "ozone"],
      base: ["synthetic musk", "glass accord", "urban woods"]
    },
    scentFamily: "fresh",
    gender: "unisex",
    intensity: "strong",
    longevity: "6-8 hours",
    sillage: "strong",
    occasions: ["party"],
    seasons: ["summer", "spring"],
    imageUrl: "/perfume-images/neon-nights.jpg",
    stock: 17,
    rating: 4.2,
    reviewCount: 84,
    volume: 100,
    concentration: "EDP"
  },

  // VINTAGE INSPIRED COLLECTION
  {
    name: "Vintage Leather",
    brand: "Olfactive Echo Vintage",
    description: "Classic vintage leather with old-world charm and timeless sophistication.",
    price: 4500,
    notes: {
      top: ["vintage leather", "bergamot", "black pepper"],
      middle: ["suede", "iris", "violet"],
      base: ["aged leather", "sandalwood", "amber"]
    },
    scentFamily: "woody",
    gender: "unisex",
    intensity: "strong",
    longevity: "8+ hours",
    sillage: "strong",
    occasions: ["formal"],
    seasons: ["autumn", "winter"],
    imageUrl: "/perfume-images/vintage-leather.jpg",
    stock: 16,
    rating: 4.6,
    reviewCount: 59,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Classic Chypre",
    brand: "Olfactive Echo Vintage",
    description: "A timeless chypre composition with bergamot, rose, and oakmoss in perfect harmony.",
    price: 4200,
    notes: {
      top: ["bergamot", "lemon", "green leaves"],
      middle: ["rose", "jasmine", "geranium"],
      base: ["oakmoss", "patchouli", "labdanum"]
    },
    scentFamily: "floral",
    gender: "female",
    intensity: "moderate",
    longevity: "8+ hours",
    sillage: "moderate",
    occasions: ["formal"],
    seasons: ["autumn", "spring"],
    imageUrl: "/perfume-images/classic-chypre.jpg",
    stock: 19,
    rating: 4.5,
    reviewCount: 76,
    volume: 100,
    concentration: "EDP"
  },

  // SEASONAL SPECIALTIES
  {
    name: "Winter Warmth",
    brand: "Olfactive Echo Seasonal",
    description: "Cozy winter evenings by the fireplace with warm spices and soft cashmere.",
    price: 3700,
    notes: {
      top: ["cinnamon", "orange peel", "clove"],
      middle: ["cashmere", "nutmeg", "honey"],
      base: ["fireplace accord", "vanilla", "amber"]
    },
    scentFamily: "oriental",
    gender: "unisex",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["evening"],
    seasons: ["winter"],
    imageUrl: "/perfume-images/winter-warmth.jpg",
    stock: 24,
    rating: 4.4,
    reviewCount: 103,
    volume: 100,
    concentration: "EDP"
  },
  {
    name: "Summer Rain",
    brand: "Olfactive Echo Seasonal",
    description: "The fresh petrichor of summer rain on warm earth with green grass and wet stones.",
    price: 2600,
    notes: {
      top: ["petrichor", "rain drops", "green leaves"],
      middle: ["wet earth", "grass", "water lily"],
      base: ["wet stones", "clean musk", "mineral accord"]
    },
    scentFamily: "fresh",
    gender: "unisex",
    intensity: "light",
    longevity: "4-6 hours",
    sillage: "intimate",
    occasions: ["casual"],
    seasons: ["summer"],
    imageUrl: "/perfume-images/summer-rain.jpg",
    stock: 31,
    rating: 4.3,
    reviewCount: 88,
    volume: 100,
    concentration: "EDT"
  },

  // UNISEX MODERN COLLECTION
  {
    name: "Gender Fluid",
    brand: "Olfactive Echo Modern",
    description: "Breaking boundaries with this perfectly balanced unisex blend of flowers and woods.",
    price: 3900,
    notes: {
      top: ["pink pepper", "bergamot", "ginger"],
      middle: ["iris", "cedar", "black tea"],
      base: ["sandalwood", "white musk", "ambergris"]
    },
    scentFamily: "woody",
    gender: "unisex",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["daily", "office"],
    seasons: ["spring", "summer", "autumn", "winter"],
    imageUrl: "/perfume-images/gender-fluid.jpg",
    stock: 22,
    rating: 4.4,
    reviewCount: 91,
    volume: 100,
    concentration: "EDP"
  },

  // AROMATIC HERBS COLLECTION
  {
    name: "Herb Garden",
    brand: "Olfactive Echo Natural",
    description: "Fresh from the herb garden with basil, rosemary, and thyme in perfect harmony.",
    price: 2800,
    notes: {
      top: ["basil", "rosemary", "lemon"],
      middle: ["thyme", "sage", "lavender"],
      base: ["vetiver", "cedar", "green musk"]
    },
    scentFamily: "fresh",
    gender: "unisex",
    intensity: "light",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["casual", "daily"],
    seasons: ["spring", "summer"],
    imageUrl: "/perfume-images/herb-garden.jpg",
    stock: 26,
    rating: 4.2,
    reviewCount: 79,
    volume: 100,
    concentration: "EDT"
  },

  // AQUATIC COLLECTION
  {
    name: "Deep Blue",
    brand: "Olfactive Echo Aquatic",
    description: "Dive into the deep ocean with this aquatic masterpiece of marine and seaweed notes.",
    price: 3100,
    notes: {
      top: ["sea spray", "marine accord", "ozonic"],
      middle: ["seaweed", "water lily", "salt"],
      base: ["driftwood", "ambergris", "aquatic musk"]
    },
    scentFamily: "fresh",
    gender: "unisex",
    intensity: "moderate",
    longevity: "6-8 hours",
    sillage: "moderate",
    occasions: ["sport", "casual", "evening"],
    seasons: ["summer"],
    imageUrl: "/perfume-images/deep-blue.jpg",
    stock: 20,
    rating: 4.1,
    reviewCount: 65,
    volume: 100,
    concentration: "EDT"
  }
];

module.exports = realPerfumeData;
