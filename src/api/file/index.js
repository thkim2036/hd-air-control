import request from '@/utils/request'

const contextPath = import.meta.env.VITE_HIWAY_API_URL

// 파일 업로드 공용 API
export function uploadFiles(file) {
  let data = new FormData()
  for (var i = 0; i < file.length; i++) {
    data.append('file', file[i])
  }

  return request({
    url: `${contextPath}/files`,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
    meta: {
      apiVersion: '2.0.0',
      useUploadProgress: true,
      useProgress: false,
    },
  })
}

export function uploadFile(file) {
  let data = new FormData()
  data.append('file', file)

  return request({
    url: `${contextPath}/file`,
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data,
    meta: {
      apiVersion: '2.0.0',
    },
  })
}


export function getFileInfo(fileGuid) {
  // 조회하는 기준 값은 locale
  return request({
    url: `${contextPath}/files?file_guid=${fileGuid}`,
    method: 'get',
  })
}

export function downloadFile(fileGuid) {
  // 조회하는 기준 값은 locale
  return request({
    url: `${contextPath}/file/${fileGuid}/1`,
    method: 'get',
    responseType: 'blob',
    meta: {
      getContentDisposition: 'true',
      apiVersion: '2.0.0',
    },
  })
}