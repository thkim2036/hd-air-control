import axios from '@/plugins/axios'
import { baseURL } from '@/config/apiConfig'

export const fetchWeatherAPI = () => {
    // console.log('[📡 fetchWeatherAPI 호출됨]')
        return axios.get(`${baseURL}/api/weather`, {
        headers: {
            Accept: 'application/json'  // ✅ 서버가 JSON 응답을 줄 수 있도록 명시
        }
    })
}