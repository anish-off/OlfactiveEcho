import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isLoggedIn } = useAuth();

  return (
    <main id="top" className="relative overflow-hidden">
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-overlay" />
      <div className="hero-container">
        <h1 className="hero-title">The Art of Scent Reimagined</h1>
        <p className="hero-sub">Explore crafted fragrances and curated samples that echo your story.</p>
        <Link to={isLoggedIn ? "/products" : "/login"} className="hero-cta">Explore Our Products</Link>
      </div>
    </main>
  );
}

export default Home;