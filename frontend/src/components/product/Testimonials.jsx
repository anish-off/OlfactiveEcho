import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    quote: 'The scents are absolutely divine and last all day. I get so many compliments whenever I wear them. My new favorite brand!',
    name: 'Jessica L.',
    role: 'Fashion Editor',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    quote: 'I love the unique and complex fragrances. They feel so luxurious and special. The packaging is also beautiful.',
    name: 'Michael B.',
    role: 'Creative Director',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    quote: 'A truly artisanal experience. You can tell that so much care and passion goes into each bottle. Highly recommended!',
    name: 'Sarah K.',
    role: 'Lifestyle Blogger',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
];

const Testimonials = () => {
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-gray-50 p-8 rounded-xl relative overflow-hidden border border-gray-100"
            >
              <Quote className="absolute -top-2 -right-2 h-16 w-16 text-primary/10" />
              <div className="flex items-center mb-6">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 mr-4" 
                />
                <div>
                  <h3 className="font-bold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 italic relative z-10">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;