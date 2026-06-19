const BASE = import.meta.env.VITE_API_URL || '/api'

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  try {
    const res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
    return data
  } catch (e) {
    throw e
  }
}

async function requestForm(method, path, formData, token) {
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(BASE + path, { method, headers, body: formData })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data.status === 'error') {
    throw new Error(data.message || `HTTP ${res.status}`)
  }
  return data
}

export const api = {
  get: (path, token) => request('GET', path, null, token),
  post: (path, body, token) => request('POST', path, body, token),
  put: (path, body, token) => request('PUT', path, body, token),
  delete: (path, token) => request('DELETE', path, null, token),
  postForm: (path, formData, token) => requestForm('POST', path, formData, token),
}

export default api
