import path from 'path'
import { defineConfig } from 'vite'
import postCssPxToVw from 'postcss-px-to-viewport-8-plugin'
import autoprefixer from 'autoprefixer'
import vue from '@vitejs/plugin-vue'
const baseLess = path.join(__dirname, './src/less/base.less')

// https://vitejs.dev/config/
export default defineConfig({
  base: `/cozeaidemo/`,
  resolve: {
    alias: {
      '@': path.join(__dirname, './src'),
      '#': path.join(__dirname, './types'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import "${baseLess}"`,
        },
      },
    },
    postcss: {
      plugins: [
        autoprefixer(['Android >= 4.0', 'iOS >= 8']),
        postCssPxToVw({
          unitToConvert: 'px', // 要转化的单位
          viewportWidth: 375, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
          viewportHeight: 667, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
          unitPrecision: 2, // 指定`px`转换为视窗单位值的小数位数
          propList: ['*'], // 指定转换的css属性的单位，*代表全部css属性的单位都进行转换
          viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用vw
          fontViewportUnit: 'vw', // 指定字体需要转换成的视窗单位，默认vw
          selectorBlackList: ['.ignore'], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
          minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
          mediaQuery: false, // 允许在媒体查询中转换`px`
          replace: true, // 是否转换后直接更换属性值
          landscape: true, // 是否处理横屏情况
          landscapeUnit: 'vh', // (String) 横屏时使用的单位
          landscapeWidth: 375, // (Number) 横屏时使用的视口宽度
        }),
      ],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: true,
  },
  plugins: [vue()],
})
