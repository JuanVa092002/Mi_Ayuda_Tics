import { Request, Response } from 'express'
import crypto from 'crypto'
import { sendMail } from '../../../shared/utils/handleEmail'
import { logError } from '../../../shared/utils/logger'
import {
  buildPasswordResetEmail,
  getClientUrl,
  getEmailFrom,
} from '../../../shared/emails'
import models from '../../../core/models'

const { usuarioModel } = models

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { correo } = req.body
    if (!correo) {
      res.status(400).send({ message: 'Correo electrónico es requerido' })
      return
    }

    const user = await usuarioModel.findOne({ correo })
    const genericMessage =
      'Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.'

    if (!user) {
      res.send({ message: genericMessage })
      return
    }

    const token = generateToken()
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    user.resetPasswordToken = hashedToken
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hora
    await user.save()

    const resetLink = `${getClientUrl()}/restablecerPassword/${token}`
    const { html, text } = buildPasswordResetEmail({
      nombre: user.nombre ?? 'usuario',
      resetLink,
    })

    await sendMail({
      from: getEmailFrom(),
      to: user.correo,
      subject: 'Te dejamos una hora para entrar — MiAyudaTic',
      text,
      html,
    })

    res.send({ message: genericMessage })
  } catch (error) {
    logError('recuperarPassword: fallo al enviar correo de reset', error)
    res.status(500).send({ message: 'Error al enviar el correo electrónico' })
  }
}
