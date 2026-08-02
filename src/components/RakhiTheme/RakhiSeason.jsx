import { useEffect } from "react";
import AnnouncementBar from "./AnnouncementBar";
import Overlay from "./Overlay";
import FloatingPetals from "./FloatingPetals";
import Sparkles from "./Sparkles";
import NavWidget from "./NavWidget";
import FooterWidget from "./FooterWidget";
import "./SeasonStyles.css";

/**
 * Premium Raksha Bandhan seasonal chrome.
 * Mount once above Navbar in App.jsx. Remove this mount + folder to restore site.
 * Nav/Footer widgets are injected at runtime (no edits to those files).
 */
export default function RakhiSeason() {
  useEffect(() => {
    document.documentElement.classList.add("rakhi-season");
    return () => {
      document.documentElement.classList.remove("rakhi-season");
      document.querySelector("nav")?.classList.remove("rakhi-nav--festive");
      document.querySelector("footer")?.classList.remove("rakhi-footer--festive");
      document.querySelectorAll("[data-rakhi-inject]").forEach((el) => el.remove());
    };
  }, []);

  return (
    <>
      <AnnouncementBar />
      <Overlay />
      <FloatingPetals />
      <Sparkles />
      <NavWidget />
      <FooterWidget />
    </>
  );
}
