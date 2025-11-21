import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
      labs: {
        VDatePicker: true,
      },
    }),
  ],
  base: '/', // 루트 경로 설정 (nginx 하위 도메인일 경우 중요)
  build: {
    outDir: 'aircontrol',  // 빌드 결과물 폴더
    assetsDir: 'assets',   // 정적 자산 폴더
    sourcemap: false,      // 소스맵 비활성화 (기본 true → 보안상 false 권장)
    minify: 'esbuild',     // 코드 압축
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: 'localhost',
    proxy: {
      '/modbus': {
        // target: 'http://172.30.1.2:8090',
        // target: 'http://10.150.95.101:8091',
        target: 'http://dev-aircontrol.hd-hmd.com:8091/aircontrolProxy', //개발
        // target: 'https://aircontrol.hd-hmd.com/aircontrolProxy', //운영
        changeOrigin: true, // 헤더의 origin 변경 (CORS 우회)
        secure: false, // HTTPS 인증 무시 (http일 경우 false)
        ws: false,
        headers: {
          Accept: 'text/event-stream',
          Connection: 'keep-alive',
        },
        // rewrite: path => path.replace(/^\/api/, '/aircontrolProxy/modbus'),
      },
      '/api': {
        // target: 'http://172.30.1.2:8090',
        // target: 'http://10.150.95.101:8091',
        target: 'http://dev-aircontrol.hd-hmd.com:8091/aircontrolProxy', //개발
        // target: 'https://aircontrol.hd-hmd.com/aircontrolProxy', //운영
        changeOrigin: true,
        secure: false,
        // rewrite: path => path.replace(/^\/api/, '/aircontrolProxy/api'),
      },
    },
  },
})
