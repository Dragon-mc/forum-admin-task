import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/feedback/lists',
    method: 'get',
    params: query
  })
}

export function replyUser(query) {
  return request({
    url: '/admin/feedback/replyUser',
    method: 'get',
    params: query
  })
}

export function deleteFeedback(query) {
  return request({
    url: '/admin/feedback/delete',
    method: 'get',
    params: query
  })
}
