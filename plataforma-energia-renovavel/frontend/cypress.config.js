import { defineConfig } from 'cypress'
// E2E (Cap. 10 – Sistema): roda contra `npm run dev` (modo demonstração, sem API)
export default defineConfig({ e2e: { baseUrl: 'http://localhost:5173', video: false, supportFile: false } })
