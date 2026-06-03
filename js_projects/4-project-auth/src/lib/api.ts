const API_BASE = "http://localhost:5000/api";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("auth_token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();

    if (!res.ok) {
      return { error: json.message || "Something went wrong" };
    }

    return { data: json };
  } catch {
    return { error: "Network error. Is the backend running?" };
  }
}

export interface AuthResponse {
  message: string;
  token: string;
}

export interface ProfileResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
  };
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getProfile: () => request<ProfileResponse>("/auth/profile"),

  updateProfile: (body: { name?: string; email?: string }) =>
    request<ProfileResponse>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  deleteAccount: () =>
    request<{ message: string }>("/auth/profile", {
      method: "DELETE",
    }),

  forgotPassword: (body: { email: string }) =>
    request<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  resetPassword: (body: { token: string; password: string }) =>
    request<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
