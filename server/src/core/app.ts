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
  corsHeaderMap,
  createCorsOriginValidator,
  originIsAllowed,
  parseAllowedOrigins,
} from '../shared/config/cors'
import { handleUploadError } from '../shared/middleware/uploadError'

const isProd = process.env.NODE_ENV === 'production'
const allowedProdOrigins = parseAllowedOrigins()

if (isProd) {
  app.set('trust proxy', 1)
}

function applyPublicHealthCors(req: Request, res: Response): void {
  const origin = req.get('origin') ?? undefined
  if (!originIsAllowed(origin, allowedProdOrigins)) return
  for (const [name, value] of Object.entries(corsHeaderMap(origin))) {
    res.setHeader(name, value)
  }
}

// Liveness stays unauthenticated and never 5xx for a blocked Origin.
// CORS headers are applied only for allowed origins so browser clients can read health.
app.get('/api/health', (req: Request, res: Response, next: NextFunction) => {
  applyPublicHealthCors(req, res)
  next()
}, healthCheck)

app.options('/api/health', (req: Request, res: Response) => {
  applyPublicHealthCors(req, res)
  res.status(204).end()
})

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))

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
