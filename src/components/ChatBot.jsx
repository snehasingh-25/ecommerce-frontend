import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../api";

export default function ChatBot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Birthdays, Anniversaries, and more!",
      sender: "bot",
      timestamp: new Date(),
      action: "occasions",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch products for product-related queries
    fetch(`${API}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage.toLowerCase());
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 2,
          text: botResponse.text,
          sender: "bot",
          timestamp: new Date(),
          action: botResponse.action,
          data: botResponse.data,
        },
      ]);
      scrollToBottom();
    }, 500);
  };

  const generateBotResponse = (query) => {
    // Handle relationship-based queries (for boyfriend, girlfriend, etc.)
    const relationshipKeywords = {
      "boyfriend": ["boyfriend", "bf", "him", "male", "man"],
      "girlfriend": ["girlfriend", "gf", "her", "female", "woman"],
      "husband": ["husband", "hubby"],
      "wife": ["wife"],
      "friend": ["friend", "buddy", "pal"],
      "mother": ["mother", "mom", "mum", "mommy"],
      "father": ["father", "dad", "daddy", "papa"],
      "sister": ["sister", "sis"],
      "brother": ["brother", "bro"],
    };

    let relationshipType = null;
    for (const [key, keywords] of Object.entries(relationshipKeywords)) {
      if (keywords.some(k => query.includes(k))) {
        relationshipType = key;
        break;
      }
    }

    // Product search with relationship context
    if (relationshipType || query.includes("product") || query.includes("gift") || query.includes("item") || query.includes("for")) {
      const searchTerms = query.split(" ").filter(word => 
        word.length > 2 && !["product", "gift", "item", "show", "find", "search", "for", "a", "an", "the"].includes(word.toLowerCase())
      );
      
      if ((searchTerms.length > 0 || relationshipType) && products.length > 0) {
        const matchingProducts = products.filter(p => {
          if (relationshipType) {
            // Filter by keywords related to relationship
            const keywords = p.keywords ? (Array.isArray(p.keywords) ? p.keywords : JSON.parse(p.keywords || "[]")) : [];
            const searchText = (p.name + " " + p.description + " " + keywords.join(" ")).toLowerCase();
            
            // Match relationship-related keywords
            const relationshipMatches = relationshipKeywords[relationshipType].some(k => 
              searchText.includes(k)
            );
            
            // Also check if product name/description contains relevant terms
            const generalMatch = searchText.includes(relationshipType) || 
                                (relationshipType === "boyfriend" && (searchText.includes("men") || searchText.includes("male"))) ||
                                (relationshipType === "girlfriend" && (searchText.includes("women") || searchText.includes("female")));
            
            return relationshipMatches || generalMatch || searchTerms.some(term => searchText.includes(term.toLowerCase()));
          } else {
            const searchText = searchTerms.join(" ").toLowerCase();
            return p.name.toLowerCase().includes(searchText) ||
                   p.description.toLowerCase().includes(searchText) ||
                   (p.keywords && Array.isArray(p.keywords) && 
                    p.keywords.some(k => k.toLowerCase().includes(searchText)));
          }
        }).slice(0, 5);

        if (matchingProducts.length > 0) {
          const productList = matchingProducts.map(p => `• ${p.name}`).join("\n");
          const suggestionText = relationshipType 
            ? `Great! I found some perfect gifts ${relationshipType === "boyfriend" ? "for him" : relationshipType === "girlfriend" ? "for her" : `for your ${relationshipType}`}:\n\n${productList}\n\nWould you like to see more details?`
            : `I found these products for you:\n\n${productList}\n\nWould you like to see more details?`;
          
          return {
            text: suggestionText,
            action: "products",
            data: matchingProducts,
            suggestions: ["Browse All Products", "View Occasions", "Contact Us"],
          };
        } else if (relationshipType) {
          return {
            text: `I'd love to help you find the perfect gift ${relationshipType === "boyfriend" ? "for him" : relationshipType === "girlfriend" ? "for her" : `for your ${relationshipType}`}! Let me suggest browsing our categories or occasions.`,
            action: "browse",
            suggestions: ["Browse Products", "View Occasions"],
          };
        }
      }
    }

    // Price/order queries
    if (query.includes("price") || query.includes("cost") || query.includes("how much")) {
      return {
        text: "Product prices vary based on size and type. You can check the price on each product page. Would you like me to help you find a specific product?",
        suggestions: ["Browse Products", "View Occasions"],
      };
    }

    // Order status
    if (query.includes("order") && (query.includes("status") || query.includes("track"))) {
      return {
        text: "To check your order status, please contact us directly via WhatsApp. Our team will assist you immediately!",
        action: "whatsapp",
      };
    }

    // Delivery queries
    if (query.includes("delivery") || query.includes("shipping") || query.includes("time")) {
      return {
        text: "We offer fast delivery! Delivery times vary by location. For specific delivery information, please contact us on WhatsApp.",
        action: "whatsapp",
      };
    }

    // Contact information
    if (query.includes("contact") || query.includes("phone") || query.includes("number") || query.includes("address")) {
      return {
        text: "📞 Phone: +91 79769 48872\n📍 Address: Sewa Sadan Rd, near Sitaram Ji Ki Bawri, Bhopal Ganj, Bhilwara, Rajasthan 311001\n\nWould you like to chat with us on WhatsApp?",
        action: "whatsapp",
      };
    }

    // Categories
    if (query.includes("category") || query.includes("categories") || query.includes("type")) {
      return {
        text: "We have various categories including:\n• Bottles\n• Soft Toys\n• Gifts\n• Anniversary Gifts\n• Birthday Gifts\n\nYou can browse all categories from the menu!",
        action: "categories",
        suggestions: ["Browse Categories", "View Occasions"],
      };
    }

    // Occasions
    if (query.includes("occasion") || query.includes("valentine") || query.includes("birthday") || query.includes("anniversary")) {
      return {
        text: "We have gifts for all occasions! Check out our Occasions page to see products for Valentine's Day, Birthdays, Anniversaries, and more!",
        action: "occasions",
      };
    }

    // Help/Support
    if (query.includes("help") || query.includes("support") || query.includes("assist")) {
      return {
        text: "I'm here to help! You can ask me about:\n• Products and gifts\n• Prices and orders\n• Delivery information\n• Contact details\n\nOr chat with us directly on WhatsApp for immediate assistance!",
        action: "whatsapp",
        suggestions: ["Browse Products", "View Occasions", "Contact Us"],
      };
    }

    // Default response with suggestions
    return {
      text: "I'm here to help! You can ask me about:\n• Products and gifts\n• Prices and orders\n• Delivery information\n• Contact details\n\nOr chat with us directly on WhatsApp for immediate assistance!",
      action: "whatsapp",
      suggestions: ["Browse Products", "View Occasions", "Contact Us"],
    };
  };

  const handleAction = (action, data) => {
    if (action === "whatsapp") {
      const message = "Hello! I need assistance with GiftChoice.";
      window.open(`https://wa.me/917976948872?text=${encodeURIComponent(message)}`, "_blank");
    } else if (action === "occasions") {
      navigate("/occasion");
    } else if (action === "categories" || action === "browse") {
      navigate("/categories");
    } else if (action === "products" && data) {
      // Navigate to first product or show product links
      if (data.length === 1) {
        navigate(`/product/${data[0].id}`);
      } else {
        // Show product links for multiple products
        const productLinks = data.map(p => `\n• ${p.name} - /product/${p.id}`).join("");
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            text: `Here are the product links:${productLinks}\n\nClick on any product to view details!`,
            sender: "bot",
            timestamp: new Date(),
            suggestions: ["Browse All Products", "View Occasions"],
          },
        ]);
      }
    }
  };

  const handleSuggestion = (suggestion) => {
    if (suggestion === "Browse Products" || suggestion === "Browse All Products") {
      navigate("/categories");
    } else if (suggestion === "View Occasions") {
      navigate("/occasion");
    } else if (suggestion === "Contact Us") {
      window.open(`https://wa.me/917976948872?text=${encodeURIComponent("Hello! I need assistance.")}`, "_blank");
    } else if (suggestion === "Browse Categories") {
      navigate("/categories");
    }
  };

  const quickActions = [
    { label: "Browse Products", action: () => window.location.href = "/categories" },
    { label: "View Occasions", action: () => window.location.href = "/occasion" },
    { label: "Contact Us", action: () => window.open(`https://wa.me/917976948872?text=${encodeURIComponent("Hello! I need assistance.")}`, "_blank") },
  ];

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 z-50 rounded-full w-16 h-16 shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center group active:scale-95"
        style={{ backgroundColor: 'oklch(92% .04 340)' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(92% .04 340)'}
      >
        {!isOpen ? (
          <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'oklch(20% .02 340)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'oklch(20% .02 340)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border-2 overflow-hidden"
          style={{ borderColor: 'oklch(92% .04 340)' }}>
          {/* Header */}
          <div className="p-4 border-b-2 flex items-center justify-between"
            style={{ borderColor: 'oklch(92% .04 340)', backgroundColor: 'oklch(92% .04 340)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'oklch(88% .06 340)' }}>
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h3 className="font-bold text-sm" style={{ color: 'oklch(20% .02 340)' }}>GiftChoice Support</h3>
                <p className="text-xs" style={{ color: 'oklch(60% .02 340)' }}>We're here to help!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/50 transition"
            >
              <svg className="w-5 h-5" style={{ color: 'oklch(20% .02 340)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ backgroundColor: 'white' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === "user"
                      ? "rounded-br-sm"
                      : "rounded-bl-sm"
                  }`}
                  style={{
                    backgroundColor: message.sender === "user" 
                      ? 'oklch(92% .04 340)' 
                      : 'oklch(96% .02 340)',
                    color: 'oklch(20% .02 340)'
                  }}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  {message.action && (
                    <button
                      onClick={() => handleAction(message.action, message.data)}
                      className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 w-full"
                      style={{
                        backgroundColor: 'oklch(92% .04 340)',
                        color: 'oklch(20% .02 340)'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(92% .04 340)'}
                    >
                      {message.action === "whatsapp" ? "Chat on WhatsApp" : 
                       message.action === "occasions" ? "View Occasions" : 
                       message.action === "categories" || message.action === "browse" ? "Browse Products" :
                       "View Details"}
                    </button>
                  )}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestion(suggestion)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
                          style={{
                            backgroundColor: 'oklch(92% .04 340)',
                            color: 'oklch(20% .02 340)'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(92% .04 340)'}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-t-2 flex gap-2 overflow-x-auto"
            style={{ borderColor: 'oklch(92% .04 340)', backgroundColor: 'oklch(96% .02 340)' }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300"
                style={{
                  backgroundColor: 'oklch(92% .04 340)',
                  color: 'oklch(20% .02 340)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(92% .04 340)'}
              >
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t-2"
            style={{ borderColor: 'oklch(92% .04 340)' }}>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-full text-sm border-2 focus:outline-none transition-all duration-300"
                style={{
                  borderColor: 'oklch(92% .04 340)',
                  backgroundColor: 'white',
                  color: 'oklch(20% .02 340)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'oklch(88% .06 340)'}
                onBlur={(e) => e.target.style.borderColor = 'oklch(92% .04 340)'}
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-full font-semibold transition-all duration-300 hover:scale-110 active:scale-95"
                style={{
                  backgroundColor: 'oklch(92% .04 340)',
                  color: 'oklch(20% .02 340)'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'oklch(88% .06 340)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'oklch(92% .04 340)'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
