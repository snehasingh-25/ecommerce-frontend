// API URL - uses environment variable in production, localhost in development
export const API =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://midnightblue-fish-476058.hostingersite.com");
