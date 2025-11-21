import request from '@/utils/request'
import { baseURL } from '@/config/apiConfig'

export function loginSso() {  
  // console.log('SSO ##### contextPath:: ', `${baseURL}/sso`)
  // TODO: contextpath 적용 필요
  return request({
    url: `${baseURL}/sso`,
    meta: {
      apiVersion: '1.0.0',
      useTokenUpdate: true,
      useResponseAll: true,
      useErrorMessage: false,
    },
    method: 'post',      
  })  
}