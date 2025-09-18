import React, { useState } from 'react';
import { Package, Info, Gift } from 'lucide-react';
import toast from 'react-hot-toast';

const SampleSection = ({ product, onAddSample, cartTotal = 0 }) => {
  const [selectedSampleSize, setSelectedSampleSize] = useState('2ml');
  const [sampleQuantity, setSampleQuantity] = useState(1);

  // Sample pricing logic - using new price structure
  const samplePrices = {
    '2ml': Math.round(product?.price * 0.08) || 199, // 8% of full product price, minimum ₹199
    '5ml': Math.round(product?.price * 0.18) || 399,  // 18% of full product price, minimum ₹399
  };

  // Free sample threshold (₹5000)
  const freeThreshold = 5000;
  const isFreeEligible = cartTotal >= freeThreshold;
  const currentSamplePrice = isFreeEligible ? 0 : samplePrices[selectedSampleSize];

  // Get all notes for display
  const getAllNotes = (notes) => {
    if (!notes) return [];
    if (Array.isArray(notes)) return notes; // Legacy format
    
    // New nested format
    const allNotes = [];
    if (notes.top) allNotes.push(...notes.top);
    if (notes.middle) allNotes.push(...notes.middle);
    if (notes.base) allNotes.push(...notes.base);
    return allNotes;
  };

  const productNotes = getAllNotes(product?.notes);

  const handleAddSample = () => {
    const sampleProduct = {
      ...product,
      _id: `${product._id}_sample_${selectedSampleSize}`,
      name: `${product.name} (${selectedSampleSize} Sample)`,
      price: currentSamplePrice,
      isSample: true,
      originalProductId: product._id,
      sampleSize: selectedSampleSize,
      // Ensure proper image path
      imageUrl: product.imageUrl || `/perfume-images/${product.name?.toLowerCase().replace(/\s+/g, '-')}.svg`
    };

    onAddSample(sampleProduct, sampleQuantity);
    
    if (isFreeEligible) {
      toast.success('Free sample added to cart! 🎉');
    } else {
      toast.success('Sample added to cart!');
    }
  };

  return (
    <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-white rounded-2xl p-8 border border-yellow-200 shadow-lg w-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="font-bold text-3xl text-[#8C501B] mb-2">Try Before You Buy</h3>
          <p className="text-lg text-amber-700">Perfect way to discover your new favorite scent</p>
        </div>

        {/* Free Sample Promotion */}
        {isFreeEligible && (
          <div className="bg-gradient-to-r from-green-100 to-emerald-50 border border-green-300 rounded-lg p-4 mb-8 flex items-center justify-center space-x-2 max-w-2xl mx-auto">
            <Gift className="w-6 h-6 text-green-600" />
            <span className="text-green-800 font-medium text-lg">
              🎉 Congratulations! Free sample with your current cart total
            </span>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {/* Sample Size Selection */}
          <div className="md:col-span-1">
            <label className="block text-lg font-bold text-[#8C501B] mb-4 text-center">Sample Size</label>
            <div className="space-y-3">
              {Object.entries(samplePrices).map(([size, originalPrice]) => (
                <button
                  key={size}
                  onClick={() => setSelectedSampleSize(size)}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedSampleSize === size
                      ? 'border-amber-500 bg-gradient-to-br from-yellow-100 to-amber-100 text-[#8C501B] shadow-lg transform scale-105'
                      : 'border-yellow-200 hover:border-amber-300 text-amber-700 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold text-xl">{size}</div>
                    <div className="text-lg mt-2">
                      {isFreeEligible ? (
                        <span className="text-green-600 font-bold">FREE</span>
                      ) : (
                        <span>₹{originalPrice}</span>
                      )}
                    </div>
                    {!isFreeEligible && originalPrice !== currentSamplePrice && (
                      <div className="text-sm text-gray-500 line-through">₹{originalPrice}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className="md:col-span-1">
            <label className="block text-lg font-bold text-[#8C501B] mb-4 text-center">Quantity</label>
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSampleQuantity(Math.max(1, sampleQuantity - 1))}
                  className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 transition-colors flex items-center justify-center border border-yellow-200 shadow-md"
                >
                  <span className="text-2xl font-bold text-[#8C501B]">-</span>
                </button>
                <span className="text-3xl font-bold w-20 text-center text-[#8C501B] bg-white rounded-lg py-3 border-2 border-yellow-200 shadow-sm">{sampleQuantity}</span>
                <button
                  onClick={() => setSampleQuantity(Math.min(5, sampleQuantity + 1))}
                  className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-100 hover:from-yellow-200 hover:to-amber-200 transition-colors flex items-center justify-center border border-yellow-200 shadow-md"
                >
                  <span className="text-2xl font-bold text-[#8C501B]">+</span>
                </button>
              </div>
              <p className="text-sm text-amber-600 text-center">Maximum 5 samples per product</p>
            </div>
          </div>

          {/* Product Information */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-lg font-bold text-[#8C501B] mb-4 text-center">About This Fragrance</label>
            <div className="bg-gradient-to-br from-white to-yellow-50 rounded-lg p-4 border border-yellow-200 shadow-sm">
              {/* Scent Family & Intensity */}
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                {product?.scentFamily && (
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-sm rounded-full capitalize border border-amber-200">
                    {product.scentFamily}
                  </span>
                )}
                {product?.intensity && (
                  <span className="px-3 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-sm rounded-full capitalize border border-amber-200">
                    {product.intensity}
                  </span>
                )}
              </div>

              {/* Occasions & Seasons */}
              {(product?.occasions || product?.seasons) && (
                <div className="text-center space-y-1">
                  {product.occasions && (
                    <div className="text-sm">
                      <span className="font-medium text-[#8C501B]">Perfect for: </span>
                      <span className="text-amber-700 capitalize">
                        {product.occasions.slice(0, 2).join(', ')}
                      </span>
                    </div>
                  )}
                  {product.seasons && (
                    <div className="text-sm">
                      <span className="font-medium text-[#8C501B]">Best seasons: </span>
                      <span className="text-amber-700 capitalize">
                        {product.seasons.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add to Cart Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-lg font-bold text-[#8C501B] mb-4 text-center">Add Sample</label>
            <div className="space-y-4">
              <button
                onClick={handleAddSample}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center space-x-3"
              >
                <Package className="w-5 h-5" />
                <span>
                  {isFreeEligible 
                    ? `Add Free Sample` 
                    : `Add Sample - ₹${currentSamplePrice}`
                  }
                </span>
              </button>

              {/* Sample Benefits */}
              <div className="bg-gradient-to-br from-white to-yellow-50 rounded-lg p-3 border border-yellow-200 shadow-sm">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1 text-[#8C501B]">Why try a sample?</p>
                    <ul className="space-y-1 text-xs text-amber-700">
                      <li>• Test skin compatibility</li>
                      <li>• Experience full scent journey</li>
                      <li>• {selectedSampleSize} = {selectedSampleSize === '2ml' ? '15-20' : '35-40'} applications</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Free Sample Threshold Info */}
              {!isFreeEligible && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Gift className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-amber-800 text-xs font-medium">
                      Add ₹{(freeThreshold - cartTotal).toLocaleString()} more for free samples!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleSection;