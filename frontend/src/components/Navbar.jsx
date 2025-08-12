import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { to: '/products', label: 'Products' },
  { to: '/samples', label: 'Samples' },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; }, [open]);

  const close = () => setOpen(false);

  const shell = scrolled
    ? 'backdrop-blur-xl bg-white/80 shadow-[0_4px_22px_-6px_rgba(0,0,0,0.15)] border-b border-neutral-200/70'
    : 'bg-gradient-to-tr from-white/90 via-white/70 to-white/90 backdrop-blur-xl border-b border-neutral-200/60';

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${shell}`}> 
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="relative text-sm font-bold uppercase tracking-[0.65em] bg-gradient-to-r from-amber-700 via-amber-500 to-amber-300 bg-clip-text text-transparent" onClick={close}>
          OlfactiveEcho
          <span className="absolute left-0 -bottom-1 h-px w-0 bg-gradient-to-r from-amber-600 to-amber-300 transition-all duration-500 group-hover:w-full" aria-hidden="true" />
        </Link>
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={close} className="relative text-[13px] font-semibold uppercase text-neutral-700 hover:text-neutral-900 transition-colors py-1">
              {l.label}
              <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
          <Link to="/login" onClick={close} className="relative inline-flex items-center justify-center rounded-full border-2 border-amber-300/60 bg-gradient-to-br from-amber-400/90 via-amber-500/90 to-amber-600/90 px-6 py-2 text-[11px] font-bold uppercase text-white shadow-[0_8px_26px_-8px_rgba(0,0,0,0.35)] hover:shadow-[0_10px_34px_-6px_rgba(0,0,0,0.4)] transition-all duration-700 overflow-hidden group">
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.6),rgba(255,255,255,0)_65%)] mix-blend-overlay" />
            Login
          </Link>
        </nav>
        <button aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)} className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-neutral-300/70 bg-white/60 backdrop-blur hover:bg-white/80 transition-all">
          {open ? <X className="w-5 h-5 text-amber-600" /> : <Menu className="w-5 h-5 text-amber-600" />}
        </button>
      </div>
      {/* Mobile Panel */}
      <div className={`md:hidden fixed inset-y-0 right-0 w-2/3 max-w-xs bg-white/95 backdrop-blur-xl border-l border-neutral-200 transition-transform duration-700 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col pt-28 pb-10 px-8 gap-8">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={close} className="text-[14px] font-semibold uppercase text-neutral-700 hover:text-neutral-900 transition-colors relative group">
              {l.label}
              <span className="absolute left-0 -bottom-1 h-px bg-gradient-to-r from-amber-600 to-amber-400 w-0 group-hover:w-2/3 transition-all duration-500" />
            </Link>
          ))}
          <Link to="/login" onClick={close} className="relative inline-flex items-center justify-center rounded-full border-2 border-amber-300/70 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 px-7 py-3 text-[12px] font-bold uppercase text-white shadow-[0_8px_26px_-8px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.45)] transition-all duration-700 overflow-hidden group">
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.6),rgba(255,255,255,0)_65%)] mix-blend-overlay" />
            Login
          </Link>
        </div>
      </div>
      {open && <div className="md:hidden fixed inset-0 bg-neutral-900/25 backdrop-blur-sm animate-in fade-in duration-700" onClick={close} />}
    </header>
  );
};

export default Navbar;
