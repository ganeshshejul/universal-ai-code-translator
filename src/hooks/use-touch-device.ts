import { useState, useEffect } from "react";

export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      return (
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouch());

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsTouchDevice(true);
      } else {
        setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
      }
    };
    
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isTouchDevice;
}
