import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// For local development, run `vercel dev` which serves both the Vite frontend
// and the serverless functions under a single port — no proxy configuration
// needed.  If you still want to run the legacy FastAPI backend locally, set
// VITE_API_BASE_URL=http://localhost:3001/api in your .env file.
export default defineConfig({
  plugins: [react()],
})
