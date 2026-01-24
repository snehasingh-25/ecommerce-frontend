import { Link } from "react-router-dom";

export default function Footer() {
    return (
    <footer className="text-white mt-20" style={{ backgroundColor: 'oklch(92% .04 340)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">

          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.jpeg"
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
              {["Home", "About", "Contact", "Shop", "New Arrivals"].map((item) => (
                <Link
                  key={item}
                  to={`/${item.toLowerCase().replace(" ", "")}`}
                  className="block transition-all duration-300 hover:translate-x-1"
                  style={{ color: 'oklch(20% .02 340)' }}
                  onMouseEnter={(e) => e.target.style.color = 'oklch(92% .04 340)'}
                  onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact + Social */}
          <div>
            <h4 className="font-bold mb-5" style={{ color: 'oklch(20% .02 340)' }}>Connect With Us</h4>

            <div className="space-y-3 text-sm" style={{ color: 'oklch(20% .02 340)' }}>
              <p className="flex items-center gap-2">📧 yashj.6628@gmail.com</p>
              <p className="flex items-center gap-2">📱 +91 79769 48872</p>
            </div>

            {/* Social Icons */}
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border" style={{ borderColor: 'oklch(96% .02 340)' }}>
          <div>
            <h4 className="text-lg font-bold" style={{ color: 'oklch(20% .02 340)' }}>Stay in the loop 💌</h4>
            <p className="text-sm" style={{ color: 'oklch(20% .02 340)' }}>
              Get exclusive offers & gift ideas straight to your inbox.
            </p>
          </div>

          <div className="flex w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2.5 rounded-l-lg bg-white/90 border 
                         text-sm focus:outline-none focus:ring-2 focus:ring-white w-full md:w-64"
              style={{ 
                borderColor: 'oklch(96% .02 340)',
                color: 'oklch(20% .02 340)'
              }}
            />
            <button 
              className="bg-white px-5 py-2.5 rounded-r-lg 
                         text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
              style={{ color: 'oklch(92% .04 340)' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(96% .02 340)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              Subscribe
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: 'oklch(96% .02 340)' }}>
          <p className="text-sm" style={{ color: 'oklch(20% .02 340)' }}>
            © {new Date().getFullYear()} GiftChoice. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm">
            <Link to="#" className="transition-all duration-300 hover:underline" style={{ color: 'oklch(20% .02 340)' }} onMouseEnter={(e) => e.target.style.color = 'oklch(92% .04 340)'} onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}>
              Privacy Policy
            </Link>
            <Link to="#" className="transition-all duration-300 hover:underline" style={{ color: 'oklch(20% .02 340)' }} onMouseEnter={(e) => e.target.style.color = 'oklch(92% .04 340)'} onMouseLeave={(e) => e.target.style.color = 'oklch(20% .02 340)'}>
              Terms & Conditions
            </Link>
          </div>
        </div>

      </div>
      </footer>
    );
  }
  