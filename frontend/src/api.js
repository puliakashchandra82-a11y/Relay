const BASE = "http://localhost:8000/api";

function headers() {
  const token = localStorage.getItem("relay_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  register: (data) =>
    fetch(`${BASE}/auth/register`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handle),
  login: (data) =>
    fetch(`${BASE}/auth/login`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handle),
  me: () => fetch(`${BASE}/me`, { headers: headers() }).then(handle),
  types: () => fetch(`${BASE}/types`).then(handle),
  locations: () => fetch(`${BASE}/locations`).then(handle),
  providers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${BASE}/providers${qs ? `?${qs}` : ""}`).then(handle);
  },
  provider: (id) => fetch(`${BASE}/providers/${id}`).then(handle),
  book: (class_id) =>
    fetch(`${BASE}/bookings`, { method: "POST", headers: headers(), body: JSON.stringify({ class_id }) }).then(handle),
  myBookings: () => fetch(`${BASE}/bookings/me`, { headers: headers() }).then(handle),
  cancelBooking: (id) => fetch(`${BASE}/bookings/${id}`, { method: "DELETE", headers: headers() }).then(handle),
  toggleFavorite: (providerId) =>
    fetch(`${BASE}/favorites/${providerId}`, { method: "POST", headers: headers() }).then(handle),
  myFavorites: () => fetch(`${BASE}/favorites/me`, { headers: headers() }).then(handle),
  adminStats: () => fetch(`${BASE}/admin/stats`, { headers: headers() }).then(handle),
  adminBookings: () => fetch(`${BASE}/admin/bookings`, { headers: headers() }).then(handle),
  adminCreateProvider: (data) =>
    fetch(`${BASE}/admin/providers`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handle),
  adminCreateClass: (data) =>
    fetch(`${BASE}/admin/classes`, { method: "POST", headers: headers(), body: JSON.stringify(data) }).then(handle),
};
