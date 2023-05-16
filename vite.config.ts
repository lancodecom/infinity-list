import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path"
import pkg from './package.json'
import styleInject from '@senojs/rollup-plugin-style-inject'

const banner = `
/**
 * Vue3 ${pkg.name} ${pkg.version}
 * (c) Lancode ${new Date().getFullYear()}
 * Contact: ${pkg.author}
 * Website: ${pkg.homepage}
 * @license ${pkg.license}
 */
`

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 提取css到js文件中
    styleInject({
      insertAt: 'top',
    })
  ],
  build: {
    cssCodeSplit: true,
    lib: {
      // 注意此处的路径要配置正确
      entry: resolve("packages/infinity-list/index.ts"),
      name: "infinityList",
      fileName: (format) => `infinity-list.${format}.js`,
      formats: ['es', 'umd'],
    },
    // 自定义构建配置，可直接调整底层Rollup选项；Rollup有一套预设
    // https://rollupjs.org/guide/en/#big-list-of-options
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ["vue"],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: "Vue",
        },
        banner
      },
    },
  }
})
