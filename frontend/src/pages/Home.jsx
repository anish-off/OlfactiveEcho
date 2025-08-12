
import React from 'react';

const Home = () => {
  return (
    <main id="top" className="relative overflow-hidden">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-overlay" />
      <div className="hero-container">
        <h1 className="hero-title">The Art of Scent Reimagined</h1>
        <p className="hero-sub">Explore crafted fragrances and curated samples that echo your story.</p>
        <a href="#products" className="hero-cta">Explore Our Products</a>
        <div className="scroll-indicator" aria-hidden="true">
          <span className="scroll-mouse"><span className="scroll-wheel" /></span>
          <span>Scroll</span>
        </div>
      </div>
    </main>
  );
};

export default Home;
