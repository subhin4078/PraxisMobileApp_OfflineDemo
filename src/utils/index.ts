import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function buildZodErrorMessage(issues: z.core.$ZodIssue[]): string[] {
  return issues.map((issue) => {
    const joinedPath = issue.path.join(".").replace(".[", "[");
    return `Path <${joinedPath}>: ${issue.message}`;
  });
}

export function cn(...inputs: (string | boolean)[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Prevents duplicate navigations caused by rapid button taps.
 * Uses route-specific tracking to allow debouncing per-route.
 * Returns true if navigation should proceed, false if it should be suppressed.
 */
const _lastNavTime: Record<string, number> = {};
const NAV_DEBOUNCE_MS = 200; // Short debounce to prevent double-clicks while staying responsive

export function shouldNavigate(route?: string): boolean {
  const now = Date.now();
  const key = route || "_default";
  const lastTime = _lastNavTime[key] ?? 0;

  if (now - lastTime < NAV_DEBOUNCE_MS) return false;
  _lastNavTime[key] = now;
  return true;
}
