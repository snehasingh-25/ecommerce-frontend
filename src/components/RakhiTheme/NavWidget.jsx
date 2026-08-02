import { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import hangingSrc from "./assets/hanging-rakhi.png";
import pendantSrc from "./assets/hanging-pendant.png";
import { InjectPortal } from "./injectHost";

const PHONE_MAX = 640;
const DESKTOP_MIN = 1024;
const LOGO_GAP_PHONE = 24;

function findNav() {
  return document.querySelector("nav.sticky, nav");
}

function findLogoLink(nav) {
  return (
    nav.querySelector('.max-w-7xl a[href="/"]') ||
    nav.querySelector(".max-w-7xl a img")?.closest("a") ||
    null
  );
}

function findRow(nav) {
  return nav.querySelector(".max-w-7xl > .flex.items-center") || nav.querySelector(".max-w-7xl > .flex");
}

function placeInNav(nav, host) {
  host.className = "rakhi-nav-festive";
  nav.insertBefore(host, nav.firstChild);
  nav.classList.add("rakhi-nav--festive");
}

function setBadgeLeft(nav, leftPx, maxW) {
  nav.style.setProperty("--rakhi-badge-left", `${Math.max(0, leftPx)}px`);
  if (maxW != null) {
    nav.style.setProperty("--rakhi-badge-max-w", `${Math.max(72, maxW)}px`);
  }
}

function syncBadgePosition(nav) {
  if (!nav) return;

  const logo = findLogoLink(nav);
  const actions = nav.querySelector(".rakhi-nav-festive__actions");
  if (!actions) return;

  const navRect = nav.getBoundingClientRect();
  const width = window.innerWidth;

  // Desktop: hide widget
  if (width >= DESKTOP_MIN) {
    nav.setAttribute("data-rakhi-badge", "hidden");
    return;
  }

  nav.setAttribute("data-rakhi-badge", width <= PHONE_MAX ? "phone" : "tablet");

  // Phone: beside logo
  if (width <= PHONE_MAX) {
    if (!logo) return;
    const logoRect = logo.getBoundingClientRect();
    setBadgeLeft(nav, logoRect.right - navRect.left + LOGO_GAP_PHONE, Math.min(230, width * 0.42));
    return;
  }

  // Tablet: CSS centers the full-width label; clear phone left offset
  nav.style.removeProperty("--rakhi-badge-left");
  nav.style.setProperty("--rakhi-badge-max-w", "none");
}

/** Full festive navbar chrome injected into <nav> — no Navbar.jsx edits. */
export default function NavWidget() {
  const findParent = useCallback(findNav, []);
  const place = useCallback(placeInNav, []);

  useEffect(() => {
    const nav = findNav();
    if (!nav) return undefined;

    const sync = () => syncBadgePosition(nav);
    sync();

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
    const row = findRow(nav);
    const logo = findLogoLink(nav);
    if (ro) {
      ro.observe(nav);
      if (row) ro.observe(row);
      if (logo) ro.observe(logo);
    }

    window.addEventListener("resize", sync);
    const t1 = window.setTimeout(sync, 50);
    const t2 = window.setTimeout(sync, 300);
    const t3 = window.setTimeout(sync, 800);

    return () => {
      window.removeEventListener("resize", sync);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      ro?.disconnect();
      nav.style.removeProperty("--rakhi-badge-left");
      nav.style.removeProperty("--rakhi-badge-max-w");
      nav.removeAttribute("data-rakhi-badge");
    };
  }, []);

  return (
    <InjectPortal findParent={findParent} place={place}>
      <div className="rakhi-nav-festive__shell" aria-hidden="true">
        <div className="rakhi-nav-festive__thread" />
        <div className="rakhi-nav-festive__beads" />
        <img
          src={hangingSrc}
          alt=""
          className="rakhi-nav-festive__hang rakhi-nav-festive__hang--left"
          draggable={false}
        />
        <img
          src={hangingSrc}
          alt=""
          className="rakhi-nav-festive__hang rakhi-nav-festive__hang--right"
          draggable={false}
        />
        <div className="rakhi-nav-festive__glow" />
      </div>

      <div className="rakhi-nav-festive__actions">
        <Link to="/occasion" className="rakhi-nav-festive__badge">
          <img src={pendantSrc} alt="" className="rakhi-nav-festive__badge-icon" draggable={false} />
          <span className="rakhi-nav-festive__badge-text">
            <strong>Raksha Bandhan</strong>
            <em>Shop the Collection</em>
          </span>
        </Link>
      </div>
    </InjectPortal>
  );
}
