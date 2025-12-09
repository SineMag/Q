import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const patientsApi = {
  getAll: () => api.get("/patients"),
  getById: (id: number) => api.get(`/patients/${id}`),
  create: (data: any) => api.post("/patients", data),
  update: (id: number, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: number) => api.delete(`/patients/${id}`),
};

export const queueApi = {
  getAll: (status?: string) => api.get("/queue", { params: { status } }),
  getStats: () => api.get("/queue/stats"),
  checkIn: (data: any) => api.post("/queue/check-in", data),
  update: (id: number, data: any) => api.put(`/queue/${id}`, data),
  delete: (id: number) => api.delete(`/queue/${id}`),
  complete: (id: number) => api.post(`/queue/${id}/complete`),
  getPatientStatus: (patientId: number) =>
    api.get(`/queue/patient/${patientId}`),
};

export const staffApi = {
  getAll: () => api.get("/staff"),
  getAvailable: () => api.get("/staff/available"),
  updateAvailability: (id: number, isAvailable: boolean) =>
    api.put(`/staff/${id}/availability`, { is_available: isAvailable }),
};

export default api;
