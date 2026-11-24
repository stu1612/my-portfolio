/**
 * Whether a nav link points at the current page. The index ("/") matches only
 * itself; other links also match their child pages (/blog/post marks Blog).
 */
export function isCurrent(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
