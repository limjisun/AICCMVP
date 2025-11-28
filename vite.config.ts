import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/aiccmvp/',  // GitHub repository 이름으로 변경하세요
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
