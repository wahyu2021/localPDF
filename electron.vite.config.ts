import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin({ exclude: ['execa', 'nanoid'] })],
    build: {
      outDir: 'dist/main',
      rollupOptions: {
        external: ['electron', 'path', 'fs', 'child_process', 'crypto', 'os', 'electron-log'],
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        },
        output: {
          format: 'cjs',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin({ exclude: ['execa', 'nanoid'] })],
    build: {
      outDir: 'dist/preload',
      rollupOptions: {
        external: ['electron', 'path', 'fs', 'child_process', 'crypto', 'os', 'electron-log'],
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        },
        output: {
          format: 'cjs',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      }
    }
  },
  renderer: {
    root: 'src/renderer',
    build: {
      outDir: 'dist/renderer',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src/renderer/src'),
        '@shared': resolve(__dirname, 'src/shared')
      }
    },
    plugins: [react()]
  }
})
