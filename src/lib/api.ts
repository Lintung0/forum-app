import axios from "axios";

// Minimal api client untuk keperluan type-check + runtime.
// Ubah seperlunya jika proyek kamu punya base URL/token strategy sendiri.
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/v1",
});

export default api;
