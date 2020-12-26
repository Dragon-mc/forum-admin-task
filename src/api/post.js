import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/post/lists',
    method: 'get',
    params: query
  })
}

export function fetchSubCate() {
  return request({
    url: '/admin/post/subCate',
    method: 'get'
  })
}

export function updatePost(data) {
  return request({
    url: '/admin/post/update',
    method: 'post',
    data
  })
}

export function deletePost(data) {
  return request({
    url: '/admin/post/delete',
    method: 'post',
    data
  })
}

export function updateStatus(query) {
  return request({
    url: '/admin/post/updateStatus',
    method: 'get',
    params: query
  })
}
