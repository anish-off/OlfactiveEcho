import React from 'react';
import '../index.css';

const Home = () => {
  return (
    <main className="oe-hero" role="main" id="top">
      <div className="oe-hero-bg-texture" aria-hidden="true" />
      <div className="oe-hero-overlay" />
      <div className="oe-hero-content">
        <h1 className="oe-hero-title">
          <span className="oe-hero-word">The Art</span> <span className="oe-hero-word">of Scent</span> <span className="oe-hero-word">Reimagined</span>
        </h1>
        <p className="oe-hero-sub">Explore crafted fragrances and curated samples that echo your story.</p>
        <a href="#products" className="oe-cta-btn">Explore Our Products</a>
        <div className="oe-scroll-indicator" aria-hidden="true">
          <span className="oe-mouse"><span className="oe-wheel" /></span>
          <span className="oe-scroll-text">Scroll</span>
        </div>
      </div>
    </main>
  );
};

export default Home;

