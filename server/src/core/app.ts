import 'dotenv/config'
import express, { type NextFunction, type Request, type Response } from 'express'
import path from 'path'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import { app, server } from '../shared/utils/handleSocket'
import { healthCheck } from './health'
import router from './routes'
import {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  createCorsOriginValidator,
  parseAllowedOrigins,
} from '../shared/config/cors'
import { handleUploadError } from '../shared/middleware/uploadError'

// Liveness probe — antes de CORS/helmet para probes de Render (sin Origin)
app.get('/api/health', healthCheck)

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  app.set('trust proxy', 1)
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

const allowedProdOrigins = parseAllowedOrigins()

app.use(
  cors({
    origin: createCorsOriginValidator(allowedProdOrigins),
    credentials: true,
    methods: [...CORS_ALLOWED_METHODS],
    allowedHeaders: [...CORS_ALLOWED_HEADERS],
    optionsSuccessStatus: 204,
  })
)

app.use(morgan(isProd ? 'combined' : 'dev'))
app.use(express.json())

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'public')))
app.use('/media', express.static(path.join(__dirname, 'media')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/api', router)

app.use(handleUploadError)

app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    next(err)
    return
  }
  if (err.message?.startsWith('CORS blocked')) {
    res.status(500).json({ message: err.message })
    return
  }
  res.status(500).json({ message: 'Error interno del servidor' })
})

export { app, server }
