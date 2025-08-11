import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { href: '#products', label: 'Products' },
  { href: '#samples', label: 'Samples' },
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

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${scrolled ? 'backdrop-blur bg-black/70 shadow-[0_4px_18px_-4px_rgba(0,0,0,0.55)]' : 'bg-gradient-to-tr from-black/55 via-black/30 to-black/55 backdrop-blur-md'} border-b border-white/5`}> 
      <div className="container flex items-center justify-between py-4">
        <a href="#top" className="relative text-sm font-bold uppercase tracking-[0.65em] bg-gradient-to-r from-white via-amber-100 to-amber-400 bg-clip-text text-transparent" onClick={close}>
          OlfactiveEcho
          <span className="absolute left-0 -bottom-1 h-px w-0 bg-gradient-to-r from-amber-100 to-amber-500 transition-all duration-500 group-hover:w-full" aria-hidden="true" />
        </a>
        <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={close} className="relative text-[13px] font-semibold uppercase text-neutral-200 hover:text-white transition-colors py-1">
              {l.label}
              <span className="absolute left-0 -bottom-0.5 h-px w-0 bg-gradient-to-r from-amber-300 to-amber-600 transition-all duration-500 group-hover:w-full" />
            </a>
          ))}
          <a href="#login" onClick={close} className="relative inline-flex items-center justify-center rounded-full border-2 border-white/25 bg-gradient-to-br from-amber-400/70 via-amber-600/70 to-amber-800/70 px-6 py-2 text-[11px] font-bold uppercase text-white shadow-[0_6px_20px_-6px_rgba(0,0,0,0.7)] hover:shadow-[0_10px_32px_-6px_rgba(0,0,0,0.75)] transition-all duration-700 overflow-hidden group">
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.65),rgba(255,255,255,0)_65%)] mix-blend-overlay" />
            Login
          </a>
        </nav>
        <button aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(o => !o)} className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-all">
          {open ? <X className="w-5 h-5 text-amber-200" /> : <Menu className="w-5 h-5 text-amber-200" />}
        </button>
      </div>
      {/* Mobile Panel */}
      <div className={`md:hidden fixed inset-y-0 right-0 w-2/3 max-w-xs bg-black/85 backdrop-blur-xl border-l border-white/10 transition-transform duration-700 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col pt-28 pb-10 px-8 gap-8">
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={close} className="text-[14px] font-semibold uppercase text-neutral-200 hover:text-white transition-colors relative group">
              {l.label}
              <span className="absolute left-0 -bottom-1 h-px bg-gradient-to-r from-amber-200 to-amber-500 w-0 group-hover:w-2/3 transition-all duration-500" />
            </a>
          ))}
          <a href="#login" onClick={close} className="relative inline-flex items-center justify-center rounded-full border-2 border-white/25 bg-gradient-to-br from-amber-400/70 via-amber-600/70 to-amber-800/70 px-7 py-3 text-[12px] font-bold uppercase text-white shadow-[0_6px_20px_-6px_rgba(0,0,0,0.7)] hover:shadow-[0_10px_32px_-6px_rgba(0,0,0,0.75)] transition-all duration-700 overflow-hidden group">
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.65),rgba(255,255,255,0)_65%)] mix-blend-overlay" />
            Login
          </a>
        </div>
      </div>
      {open && <div className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-700" onClick={close} />}
    </header>
  );
};

export default Navbar;
