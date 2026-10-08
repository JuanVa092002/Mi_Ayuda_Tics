import { Router } from 'express'
import { checkRol } from '../../../shared/middleware/rol'
import { authMiddleware } from '../../../shared/middleware/session'
import {
  getTipoCaso,
  getTipoCasoId,
  postTipoCaso,
  updateTipoCaso,
  deleteTipoCaso,
} from '../controllers/tipoCaso'
import { validarCrearTipoCaso, validarActualizarTipoCaso } from '../validators/tipoCaso'

const router = Router()

// http://localhost:3010/api/tipoCaso/

router.get('/', authMiddleware, checkRol(['lider', 'tecnico', 'funcionario']), getTipoCaso)
router.get('/:id', authMiddleware, checkRol(['lider', 'tecnico', 'funcionario']), getTipoCasoId)
router.post('/', authMiddleware, checkRol(['lider']), validarCrearTipoCaso, postTipoCaso)
router.put('/:id', authMiddleware, checkRol(['lider']), validarActualizarTipoCaso, updateTipoCaso)
router.delete('/:id', authMiddleware, checkRol(['lider']), deleteTipoCaso)

export default router

