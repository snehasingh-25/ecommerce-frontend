import hangingSrc from "./assets/hanging-rakhi.png";
import mandalaSrc from "./assets/mandala.svg";
import pendantSrc from "./assets/hanging-pendant.png";

/**
 * Fixed festive decorations — hanging rakhis (photo widget), mandalas, bottom divider.
 * pointer-events: none; does not cover interactive UI.
 */
export default function Overlay() {
  return (
    <>
      <div className="rakhi-mandalas" aria-hidden="true">
        <img src={mandalaSrc} alt="" className="rakhi-overlay__mandala rakhi-overlay__mandala--tl" />
        <img src={mandalaSrc} alt="" className="rakhi-overlay__mandala rakhi-overlay__mandala--tr" />
        <img src={mandalaSrc} alt="" className="rakhi-overlay__mandala rakhi-overlay__mandala--bl" />
        <img src={mandalaSrc} alt="" className="rakhi-overlay__mandala rakhi-overlay__mandala--br" />
      </div>

      <div className="rakhi-overlay" aria-hidden="true">
        <img
          src={hangingSrc}
          alt=""
          className="rakhi-overlay__hang rakhi-overlay__hang--left"
          draggable={false}
        />
        <img
          src={hangingSrc}
          alt=""
          className="rakhi-overlay__hang rakhi-overlay__hang--right"
          draggable={false}
        />

        <img
          src={pendantSrc}
          alt=""
          className="rakhi-overlay__float-pendant rakhi-overlay__float-pendant--l"
          draggable={false}
        />
        <img
          src={pendantSrc}
          alt=""
          className="rakhi-overlay__float-pendant rakhi-overlay__float-pendant--r"
          draggable={false}
        />

        <div className="rakhi-overlay__divider">
          <span className="rakhi-overlay__divider-line" />
          <img src={pendantSrc} alt="" className="rakhi-overlay__divider-icon" draggable={false} />
          <span className="rakhi-overlay__divider-line" />
        </div>
      </div>
    </>
  );
}
