import { useEffect, useState } from "react";

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const media = window.matchMedia(query);

    function handleChange(event) {
      setMatches(event.matches);
    }

    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    // Legacy browsers
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [query]);

  return matches;
}
