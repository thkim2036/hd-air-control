import axios from '@/plugins/axios'
import { baseURL } from '@/config/apiConfig'

export const fetchSSEMeta = () => {
    //console.log('[📡 fetchSSEMeta 호출됨]')
    return axios.get(`${baseURL}/api/devices`, {
        headers: {
            Accept: 'application/json'  // ✅ 서버가 JSON 응답을 줄 수 있도록 명시
        }
    })
}