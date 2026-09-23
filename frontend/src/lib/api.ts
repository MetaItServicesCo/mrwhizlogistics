/**
 * Thin client for the FastAPI backend.
 *
 * Auth: the backend issues a JWT from POST /api/auth/login (OAuth2 password
 * flow, so the body must be form-encoded, not JSON). We keep the token in
 * localStorage and attach it as a Bearer header on every admin call.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:8000";

const TOKEN_KEY = "mrwhiz_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* private mode / storage disabled — session stays in memory only */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Turn FastAPI's error payloads into a single readable string. */
async function readError(res: Response): Promise<string> {
  let detail: unknown;
  try {
    const data = await res.json();
    detail = (data as { detail?: unknown })?.detail ?? data;
  } catch {
    return res.statusText || `Request failed (${res.status})`;
  }
  if (typeof detail === "string") return detail;
  // 422 validation errors arrive as [{loc, msg, type}, ...]
  if (Array.isArray(detail)) {
    return detail
      .map((d) => {
        const item = d as { loc?: unknown[]; msg?: string };
        const field = Array.isArray(item.loc) ? item.loc.slice(1).join(".") : "";
        return field ? `${field}: ${item.msg}` : item.msg || "Invalid value";
      })
      .join(", ");
  }
  return res.statusText || `Request failed (${res.status})`;
}

type Body = Record<string, unknown> | FormData | undefined;

async function request<T>(
  method: string,
  path: string,
  body?: Body,
  opts: { auth?: boolean } = {},
): Promise<T> {
  const auth = opts.auth ?? true;
  const headers: Record<string, string> = {};
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  // Never set Content-Type for FormData — the browser adds the multipart boundary.
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    cache: "no-store",
  });

  if (res.status === 401 && auth) {
    clearToken();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (!res.ok) throw new ApiError(res.status, await readError(res));

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T>(path: string, opts?: { auth?: boolean }) => request<T>("GET", path, undefined, opts),
  post: <T>(path: string, body?: Body, opts?: { auth?: boolean }) =>
    request<T>("POST", path, body, opts),
  put: <T>(path: string, body?: Body, opts?: { auth?: boolean }) =>
    request<T>("PUT", path, body, opts),
  patch: <T>(path: string, body?: Body, opts?: { auth?: boolean }) =>
    request<T>("PATCH", path, body, opts),
  del: <T>(path: string, opts?: { auth?: boolean }) =>
    request<T>("DELETE", path, undefined, opts),
};

/** POST /api/auth/login expects application/x-www-form-urlencoded. */
export async function login(email: string, password: string): Promise<string> {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!res.ok) throw new ApiError(res.status, await readError(res));
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

/**
 * Resolve an image path from the API into a browsable URL.
 * The backend stores relative paths and serves them from /uploads.
 */
export function mediaUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/uploads")) return `${API_URL}${path}`;
  if (path.startsWith("uploads/")) return `${API_URL}/${path}`;
  return path; // e.g. /images/... served by Next from /public
}
