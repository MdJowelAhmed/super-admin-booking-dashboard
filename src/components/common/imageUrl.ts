export const imageUrl = (path: string) => {
  if (!path || typeof path !== 'string') {
    return ''
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('blob:') ||
    path.startsWith('data:')
  ) {
    return path
  }

  const fromEnv = String(import.meta.env.VITE_API_BASE_URL ?? '').trim()
  const fallbackOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const baseUrl = (fromEnv || fallbackOrigin).replace(/\/+$/, '')
  const rel = path.replace(/^\/+/, '')

  return baseUrl ? `${baseUrl}/${rel}` : `/${rel}`
}