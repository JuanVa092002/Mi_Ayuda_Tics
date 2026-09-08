import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth'
import { resolveUserPhotoUrl, userInitials } from '@/shared/media/user-photo'

export default function Profile(): ReactNode {
  const { user } = useAuth()
  const imageUrl = resolveUserPhotoUrl(user?.foto)

  if (!user) return null

  return (
    <div className="flex bg-gray-100 hover:bg-white  py-[1px] pr-5 pl-1 rounded-full items-center">
      <div className="mr-4">
        {imageUrl ? (
          <img src={imageUrl} alt="Imagen de perfil" className="w-9 h-9 rounded-full" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#EEF0F5] flex items-center justify-center">
            <span className="text-sm font-bold text-[#1B2A4A]">{userInitials(user.nombre)}</span>
          </div>
        )}
      </div>
      <div className="text-sm text-azul-sena">
        <p>{user.nombre}</p>
        <p>{user.rol}</p>
      </div>
    </div>
  )
}
