import type { CreateLinkResponse } from "@url-shortener/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
// const API_BASE = "http://localhost:3000";

export async function createLink(longUrl: string): Promise<CreateLinkResponse> {

  console.log(API_BASE);
  const res = await fetch(`${API_BASE}/api/links`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ longUrl }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? "Failed to shorten link");
  }

  return res.json();
}

export async function fetchRecentLinks() {
  const res = await fetch(`${API_BASE}/api/links/recent`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recent links");
  }

  return res.json();
}

export async function deleteLink(id: string | number) {
  const res = await fetch(`${API_BASE}/api/links/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export async function clearLinks() {
  const res = await fetch(`${API_BASE}/api/links`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to clear");
  return res.json();
}
