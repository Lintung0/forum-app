


export function setToken(token: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("token", token);
  } catch {
    
  }
}
