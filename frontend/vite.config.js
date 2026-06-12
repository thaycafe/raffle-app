import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite plugin: replace THREE.Clock (deprecated since r183) with a Timer-backed
 * compatible shim so that react-three-fiber's internal `new Clock()` no longer
 * triggers the deprecation warning.  Clock's public API (elapsedTime, getDelta,
 * getElapsedTime, start, stop) is preserved so r3f continues to work unchanged.
 */
function threeClockToTimer() {
  const CLOCK_SHIM = /* js */ `
class Clock {
  constructor(autoStart = true) {
    this.autoStart = autoStart;
    this.running    = false;
    this.elapsedTime = 0;
    this._timer = new Timer();
  }
  start() {
    this._timer.update();
    this.running = true;
  }
  stop() {
    this.running = false;
  }
  getElapsedTime() {
    this.getDelta();
    return this.elapsedTime;
  }
  getDelta() {
    if (this.autoStart && !this.running) { this.start(); return 0; }
    if (!this.running) return 0;
    this._timer.update();
    const delta = this._timer.getDelta();
    this.elapsedTime += delta;
    return delta;
  }
}
`

  return {
    name: 'three-clock-to-timer',
    transform(code, id) {
      // Match the pre-built bundle (prod) and individual source file (dev)
      if (
        !/three[/\\]build[/\\]three\.core\.js/.test(id) &&
        !/three[/\\]src[/\\]core[/\\]Clock\.js/.test(id)
      )
        return null

      // Replace just the Clock class body with our Timer-backed shim.
      // Use a tight regex anchored to `class Clock` to avoid accidentally
      // matching earlier content in the bundled file.
      const replaced = code.replace(
        /class Clock \{[\s\S]*?\n\}/,
        CLOCK_SHIM
      )

      if (replaced === code) {
        // Fallback: just strip the single warn() call if the class regex didn't match
        return code.replace(
          /warn\s*\(\s*['"]Clock: This module has been deprecated\. Please use THREE\.Timer instead\.['"]\s*\);\s*\/\/ @deprecated, r183/,
          '/* Clock: patched to Timer-backed implementation by Vite plugin */'
        )
      }

      return replaced
    },
  }
}

export default defineConfig({
  plugins: [threeClockToTimer(), react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three/examples/jsm')) return 'three-examples'
          if (id.includes('node_modules/three/build/three.module.js')) return 'three-core'
          if (id.includes('node_modules/three/src/')) {
            const match = id.match(/node_modules\/three\/src\/([^/]+)/)
            const area = match?.[1] ?? 'misc'
            return `three-${area}`
          }
          if (id.includes('node_modules/@react-three/fiber')) return 'three-fiber'
          if (id.includes('node_modules/@react-three/drei')) return 'three-drei'
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-vendor'
          }
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
