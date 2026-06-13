// Minimal auth helpers untuk kebutuhan import di halaman login/register.
// Disesuaikan dengan cara simpan token yang kamu mau.

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("token", token);
  } catch {
    // ignore
  }
}
