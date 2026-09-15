import { useEffect } from "react";
import { useLocation } from "wouter";

export function ScrollToTop() {
  const [pathname] = useLocation();
  useEffect(() => {
    // Don't scroll to top if there's a hash anchor — let the browser handle it
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
}
