import request from '@/utils/request'

const contextPath = import.meta.env.VITE_SYSTEM_CONTEXT

export function getNoticeList(sysCode) {
  return request({
    url: `${contextPath}/notice/getNoticeList`,
    method: 'get',
    params: {
      sysCode: sysCode
    },
  })
}

export function createNoticeData(data) {
  return request({
    url: `${contextPath}/notice/createNoticeData`,
    method: 'post',
    data
  })
}

export function updateNoticeData(data) {
  return request({
    url: `${contextPath}/notice/updateNoticeData`,
    method: 'put',
    data
  })
}

export function deleteNoticeData(sys_code, seq_no) {
  return request({
    url: `${contextPath}/notice/deleteNoticeData`,
    method: 'delete',
    data: {
      sys_code: sys_code,
      seq_no: seq_no,
    },
  })
}

export function getTodayNoticeList(sysCode) {
  return request({
    url: `${contextPath}/notice/getTodayNoticeList`,
    method: 'get',
    params: {
      sysCode: sysCode
    },
  })
}