import request from '@/utils/request'

const contextPath = import.meta.env.VITE_SYSTEM_CONTEXT

export function getEmpInfo(emplid) {
  return request({
    url: `${contextPath}/projectExample/getEmpInfo`,
    method: 'get',
    params: {
      emplid: emplid
    },
  })
}
export function setFileUpload(data) {
  return request({
    url: `${contextPath}/projectExample/setFileUpload`,
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
export function getEncrypt(encryText) {
  return request({
    url: `${contextPath}/projectExample/getEncrypt`,
    method: 'post',
    data: {
      encryText,
    },
  })
}
export function getDecrypt(decryText) {
  return request({
    url: `${contextPath}/projectExample/getDecrypt`,
    method: 'post',
    data: {
      decryText,
    },
  })
}
export function setApproval() {
  return request({
    url: `${contextPath}/projectExample/setApproval`,
    method: 'post',
  })
}