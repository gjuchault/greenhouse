export function isLoggedIn() {
  return Boolean(localStorage.getItem('greenhouse:token'))
}

export function getToken() {
  return localStorage.getItem('greenhouse:token')
}

export function clearToken() {
  localStorage.removeItem('greenhouse:item')
}
