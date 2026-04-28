import axios from 'axios'

// Client for the admin-app's own backend (Express server).
// In development Vite proxies /admin-api → http://localhost:4000.
// In production the Express server serves both API and static files at the same origin.
export const localClient = axios.create({
  timeout: 15000,
})
