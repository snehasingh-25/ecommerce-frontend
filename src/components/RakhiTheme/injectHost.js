import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Mount a portal host into an existing DOM node; removes host on cleanup
 * so Navbar/Footer stay free of seasonal source code.
 */
export function useInjectHost({ findParent, place }) {
  const [host, setHost] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let hostEl = null;
    let tries = 0;

    const attach = () => {
      if (cancelled) return;
      const parent = findParent();
      if (!parent) {
        if (tries++ < 40) requestAnimationFrame(attach);
        return;
      }
      hostEl = document.createElement("div");
      hostEl.setAttribute("data-rakhi-inject", "1");
      place(parent, hostEl);
      if (!cancelled) setHost(hostEl);
    };

    attach();

    return () => {
      cancelled = true;
      if (hostEl?.parentNode) hostEl.parentNode.removeChild(hostEl);
      setHost(null);
    };
  }, [findParent, place]);

  return host;
}

export function InjectPortal({ findParent, place, children }) {
  const host = useInjectHost({ findParent, place });
  if (!host) return null;
  return createPortal(children, host);
}
