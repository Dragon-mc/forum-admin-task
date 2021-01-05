import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/userlist/lists',
    method: 'get',
    params: query
  })
}

export function updateUser(data) {
  return request({
    url: '/admin/userlist/update',
    method: 'post',
    data
  })
}

export function deleteUser(data) {
  return request({
    url: '/admin/userlist/delete',
    method: 'post',
    data
  })
}
