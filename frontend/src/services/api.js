import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If a logged-in session expires, clear it and go to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem("token")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Extract a readable error message from an Axios error
export const getErrorMessage = (err, fallback = "Something went wrong") => {
  if (!err.response) return "Cannot reach the server. Is the backend running?";
  const d = err.response.data;
  return d?.message || d?.error || (Array.isArray(d?.errors) && d.errors[0]?.msg) || fallback;
};

// Backend responses may be wrapped; normalize them
const pickTask = (data) => data?.task || data?.data || data;
const pickTasks = (data) =>
  Array.isArray(data) ? data : data?.tasks || data?.data || [];

export const authService = {
  register: (payload) => api.post("/auth/register", payload),
  login: (payload) => api.post("/auth/login", payload),
  me: () => api.get("/auth/me"),
};

export const taskService = {
  getAll: async () => pickTasks((await api.get("/tasks")).data),
  getById: async (id) => pickTask((await api.get(`/tasks/${id}`)).data),
  create: async (payload) => pickTask((await api.post("/tasks", payload)).data),
  update: async (id, payload) => pickTask((await api.put(`/tasks/${id}`, payload)).data),
  remove: (id) => api.delete(`/tasks/${id}`),
};

export default api;
