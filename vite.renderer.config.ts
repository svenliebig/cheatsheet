import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig } from 'vite'
import tailwindcss from 'tailwindcss'
import { pluginExposeRenderer } from './vite.base.config'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'renderer'>
  const { root, mode, forgeConfigSelf } = forgeEnv
  const name = forgeConfigSelf.name ?? ''

  return {
    root,
    mode,
    base: './',
    build: {
      outDir: `.vite/renderer/${name}`,
      rollupOptions: {
        input: {
          overlay: './overlay.html',
          settings: './settings.html',
        },
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
            return
          }
          warn(warning)
        },
      },
    },
    plugins: [pluginExposeRenderer(name)],
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
        ],
      },
    },
    resolve: {
      preserveSymlinks: true,
    },
    clearScreen: false,
    esbuild: {},

  } as UserConfig
})
