export type Locale = "en" | "zh";

// Returns the locale-prefixed path. English is the root locale (no prefix);
// zh lives under /zh. Used for every internal link on localized pages so nav,
// cards, and cross-links stay within the same locale.
export function localizedPath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return path === "/" ? "/zh" : `/zh${path}`;
}
