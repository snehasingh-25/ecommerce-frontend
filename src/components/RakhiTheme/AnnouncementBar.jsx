import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const DISMISS_KEY = "rakhi-season-announce-dismissed";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="rakhi-announce" role="region" aria-label="Raksha Bandhan announcement">
      <div className="rakhi-announce__inner">
        <p className="rakhi-announce__text">
          <span className="rakhi-announce__title">Happy Raksha Bandhan!</span>
          <span className="rakhi-announce__sub">
            {" "}
            Celebrate the bond of love with our exclusive Rakhi Collection.
          </span>
        </p>

        <div className="rakhi-announce__chips" aria-hidden="true">
          <span>Same Day Delivery</span>
          <span>Free Gift Wrapping</span>
          <span>Secure Packaging</span>
        </div>

        <Link to="/occasion" className="rakhi-announce__cta">
          Rakhi Special Offers
        </Link>
      </div>

      <button
        type="button"
        className="rakhi-announce__close"
        onClick={dismiss}
        aria-label="Dismiss announcement"
      >
        ×
      </button>
    </div>
  );
}
