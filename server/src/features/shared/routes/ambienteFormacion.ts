import { Router } from 'express'
import { authMiddleware } from '../../../shared/middleware/session'
import { checkRol } from '../../../shared/middleware/rol'
import {
  getAmbiente,
  getAmbienteId,
  postAmbiente,
  updateAmbiente,
  inactivarAmbiente,
} from '../controllers/ambienteFormacion'
import { validarCrearAmbiente, validarActualizarAmbiente } from '../validators/ambiente'

const router = Router()

// http://localhost:3010/api/ambienteFormacion/
// http://localhost:3010/api/ambienteFormacion/:id/inactivar

router.get('/', authMiddleware, checkRol(['lider', 'funcionario']), getAmbiente)
router.get('/:id', authMiddleware, checkRol(['lider', 'funcionario']), getAmbienteId)
router.post('/', authMiddleware, checkRol(['lider']), validarCrearAmbiente, postAmbiente)
router.put('/:id', authMiddleware, checkRol(['lider']), validarActualizarAmbiente, updateAmbiente)
router.put('/:id/inactivar', authMiddleware, checkRol(['lider']), inactivarAmbiente)

export default router

