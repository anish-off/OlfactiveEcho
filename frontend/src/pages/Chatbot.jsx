import React from 'react';
import Footer from '@/components/Footer';
import NavbarWrapper from '@/components/NavbarWrapper';

const Chatbot = () => {
  return (
    <>
      <NavbarWrapper />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center py-16">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-amber-700 mb-4 text-center font-serif">Olfactive Echo Chatbot</h1>
          <p className="text-gray-600 mb-6 text-center">Ask anything about fragrances, products, or your orders!</p>
          {/* Chat UI placeholder */}
          <div className="bg-amber-50 rounded-lg p-4 min-h-[300px] flex flex-col gap-2">
            <div className="text-gray-400 text-center">Chatbot UI coming soon...</div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Chatbot;
