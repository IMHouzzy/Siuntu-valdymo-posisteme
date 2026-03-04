// src/services/api.js
const API_BASE =
  process.env.REACT_APP_API_URL?.replace(/\/+$/, "") || "http://localhost:5065/api";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", headers, body } = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      ...authHeader(),
      ...headers,
    },
    body,
  });

  // optional: auto-logout on 401
  // if (res.status === 401) localStorage.removeItem("token");

  return res;
}

export const api = {
  get: (path) => request(path),

  postJson: (path, data) =>
    request(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  putJson: (path, data) =>
    request(path, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  del: (path) =>
    request(path, { method: "DELETE" }),

  // for multipart/form-data
  postForm: (path, formData) =>
    request(path, { method: "POST", body: formData }),

  putForm: (path, formData) =>
    request(path, { method: "PUT", body: formData }),
};