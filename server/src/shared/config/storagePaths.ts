import path from 'path'
import fs from 'fs'

export function getStorageDir(): string {
  const configured = process.env.STORAGE_PATH?.trim()
  const dir = configured || path.join(process.cwd(), 'storage')
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export function getPublicBaseUrl(): string {
  return (
    process.env.PUBLIC_URL?.trim() ||
    process.env.RENDER_EXTERNAL_URL?.trim() ||
    `http://localhost:${process.env.PORT || 8000}`
  ).replace(/\/$/, '')
}

export function getPublicFileUrl(filename: string): string {
  return `${getPublicBaseUrl()}/api/media/local/${encodeURIComponent(filename)}`
}
