import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/admin/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/admin/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout(data) {
  return request({
    url: '/admin/user/logout',
    method: 'post',
    data
  })
}

export function fetchIndexInfo() {
  return request({
    url: '/admin/user/fetchIndexInfo',
    method: 'post'
  })
}

export function uploadAvatar(data) {
  return request({
    url: '/admin/user/uploadAvatar',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data
  })
}

export function setSessionAvatar(data) {
  return request({
    url: '/admin/user/setSessionAvatar',
    method: 'post',
    data
  })
}
