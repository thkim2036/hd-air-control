// 📦 유효성 검사 (vee-validate 커스텀 설정)
import './plugins/vee-validate'

// 🎨 폰트 및 스타일
import '@/styles/fonts.scss'
import '@/styles/tabulator/tabulator.min.css'

// 🌐 Vue core
import { createApp } from 'vue'
import App from './App.vue'

// 📦 플러그인
import router from './router'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'
import { useAuthStore } from '@/stores/authStore'

// 🔧 앱 생성 및 플러그인 등록
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)
app.use(i18n)


// 👉 mock 모드(false)일 때만 인터셉터 등록
if (import.meta.env.VITE_USE_MOCK !== 'true') {
    const authStore = useAuthStore()
}

app.mount('#app')
