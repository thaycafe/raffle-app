const STORAGE_KEY = 'raffleAuth'

export function getAuth() {
  return sessionStorage.getItem(STORAGE_KEY) || ''
}

export function setAuth(token) {
  sessionStorage.setItem(STORAGE_KEY, token)
}

export function clearAuth() {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function authHeader() {
  const token = getAuth()
  return token ? { Authorization: `Basic ${token}` } : {}
}

export function encodeCredentials(username, password) {
  return btoa(`${username}:${password}`)
}