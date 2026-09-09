import { useEffect, useState } from "react";

/**
 * Custom hook to enforce a minimum loading time
 * @param delay - Delay in milliseconds before allowing content to show
 * @returns showLoading - Boolean indicating if loading should still be shown
 */
export function useDelayedLoading(delay: number = 300) {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return showLoading;
}
