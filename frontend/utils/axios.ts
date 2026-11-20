import axios from "axios";

/**
 * Centralized Axios Instance for BITAINTEL API Calls
 * - baseURL: Express Backend (e.g. http://192.168.0.227:3000/api/v1 or http://localhost:3000/api/v1)
 * - withCredentials: true (automatic HttpOnly JWT Cookie transmission)
 * - Authorization Header: Automatically injected from tab-scoped sessionStorage token
 *   to bypass cross-port/cross-origin SameSite browser cookie restrictions on LAN IP.
 */
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1",
  withCredentials: true,
  
});

const AUTH_TOKEN_KEY = "bitaintel_auth_token";

/**
 * Normalized error thrown by the response interceptor.
 * Keeps the original HTTP response/status available to callers
 * (e.g. vendor.service fallback checks `err.response?.status === 404`).
 */
interface NormalizedApiError extends Error {
  response?: {
    status?: number;
    data?: unknown;
    [key: string]: unknown;
  };
  status?: number;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {}
}

// Request Interceptor: Attach Authorization Bearer token to every API request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    // When accessing via localhost, use localhost:3000 if env is pinned to a stale local network IP
    if (isLocalhost && config.baseURL && config.baseURL.includes("192.168.")) {
      config.baseURL = "http://localhost:3000/api/v1";
    }
  }
  const token = getAuthToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Auto-capture auth token & extract standardized server errors
api.interceptors.response.use(
  (response) => {
    const token = response.data?.data?.token || response.data?.token;
    if (token) {
      setAuthToken(token);
    }
    return response;
  },
  (error) => {
    // If backend returns 401 Unauthorized, clear stale session token
    if (error.response?.status === 401) {
      setAuthToken(null);
    }

    const serverMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Server communication failed. Please check backend.";

    const customError = new Error(serverMessage) as NormalizedApiError;
    if (error.response) {
      customError.response = error.response;
      customError.status = error.response.status;
    }
    return Promise.reject(customError);
  }
);

export default api;
