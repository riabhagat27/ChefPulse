import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#' + sectionId);
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl z-50 glass rounded-2xl px-8 py-5 transition-all duration-300 shadow-2xl">
      <div className="flex items-center justify-between">
        {/* Luxury Monogram Logo */}
        <Link to="/" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-full border border-primary flex items-center justify-center transition-transform duration-500 group-hover:rotate-180">
            <span className="text-[10px] font-serif font-bold text-primary tracking-tighter">CP</span>
          </div>
          <span className="text-lg font-serif font-medium uppercase tracking-widest text-primary-text">
            Chef<span className="text-primary italic font-semibold">Pulse</span>
          </span>
        </Link>

        {/* Desktop Menu - Fine Dining Aesthetic (Wide letter spacing) */}
        <div className="hidden md:flex items-center gap-10">
          {['Home', 'Features', 'About', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={(e) => handleNavClick(e, item.toLowerCase())}
              className="text-xs uppercase tracking-widest font-medium text-secondary-text hover:text-primary transition-colors duration-300"
            >
              {item}
            </a>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <Link 
            to="/login"
            className="text-xs uppercase tracking-widest font-semibold text-secondary-text hover:text-primary transition-colors duration-300"
          >
            Login
          </Link>
          <Link 
            to="/register"
            className="text-xs uppercase tracking-widest font-semibold text-background bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-lg shadow-primary/10 transition-all duration-300 px-6 py-3 rounded-xl border border-primary/20 text-center"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-1.5 text-secondary-text hover:text-primary transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-5 pt-5 border-t border-border-color flex flex-col gap-4 animate-fadeIn">
          {['Home', 'Features', 'About', 'Contact'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={(e) => handleNavClick(e, item.toLowerCase())}
              className="text-xs uppercase tracking-widest font-semibold text-secondary-text hover:text-primary transition-colors py-2"
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-3 border-t border-border-color">
            <Link 
              to="/login"
              onClick={() => setIsOpen(false)}
              className="w-full text-left text-xs uppercase tracking-widest font-semibold text-secondary-text hover:text-primary py-2"
            >
              Login
            </Link>
            <Link 
              to="/register"
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs uppercase tracking-widest font-semibold text-background bg-gradient-to-r from-primary to-secondary py-3 rounded-xl shadow-lg shadow-primary/10"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
