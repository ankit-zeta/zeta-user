/**
 * Converts any thrown error into a user-safe string.
 * Our own server-side business messages are plain English and pass through.
 * Anything that smells like transport/framework internals is replaced by the
 * provided fallback so users never see "[CONVEX A(...)] Server Error" etc.
 */
const INTERNAL_PATTERN =
  /CONVEX|Server Error|Request ID|Called by client|fetch failed|Failed to fetch|NetworkError|WebSocket|ECONNREFUSED|TypeError|ReferenceError/i;

export function friendlyError(err: unknown, fallback: string): string {
  let raw = "";
  if (err instanceof Error) raw = err.message;
  else if (typeof err === "string") raw = err;

  if (!raw || INTERNAL_PATTERN.test(raw)) return fallback;
  return raw;
}
