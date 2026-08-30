import './fase-c-env'
import mongoose from 'mongoose'
import { dbConnect } from '../shared/config/mongo'
import { assertConnectedLocalSimulation } from '../shared/config/simulation-db-guard'
import models from '../core/models'
import solicitudModel from '../features/tickets/models/solicitud'

async function main(): Promise<void> {
  await dbConnect()
  assertConnectedLocalSimulation({
    name: mongoose.connection.name,
    host: mongoose.connection.host,
  })
  const db = mongoose.connection.db
  if (!db) throw new Error('STOP: no db')

  const indexes = await db.collection('solicituds').indexes()
  const uniq = indexes.find((i) => i.name === 'uniq_solicitud_codigoCaso')
  console.log(`db=${mongoose.connection.name}`)
  console.log(`index_names=${indexes.map((i) => i.name).join(',')}`)
  console.log(`uniq_present=${Boolean(uniq)}`)
  console.log(`uniq_unique=${Boolean(uniq && uniq.unique)}`)

  const { usuarioModel, ambienteModel, tipoCasoModel } = models
  const e2e = await solicitudModel
    .find({
      $or: [
        { descripcion: /Fase D/i },
        { descripcion: /fase d/i },
        { descripcion: /emulador sin foto/i },
        { descripcion: /A30s/i },
      ],
    })
    .select('codigoCaso descripcion fecha estado')
    .lean()

  console.log('e2e_count=' + e2e.length)
  for (const row of e2e) {
    const desc = String(row.descripcion ?? '').slice(0, 48)
    console.log(
      `e2e codigo=${row.codigoCaso} estado=${row.estado} desc=${desc}`
    )
  }

  const delSol = await solicitudModel.deleteMany({
    $or: [
      { descripcion: /Fase D/i },
      { descripcion: /emulador sin foto/i },
      { descripcion: /A30s/i },
    ],
  })
  const delUsers = await usuarioModel.deleteMany({
    correo: /^fased\./,
  })
  const delAmb = await ambienteModel.deleteMany({ nombre: 'Fase D Ambiente' })
  const delTipo = await tipoCasoModel.deleteMany({ nombre: 'Fase D Tipo' })
  console.log(
    `cleanup_ok solicitudes=${delSol.deletedCount} users=${delUsers.deletedCount} amb=${delAmb.deletedCount} tipo=${delTipo.deletedCount}`
  )

  const indexesAfter = await db.collection('solicituds').indexes()
  const uniqAfter = indexesAfter.find((i) => i.name === 'uniq_solicitud_codigoCaso')
  console.log(`uniq_after=${Boolean(uniqAfter && uniqAfter.unique)}`)
  await mongoose.disconnect()
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'STOP'
  console.error(message.replace(/mongodb(\+srv)?:\/\/\S+/gi, '[redacted]'))
  process.exit(1)
})
