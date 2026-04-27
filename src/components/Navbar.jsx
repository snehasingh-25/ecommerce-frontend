import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/categories", label: "Categories" },
    { path: "/occasion", label: "Occasions" },
    { path: "/relation", label: "Relations" },
    { path: "/new", label: "New Arrivals"},
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  return (
    <nav
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "bg-white/70 shadow-lg border-b backdrop-blur-xl"
          : "bg-white/55 backdrop-blur-xl"
      }`}
      style={{ borderColor: scrolled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.25)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 md:h-14 lg:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="GiftChoice Logo" 
              className="h-9 md:h-10 lg:h-12 w-auto object-contain transition-transform duration-300 lg:group-hover:scale-110"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out ${
                    isActive(item.path)
                      ? "border-2"
                      : ""
                  }`}
                  style={{
                    color: isActive(item.path) ? 'oklch(20% .02 340)' : 'oklch(40% .02 340)',
                    backgroundColor: isActive(item.path) ? 'oklch(92% .04 340)' : 'transparent',
                    borderColor: isActive(item.path) ? 'oklch(92% .04 340)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'oklch(92% .04 340)';
                      e.currentTarget.style.color = 'oklch(20% .02 340)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive(item.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'oklch(40% .02 340)';
                    }
                  }}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'oklch(92% .04 340)', color: 'oklch(20% .02 340)' }}>
                      {item.badge}
                    </span>
                  )}
                </Link>

              </div>
            ))}
          </div>

          {/* Search + Cart + Mobile Button */}
          <div className="flex items-center gap-3">

            {/* Desktop search bar */}
            <SearchBar className="hidden lg:block w-60" />

            {/* Mobile/Tablet Search Icon (replaces search bar) */}
            <Link to="/search" className="relative lg:hidden group">
              <button
                type="button"
                className="p-2 rounded-full hover:scale-110 transition-all duration-300 active:scale-95"
                style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
                aria-label="Search"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: "oklch(20% .02 340)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative group">
              <button 
                className="p-2 md:p-2 lg:p-2.5 rounded-full hover:scale-110 transition-all duration-300 active:scale-95"
                style={{ backgroundColor: "rgba(255,255,255,0.55)" }}
              >
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'oklch(20% .02 340)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {getCartCount() > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 text-xs rounded-full flex items-center justify-center font-semibold animate-pulse" style={{ backgroundColor: 'oklch(92% .04 340)', color: 'oklch(20% .02 340)' }}>
                    {getCartCount()}
                  </span>
                )}
              </button>
              <span className="absolute -top-9 right-0 text-xs text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0" style={{ backgroundColor: 'oklch(20% .02 340)' }}>
                Your Cart
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg transition-all duration-300 active:scale-95"
              style={{ color: 'oklch(40% .02 340)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(92% .04 340)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-96 py-4" : "max-h-0"
          }`}
        >
          <div className="flex flex-col gap-1 border-t pt-4" style={{ borderColor: 'oklch(92% .04 340)' }}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive(item.path)
                    ? "border-2"
                    : "active:scale-95"
                }`}
                style={{
                  color: isActive(item.path) ? 'oklch(20% .02 340)' : 'oklch(40% .02 340)',
                  backgroundColor: isActive(item.path) ? 'oklch(92% .04 340)' : 'transparent',
                  borderColor: isActive(item.path) ? 'oklch(92% .04 340)' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'oklch(92% .04 340)';
                    e.currentTarget.style.color = 'oklch(20% .02 340)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'oklch(40% .02 340)';
                  }
                }}
              >
                {item.label}
                {item.badge && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'oklch(92% .04 340)', color: 'oklch(20% .02 340)' }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
