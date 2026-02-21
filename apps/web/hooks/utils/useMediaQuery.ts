import { useState, useEffect } from 'react';

/**
 * Hook for responsive design with media queries
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    
    // Modern browsers
    if (media.addEventListener) {
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    } else {
      // Legacy browsers
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [matches, query]);

  return matches;
}

/**
 * Common breakpoint hooks
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
export const useIsTouchDevice = () => useMediaQuery('(pointer: coarse)');