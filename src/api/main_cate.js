import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/maincate/lists',
    method: 'get',
    params: query
  })
}

export function createCate(data) {
  return request({
    url: '/admin/maincate/create',
    method: 'post',
    data
  })
}

export function updateCate(data) {
  return request({
    url: '/admin/maincate/update',
    method: 'post',
    data
  })
}

export function deleteCate(data) {
  return request({
    url: '/admin/maincate/delete',
    method: 'post',
    data
  })
}

export function updateStatus(query) {
  return request({
    url: '/admin/maincate/updateStatus',
    method: 'get',
    params: query
  })
}
