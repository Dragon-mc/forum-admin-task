import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/admin/subcate/lists',
    method: 'get',
    params: query
  })
}

export function fetchMainCate() {
  return request({
    url: '/admin/subcate/mainCate',
    method: 'get'
  })
}

export function createCate(data) {
  return request({
    url: '/admin/subcate/create',
    method: 'post',
    data
  })
}

export function updateCate(data) {
  return request({
    url: '/admin/subcate/update',
    method: 'post',
    data
  })
}

export function deleteCate(data) {
  return request({
    url: '/admin/subcate/delete',
    method: 'post',
    data
  })
}

export function updateStatus(query) {
  return request({
    url: '/admin/subcate/updateStatus',
    method: 'get',
    params: query
  })
}
