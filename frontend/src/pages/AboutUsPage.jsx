import React from 'react';

const AboutUsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">About Olfactive Echo</h1>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          Founded in 2023, Olfactive Echo is a premier destination for fragrance enthusiasts seeking 
          the finest perfumes from around the world. Our mission is to curate a collection that 
          represents the pinnacle of perfumery craftsmanship.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">Our Story</h2>
        <p className="mb-4">
          What began as a passion project between two fragrance aficionados has grown into a 
          thriving community of scent lovers. We believe that a fragrance is more than just a 
          scent—it's an echo of your personality, a memory in the making.
        </p>
        
        <h2 className="text-xl font-bold mt-6 mb-3">Our Values</h2>
        <ul className="list-disc pl-5 mb-4">
          <li className="mb-2">Authenticity - We source only genuine, high-quality fragrances</li>
          <li className="mb-2">Expertise - Our team has deep knowledge of perfumery</li>
          <li className="mb-2">Sustainability - We're committed to eco-friendly practices</li>
          <li className="mb-2">Community - We foster connections between fragrance lovers</li>
        </ul>
        
        <h2 className="text-xl font-bold mt-6 mb-3">Meet the Team</h2>
        <p>
          Our team of fragrance experts is dedicated to helping you find your perfect scent. 
          Whether you're new to perfumes or a seasoned collector, we're here to guide your journey.
        </p>
      </div>
    </div>
  );
};

export default AboutUsPage;