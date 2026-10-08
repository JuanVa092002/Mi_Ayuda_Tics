import fs from 'fs'
import path from 'path'
import { getPublicFileUrl, getStorageDir } from '../config/storagePaths'
import { cloudinary, ensureCloudinaryConfig, getCloudinaryFolder, isCloudinaryEnabled } from '../config/cloudinary'
import { logError } from '../utils/logger'
import { assertValidMediaBuffer } from '../utils/validateMediaBuffer'

export type MediaFolder = 'evidencias' | 'perfiles' | 'storage'

export interface StoredMedia {
  filename: string
  url: string
}

interface MulterMemoryFile {
  buffer: Buffer
  mimetype: string
  originalname: string
}

function extensionFromMime(mimetype: string): string {
  switch (mimetype) {
    case 'image/jpeg':
      return '.jpg'
    case 'image/png':
      return '.png'
    case 'image/gif':
      return '.gif'
    case 'image/webp':
      return '.webp'
    case 'image/heic':
    case 'image/heif':
      return '.heic'
    case 'application/pdf':
      return '.pdf'
    default:
      return '.bin'
  }
}

function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com')
}

async function destroyCloudinaryAsset(publicId: string): Promise<void> {
  const imageResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
  if (imageResult.result === 'ok' || imageResult.result === 'not found') {
    return
  }

  const rawResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
  if (rawResult.result === 'ok' || rawResult.result === 'not found') {
    return
  }

  throw new Error(`No se pudo eliminar el asset ${publicId} en Cloudinary`)
}

async function uploadToCloudinary(
  file: MulterMemoryFile,
  folder: MediaFolder
): Promise<StoredMedia> {
  ensureCloudinaryConfig()

  const baseName = `file-${Date.now()}`
  const rootFolder = getCloudinaryFolder()

  const result = await new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${rootFolder}/${folder}`,
        public_id: baseName,
        resource_type: 'auto',
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error('Cloudinary upload failed'))
          return
        }
        resolve({
          public_id: uploadResult.public_id,
          secure_url: uploadResult.secure_url,
        })
      }
    )
    stream.end(file.buffer)
  })

  return {
    filename: result.public_id,
    url: result.secure_url,
  }
}

function saveToLocalDisk(file: MulterMemoryFile): StoredMedia {
  const ext = path.extname(file.originalname).toLowerCase() || extensionFromMime(file.mimetype)
  const filename = `file-${Date.now()}${ext}`
  const filePath = path.join(getStorageDir(), filename)
  fs.writeFileSync(filePath, file.buffer)
  return {
    filename,
    url: getPublicFileUrl(filename),
  }
}

export async function saveUploadedFile(
  file: MulterMemoryFile,
  folder: MediaFolder
): Promise<StoredMedia> {
  if (!file.buffer?.length) {
    throw new Error('Archivo vacío o no disponible en memoria')
  }

  assertValidMediaBuffer(file.buffer, file.mimetype)

  if (isCloudinaryEnabled()) {
    return uploadToCloudinary(file, folder)
  }

  return saveToLocalDisk(file)
}

export async function deleteStoredMedia(record: {
  filename: string
  url: string
}): Promise<void> {
  if (isCloudinaryUrl(record.url)) {
    try {
      ensureCloudinaryConfig()
      await destroyCloudinaryAsset(record.filename)
    } catch (error) {
      logError('Error al eliminar archivo en Cloudinary', error, { filename: record.filename })
    }
    return
  }

  const localPath = path.join(getStorageDir(), record.filename)
  if (fs.existsSync(localPath)) {
    await fs.promises.unlink(localPath).catch(error => {
      logError('Error al eliminar archivo local', error, { path: localPath })
    })
  }
}

export function getOptimizedMediaUrl(
  record: { filename: string; url: string },
  options?: { width?: number; height?: number }
): string {
  if (!isCloudinaryUrl(record.url) || !isCloudinaryEnabled()) {
    return record.url
  }

  try {
    ensureCloudinaryConfig()
    return cloudinary.url(record.filename, {
      fetch_format: 'auto',
      quality: 'auto',
      crop: options?.width || options?.height ? 'limit' : undefined,
      width: options?.width,
      height: options?.height,
    })
  } catch (error) {
    logError('Error al optimizar URL de Cloudinary, usando URL original', error, {
      url: record.url,
      filename: record.filename,
    })
    return record.url
  }
}
