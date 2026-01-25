import { useState } from "react";
import { Link } from "react-router-dom";
import { API } from "../api";
import { useToast } from "../context/ToastContext";

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSubscribing(true);
    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email: email,
          phone: null,
          message: `Newsletter subscription request from ${email}`,
        }),
      });

      if (res.ok) {
        toast.success("Thank you for subscribing! We'll keep you updated.");
        setEmail("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to subscribe. Please try again.");
      }
    } catch {
      toast.error("Error subscribing. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const linkMap = {
    "Home": "/",
    "About": "/about",
    "Contact": "/contact",
    "Shop": "/categories",
    "New Arrivals": "/new",
  };

  return (
    <footer className="text-white mt-20" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="GiftChoice"
                className="h-12 w-auto"
              />
              <h3 className="text-2xl font-extrabold tracking-wide" style={{ color: 'oklch(20% .02 340)' }}>
                Gift Choice
              </h3>
            </div>
            <p className="text-sm leading-relaxed max-w-md" style={{ color: 'oklch(20% .02 340)' }}>
              Your one-stop destination for thoughtful gifts for every occasion.  
              Enfolding your emotions with carefully curated selections that speak from the heart.
            </p>

            {/* Trust Badges */}
            <div className="flex gap-4 mt-6 text-sm" style={{ color: 'oklch(20% .02 340)' }}>
              <span className="flex items-center gap-2">🔒 Secure Payments</span>
              <span className="flex items-center gap-2">🚚 Fast Delivery</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-5" style={{ color: 'oklch(20% .02 340)' }}>Quick Links</h4>
            <div className="space-y-3 text-sm">
              {Object.entries(linkMap).map(([label, path]) => (
                <Link
                  key={label}
                  to={path}
                  className="block transition-all duration-300 hover:translate-x-1"
                  style={{ color: 'oklch(20% .02 340)' }}
                  onMouseEnter={(e) => e.target.style.color = 'white'}
                  onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
                  onClick={(e) => e.target.style.color = 'white'}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact + Social */}
          <div>
            <h4 className="font-bold mb-5" style={{ color: 'oklch(20% .02 340)' }}>Connect With Us</h4>

            <div className="space-y-3 text-sm" style={{ color: 'oklch(20% .02 340)' }}>
              <p className="flex items-start gap-2">
                <span className="mt-0.5">📍</span>
                <span>Sewa Sadan Rd, near Sitaram Ji Ki Bawri, Bhopal Ganj, Bhilwara, Rajasthan 311001</span>
              </p>
              <p className="flex items-center gap-2">
                <span>📱</span>
                <a 
                  href="tel:+917976948872" 
                  className="hover:underline transition-all duration-300"
                  style={{ color: 'oklch(20% .02 340)' }}
                  onMouseEnter={(e) => e.target.style.color = 'white'}
                  onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
                  onClick={(e) => e.target.style.color = 'white'}
                >
                  79769 48872
                </a>
              </p>
              <p className="flex items-center gap-2">
                <span>👤</span>
                <span>Yash Jhanwar</span>
              </p>
              <p className="flex items-center gap-2 mt-4">
                <span>📧</span>
                <a 
                  href="mailto:yashj.6628@gmail.com" 
                  className="hover:underline transition-all duration-300"
                  style={{ color: 'oklch(20% .02 340)' }}
                  onMouseEnter={(e) => e.target.style.color = 'white'}
                  onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
                  onClick={(e) => e.target.style.color = 'white'}
                >
                  yashj.6628@gmail.com
                </a>
              </p>
            </div>

            {/* Social Icons */}
            <div className="mt-4">
              <a
                href="https://www.instagram.com/giftchoicebhl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm transition-all duration-300 hover:translate-x-1"
                style={{ color: 'oklch(20% .02 340)' }}
                onMouseEnter={(e) => e.target.style.color = 'white'}
                onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
                onClick={(e) => e.target.style.color = 'white'}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Follow Us @giftchoicebhl
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <form onSubmit={handleSubscribe} className="bg-white/20 backdrop-blur-sm rounded-xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border" style={{ borderColor: 'oklch(96% .02 340)' }}>
          <div>
            <h4 className="text-lg font-bold" style={{ color: 'oklch(20% .02 340)' }}>Stay in the loop</h4>
            <p className="text-sm" style={{ color: 'oklch(20% .02 340)' }}>
              Get exclusive offers & gift ideas straight to your inbox.
            </p>
          </div>

          <div className="flex w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={subscribing}
              className="px-4 py-2.5 rounded-l-lg bg-white/90 border 
                         text-sm focus:outline-none focus:ring-2 focus:ring-white w-full md:w-64 disabled:opacity-50"
              style={{ 
                borderColor: 'oklch(96% .02 340)',
                color: 'oklch(20% .02 340)'
              }}
            />
            <button 
              type="submit"
              disabled={subscribing}
              className="bg-white px-5 py-2.5 rounded-r-lg 
                         text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ color: 'oklch(92% .04 340)' }}
              onMouseEnter={(e) => !subscribing && (e.target.style.backgroundColor = 'oklch(96% .02 340)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'white')}
            >
              {subscribing ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        </form>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'oklch(96% .02 340)' }}>
          <p className="text-sm" style={{ color: 'oklch(20% .02 340)' }}>
            © {new Date().getFullYear()} GiftChoice. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm">
            <Link 
              to="#" 
              className="transition-all duration-300 hover:underline" 
              style={{ color: 'oklch(20% .02 340)' }} 
              onMouseEnter={(e) => e.target.style.color = 'white'} 
              onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
              onClick={(e) => e.target.style.color = 'white'}
            >
              Privacy Policy
            </Link>
            <Link 
              to="#" 
              className="transition-all duration-300 hover:underline" 
              style={{ color: 'oklch(20% .02 340)' }} 
              onMouseEnter={(e) => e.target.style.color = 'white'} 
              onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
              onClick={(e) => e.target.style.color = 'white'}
            >
              Terms & Conditions
            </Link>
          </div>
        </div>

      </div>
      </footer>
    );
  }
  