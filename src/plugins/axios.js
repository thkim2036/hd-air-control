import axios from 'axios'

// 🔍 모든 요청 로그 출력
axios.interceptors.request.use(config => {
    console.log(`[🚀 요청]: ${config.method?.toUpperCase()} ${config.url}`)
    return config
})

axios.interceptors.response.use(
    response => {
        console.log(`[✅ 응답]: ${response.status} ${response.config.url}`)
        return response
    },
    error => {
        console.error(`[❌ 에러]: ${error.config?.url}`, error)
        return Promise.reject(error)
    }
)

export default axios
