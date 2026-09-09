import type { TFunction } from "i18next";

/**
 * Formats a date string as a relative label ("just now", "3 mins ago", etc.)
 * falling back to a localized short date (e.g. "Mar 2" / "3月2日") for older dates.
 *
 * Used by: ChatroomList, PracticeSessionList
 */
export function formatRelativeDate(
  dateString: string,
  locale: string,
  t: TFunction,
): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t("chat.justNow");
  if (diffMins < 60) return t("chat.minutesAgo", { count: diffMins });
  if (diffHours < 24) return t("chat.hoursAgo", { count: diffHours });
  if (diffDays < 7) return t("chat.daysAgo", { count: diffDays });

  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

/**
 * Formats a date string as a localized short date with year.
 * e.g. "Mar 2, 2026" / "2026年3月2日"
 *
 * Used by: StatisticsPracticeHistory
 */
export function formatShortDateWithYear(
  dateString: string,
  locale: string,
): string {
  return new Date(dateString).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a date string as a localized long date with time.
 * e.g. "March 2, 2026 at 10:30 AM" / "2026年3月2日 上午10:30"
 *
 * Used by: AccountForm
 */
export function formatLongDateTime(dateString: string, locale: string): string {
  return new Date(dateString).toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formats a date string into separate localized date and weekday strings.
 * e.g. { date: "Mar 2", weekday: "Monday" } / { date: "3月2日", weekday: "星期一" }
 *
 * Used by: StatisticsActivityChart
 */
export function formatActivityDate(
  dateString: string,
  locale: string,
): { date: string; weekday: string } {
  const d = new Date(dateString);
  return {
    date: d.toLocaleDateString(locale, { month: "short", day: "numeric" }),
    weekday: d.toLocaleDateString(locale, { weekday: "long" }),
  };
}
