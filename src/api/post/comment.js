import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/comment/lists',
    method: 'get',
    params: query
  })
}

export function updateComment(data) {
  return request({
    url: '/admin/comment/update',
    method: 'post',
    data
  })
}

export function deleteComment(data) {
  return request({
    url: '/admin/comment/delete',
    method: 'post',
    data
  })
}
