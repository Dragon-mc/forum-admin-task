import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/admin/lists',
    method: 'get',
    params: query
  })
}

export function createAdmin(data) {
  return request({
    url: '/admin/admin/create',
    method: 'post',
    data
  })
}

export function updateAdmin(data) {
  return request({
    url: '/admin/admin/update',
    method: 'post',
    data
  })
}

export function deleteAdmin(data) {
  return request({
    url: '/admin/admin/delete',
    method: 'post',
    data
  })
}
