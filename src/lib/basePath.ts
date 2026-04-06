export const APP_BASE = "/seguros";

export function withBase(path: string) {
  if (!path) return APP_BASE;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${APP_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}