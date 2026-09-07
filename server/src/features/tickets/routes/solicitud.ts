import { Router } from 'express'
import { authMiddleware } from '../../../shared/middleware/session'
import { checkRol } from '../../../shared/middleware/rol'
import {
  getSolicitudId,
  getSolicitud,
  getHistorialSolicitud,
  getSolicitudesPendientes,
  crearSolicitud,
  historialSolicitudesCreadas,
  asignarTecnicoSolicitud,
  getSolicitudesAsignadas,
  getSolicitudesFinalizadas,
  deleteSolicitud,
  getSolicitudHistorial,
} from '../controllers/solicitud'
import {
  reasignarTecnicoSolicitud,
  iniciarAtencionSolicitud,
  agregarActualizacionSolicitud,
  solicitarInformacionSolicitud,
  responderInformacionSolicitud,
  registrarSolucionParcial,
  registrarSolucionTotal,
  confirmarSolucionSolicitud,
  reabrirSolicitud,
  cancelarSolicitud,
} from '../controllers/solicitud-workflow'
import { uploadMiddleware } from '../../../shared/utils/handleStorage'
import { handleUploadError } from '../../../shared/middleware/uploadError'
import { uploadLimiter } from '../../../shared/config/rateLimit'
import { validarSolicitud } from '../../../shared/validators/solicitud'
import {
  validarMensajeWorkflow,
  validarMotivoWorkflow,
  validarReasignarTecnico,
  validarSolucionParcial,
  validarSolucionTotal,
} from '../validators/solicitud-workflow'

const router = Router()

router.get('/', authMiddleware, checkRol(['lider']), getSolicitud)

router.get('/historialSolicitudes', authMiddleware, checkRol(['lider']), getHistorialSolicitud)

router.get('/pendientes', authMiddleware, checkRol(['lider']), getSolicitudesPendientes)

router.get('/asignadas', authMiddleware, checkRol(['tecnico']), getSolicitudesAsignadas)

router.get('/finalizadas', authMiddleware, checkRol(['tecnico']), getSolicitudesFinalizadas)

router.get('/historial', authMiddleware, checkRol(['funcionario']), historialSolicitudesCreadas)

router.post(
  '/',
  authMiddleware,
  checkRol(['funcionario']),
  uploadLimiter,
  uploadMiddleware.single('foto'),
  handleUploadError,
  validarSolicitud,
  crearSolicitud
)

router.get('/:id', authMiddleware, checkRol(['lider', 'tecnico', 'funcionario']), getSolicitudId)
router.get(
  '/:id/historial',
  authMiddleware,
  checkRol(['lider', 'tecnico', 'funcionario']),
  getSolicitudHistorial
)
/** @deprecated Hard delete. Use POST /:id/cancelar for workflow v2. Planned retirement when no consumers remain. */
router.delete('/:id', authMiddleware, checkRol(['lider']), deleteSolicitud)

router.put('/:id/asignarTecnico', authMiddleware, checkRol(['lider']), asignarTecnicoSolicitud)
router.put(
  '/:id/reasignarTecnico',
  authMiddleware,
  checkRol(['lider']),
  validarReasignarTecnico,
  reasignarTecnicoSolicitud
)
router.post('/:id/iniciarAtencion', authMiddleware, checkRol(['tecnico']), iniciarAtencionSolicitud)
router.post(
  '/:id/actualizacion',
  authMiddleware,
  checkRol(['tecnico']),
  uploadLimiter,
  uploadMiddleware.single('evidencia'),
  handleUploadError,
  validarMensajeWorkflow,
  agregarActualizacionSolicitud
)
router.post(
  '/:id/solicitarInformacion',
  authMiddleware,
  checkRol(['tecnico']),
  validarMensajeWorkflow,
  solicitarInformacionSolicitud
)
router.post(
  '/:id/responder',
  authMiddleware,
  checkRol(['funcionario']),
  uploadLimiter,
  uploadMiddleware.single('evidencia'),
  handleUploadError,
  validarMensajeWorkflow,
  responderInformacionSolicitud
)
router.post(
  '/:id/solucionParcial',
  authMiddleware,
  checkRol(['tecnico']),
  uploadLimiter,
  uploadMiddleware.single('evidencia'),
  handleUploadError,
  validarSolucionParcial,
  registrarSolucionParcial
)
router.post(
  '/:id/solucionTotal',
  authMiddleware,
  checkRol(['tecnico']),
  uploadLimiter,
  uploadMiddleware.single('evidencia'),
  handleUploadError,
  validarSolucionTotal,
  registrarSolucionTotal
)
router.post('/:id/confirmarSolucion', authMiddleware, checkRol(['funcionario']), confirmarSolucionSolicitud)
router.post(
  '/:id/reabrir',
  authMiddleware,
  checkRol(['funcionario']),
  validarMotivoWorkflow,
  reabrirSolicitud
)
router.post(
  '/:id/cancelar',
  authMiddleware,
  checkRol(['lider']),
  validarMotivoWorkflow,
  cancelarSolicitud
)

export default router
