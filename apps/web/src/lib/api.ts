import type { CreateLinkResponse } from "@url-shortener/shared";
import { API_BASE_URL } from "@/lib/env";

export async function createLink(longUrl: string): Promise<CreateLinkResponse> {

  const res = await fetch(`${API_BASE_URL}/api/links`, {
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
  const res = await fetch(`${API_BASE_URL}/api/links/recent`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch recent links");
  }

  return res.json();
}

export async function deleteLink(id: string | number) {
  const res = await fetch(`${API_BASE_URL}/api/links/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export async function clearLinks() {
  const res = await fetch(`${API_BASE_URL}/api/links`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to clear");
  return res.json();
}
