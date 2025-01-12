import react from '@vitejs/plugin-react'
import type { ConfigEnv, UserConfig } from 'vite'
import { defineConfig, mergeConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { external, getBuildConfig, getBuildDefine, pluginHotRestart } from './vite.base.config'

// https://vitejs.dev/config
export default defineConfig((env) => {
  const forgeEnv = env as ConfigEnv<'build'>
  const { forgeConfigSelf } = forgeEnv
  const define = getBuildDefine(forgeEnv)
  const config: UserConfig = {
    server: {
      watch: {
        usePolling: true,
      },
    },
    build: {
      lib: {
        entry: forgeConfigSelf.entry!,
        fileName: () => '[name].js',
        formats: ['cjs'],
      },
      rollupOptions: {
        external,
      },
    },
    optimizeDeps: {
      include: ['toml'],
    },
    plugins: [react(), pluginHotRestart('restart'), viteStaticCopy({
      targets: [
        {
          src: 'assets', // Source folder relative to the project root
          dest: './', // Destination folder relative to the output directory
        },
      ],
    })],
    define,
    resolve: {
      // Load the Node.js entry.
      mainFields: ['module', 'jsnext:main', 'jsnext'],
    },
  }

  return mergeConfig(getBuildConfig(forgeEnv), config)
})
