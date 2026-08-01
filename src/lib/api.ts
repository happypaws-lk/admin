"use client";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
    public readonly detail?: string,
  ) {
    super(title);
    this.name = "ApiError";
  }
}

let refreshing: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (refreshing) return refreshing;
  refreshing = fetch("/api/auth/refresh", { method: "POST" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(path, { ...init, credentials: "include" });

  if (res.status === 401) {
    const refreshed = await doRefresh();
    if (refreshed) {
      return fetch(path, { ...init, credentials: "include" });
    }
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return res;
  }

  return res;
}

async function parseError(res: Response): Promise<never> {
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    // ignore parse failure
  }
  throw new ApiError(
    res.status,
    (data["title"] as string | undefined) ?? res.statusText,
    (data["detail"] as string | undefined),
  );
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) return path;
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

export const apiClient = {
  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined | null>,
  ): Promise<T> {
    const url = buildUrl(path, params);
    const res = await request(url);
    if (!res.ok) return parseError(res);
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  },

  async post<T = void>(path: string, body?: unknown): Promise<T> {
    const res = await request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return parseError(res);
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  },

  async put<T = void>(path: string, body?: unknown): Promise<T> {
    const res = await request(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) return parseError(res);
    if (res.status === 204) return undefined as unknown as T;
    return res.json() as Promise<T>;
  },

  async delete(path: string): Promise<void> {
    const res = await request(path, { method: "DELETE" });
    if (!res.ok) return parseError(res);
  },
};
