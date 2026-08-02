import { useCallback } from "react";
import { Link } from "react-router-dom";
import hangingSrc from "./assets/hanging-rakhi.png";
import pendantSrc from "./assets/hanging-pendant.png";
import { InjectPortal } from "./injectHost";

function findFooter() {
  return document.querySelector("footer");
}

function placeInFooter(footer, host) {
  host.className = "rakhi-footer-festive";
  footer.insertBefore(host, footer.firstChild);
  footer.classList.add("rakhi-footer--festive");
}

/** Full festive footer band — no Footer.jsx edits. */
export default function FooterWidget() {
  const findParent = useCallback(findFooter, []);
  const place = useCallback(placeInFooter, []);

  return (
    <InjectPortal findParent={findParent} place={place}>
      <div className="rakhi-footer-festive__band">
        <div className="rakhi-footer-festive__thread" aria-hidden="true" />
        <img
          src={hangingSrc}
          alt=""
          className="rakhi-footer-festive__hang rakhi-footer-festive__hang--left"
          draggable={false}
        />
        <div className="rakhi-footer-festive__center">
          <img src={pendantSrc} alt="" className="rakhi-footer-festive__pendant" draggable={false} />
          <div className="rakhi-footer-festive__copy">
            <p className="rakhi-footer-festive__title">Celebrate Raksha Bandhan</p>
            <p className="rakhi-footer-festive__sub">
              Tie the thread of love with gifts that feel handmade for your sibling
            </p>
          </div>
          <Link to="/occasion" className="rakhi-footer-festive__cta">
            Explore Rakhi Gifts
          </Link>
        </div>
        <img
          src={hangingSrc}
          alt=""
          className="rakhi-footer-festive__hang rakhi-footer-festive__hang--right"
          draggable={false}
        />
      </div>
    </InjectPortal>
  );
}
