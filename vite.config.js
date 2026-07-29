import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: [
            'three',
            'three/examples/jsm/loaders/GLTFLoader'
          ],
        },
      },
    },
  },
  esbuild: {
    keepNames: true,
  }
})
