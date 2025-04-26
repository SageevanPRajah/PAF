// lib/api.ts

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:8080/api'

interface LoginRequest {
  username: string
  password: string
}

interface AuthResponse {
  access_token: string
  refresh_token: string
}

export async function loginRequest(
  credentials: LoginRequest
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  })

  if (!res.ok) {
    throw new Error('Login failed')
  }

  return res.json()
}

export async function getCurrentUser() {
  const res = await fetch(`${API_URL}/auth/me`, { method: 'GET' })
  if (!res.ok) {
    throw new Error('Failed to fetch user profile')
  }
  return res.json()
}

export function getAccessToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }
  return null
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
  }
}

export function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

/**
 * A helper fetch that automatically:
 *  • Prefixes requests with API_URL
 *  • Attaches the Bearer token
 *  • Detects FormData vs JSON bodies
 *  • Throws on non-2xx and returns parsed JSON
 */
export async function authFetch<T = unknown>(
  path: string,
  options: RequestInit & { body?: any } = {}
): Promise<T> {
  // Build full URL
  const url = `${API_URL}${path}`

  // Grab the token
  const token = getAccessToken()

  // Prepare headers (we’ll add JSON header below if needed)
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  // Determine the body to send
  let body: BodyInit | undefined
  if (options.body instanceof FormData) {
    // For FormData, let the browser set the multipart headers
    body = options.body
  } else if (options.body !== undefined) {
    // For any non-FormData body, send JSON
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(options.body)
  }

  // Attach the Authorization header if we have a token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Perform the fetch
  const res = await fetch(url, {
    ...options,
    headers,
    body,
  })

  // Throw with the response text on error
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error ${res.status}: ${text}`)
  }

  // Parse JSON or return an empty object if no body
  const text = await res.text()
  return text ? JSON.parse(text) : ({} as T)
}
