const STORAGE_KEY = 'raffleAuth'

export function getAuth(): string {
  return sessionStorage.getItem(STORAGE_KEY) ?? ''
}

export function setAuth(token: string): void {
  sessionStorage.setItem(STORAGE_KEY, token)
}

export function clearAuth(): void {
  sessionStorage.removeItem(STORAGE_KEY)
}

export function authHeader(): Record<string, string> {
  const token = getAuth()
  return token ? { Authorization: `Basic ${token}` } : {}
}

export function encodeCredentials(username: string, password: string): string {
  return btoa(`${username}:${password}`)
}
