import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={`oe-navbar${scrolled ? ' oe-navbar--scrolled' : ''}`}> 
      <div className="oe-container">
        <a href="#top" className="oe-logo" onClick={close} aria-label="OlfactiveEcho Home">OlfactiveEcho</a>
        <nav className={`oe-nav-links${open ? ' is-open' : ''}`} aria-label="Main navigation" aria-expanded={open}>
          <a onClick={close} href="#products">Products</a>
          <a onClick={close} href="#samples">Samples</a>
          <a onClick={close} href="#login" className="oe-login-btn">Login</a>
        </nav>
        <button
          className={`oe-burger${open ? ' is-active' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-controls="primary-navigation"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      {open && <div className="oe-nav-backdrop" onClick={close} aria-hidden="true" />}
    </header>
  );
};

export default Navbar;
