import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: [
            'three',
            'three/webgpu',
            'three/tsl',
            'three/examples/jsm/loaders/GLTFLoader',
            'three/addons/tsl/display/DepthOfFieldNode.js'
          ],
        },
      },
    },
  },
  esbuild: {
    keepNames: true,
  }
})
