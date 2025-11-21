import request from '@/utils/request'
const contextPath = import.meta.env.VITE_SYSTEM_CONTEXT


export function loginSso() {  
  // TODO: contextpath 적용 필요
  return request({
    url: `${contextPath}/sso`,
    meta: {
      apiVersion: '1.0.0',
      useTokenUpdate: true,
      useResponseAll: true,
      useErrorMessage: false,
    },
    method: 'post',      
  })  
}