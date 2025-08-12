import React from 'react';
import { Zap, Leaf, Gem, Award } from 'lucide-react';

const features = [
  {
    icon: <Leaf className="h-8 w-8 text-primary" />,
    title: 'Natural Ingredients',
    description: 'We source only the finest natural essences and oils, ensuring each fragrance is pure and skin-friendly.',
  },
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Artisan Crafted',
    description: 'Every bottle is meticulously handcrafted by our master perfumers with decades of experience.',
  },
  {
    icon: <Gem className="h-8 w-8 text-primary" />,
    title: 'Exclusive Scents',
    description: 'Our proprietary blends create unique fragrances you won\'t find anywhere else in the world.',
  },
  {
    icon: <Award className="h-8 w-8 text-primary" />,
    title: 'Award Winning',
    description: 'Recognized by the International Perfume Association for excellence in fragrance creation.',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why <span className="text-primary">Olfactive Echo</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're redefining luxury fragrances with our commitment to quality and craftsmanship.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-center h-16 w-16 mx-auto bg-primary/10 rounded-xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;