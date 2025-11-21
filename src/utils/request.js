// src/utils/request.js
import axios from 'axios'
import { getToken, setToken } from './token'
import { useUserStore } from '@/stores/user'

const service = axios.create({
  baseURL: '/', // 필요 시 수정
  timeout: 20000,
})

service.interceptors.request.use(config => {
  config.headers['X-Auth-Token'] = getToken()
  config.headers['X-APIVERSION'] = '1.0.0'
  config.headers['X-APP'] = 'aircontrol'
  return config
})

service.interceptors.response.use(response => {

  const newToken = response.headers['hiway-x-auth-token'] || response.headers['x-auth-token']
  const userId = response.headers['cacs-user-id']
  const userNm = response.headers['cacs-user-nm']
  const manager = response.headers['cacs-manager']

  // console.log('##### SSO > newToken......', newToken)
  // console.log('##### SSO > userId......', userId)
  // console.log('##### SSO > userNm......', userNm)
  // console.log('##### SSO > manager......', manager)

  if (newToken) {
    setToken(newToken)
    useUserStore().setUserToken(newToken)
  }
  if (userId) {
    useUserStore().setUserId(userId)
  }
  if (userNm) {
    useUserStore().setUserNm(userNm)
  }
  if (manager) {
    useUserStore().setUserAuth(manager)
  }

  return response

}, error => {
  console.error('##### SSO 요청 실패:', error.message)
  return Promise.reject(error)
})

export default service
