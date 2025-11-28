import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/AICCMVP/',  // GitHub repository 이름과 일치
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
