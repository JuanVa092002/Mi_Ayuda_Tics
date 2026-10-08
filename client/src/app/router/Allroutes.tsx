import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginMain from '@/pages/loginMain/LoginMain'
import JustLogin from '@/pages/justLogin/JustLogin'
import RegisterLogin from '@/pages/register/RegisterLogin'
import ForgotPassword from '@/pages/forgotPassword/ForgotPassword'
import ResetPassword from '@/pages/resetPassword/ResetPassword'
import PrivateRoutes from '@/app/router/private.routes'
import GuestOnlyRoutes from '@/app/router/guest.routes'
import RequireRole from '@/app/router/RequireRole'
import NotFound from '@/pages/shared/NotFound'
import Funcionario from '@/pages/funcionario/Funcionario'
import AdminSolicitud from '@/pages/admin/AdminSolicitud'
import AdminTecnicos from '@/pages/admin/AdminTecnicos'
import AdminAmbientes from '@/pages/admin/AdminAmbientes'
import AdminCasos from '@/pages/admin/AdminCasos'
import AdminEstadisticas from '@/pages/admin/AdminEstadisticas'
import TecnicosActivos from '@/pages/admin/tecnicos/TecnicosActivos'
import TecnicosInactivos from '@/pages/admin/tecnicos/TecnicosInactivos'
import CasosPorResolverTabla from '@/pages/tecnico/CasosPorResolverTabla'
import CasosResueltosTabla from '@/pages/tecnico/CasosResueltosTabla'
import SeguimientoSolicitud from '@/pages/admin/solicitud/SeguimientoSolicitud'
import Perfil from '@/pages/shared/Perfil'

export default function Allroutes(): ReactNode {
  return (
    <Routes>
      <Route element={<GuestOnlyRoutes />}>
        <Route path="/loginMain" element={<LoginMain />} />
        <Route path="/register" element={<RegisterLogin />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/restablecerPassword/:token" element={<ResetPassword />} />
        <Route path="/login" element={<JustLogin />} />
      </Route>

      <Route path="/" element={<Navigate to="/loginMain" replace />} />

      <Route element={<PrivateRoutes />}>
        <Route path="/perfil" element={<Perfil />} />

        <Route element={<RequireRole roles={['funcionario']} />}>
          <Route path="/funcionario" element={<Funcionario />} />
        </Route>

        <Route element={<RequireRole roles={['lider']} />}>
          <Route path="/adminSolicitud" element={<AdminSolicitud />} />
          <Route path="/adminTecnicos" element={<AdminTecnicos />} />
          <Route path="/adminAmbientes" element={<AdminAmbientes />} />
          <Route path="/adminCasos" element={<AdminCasos />} />
          <Route path="/adminEstadisticas" element={<AdminEstadisticas />} />
          <Route path="/tecnicosActivos" element={<TecnicosActivos />} />
          <Route path="/tecnicosInactivos" element={<TecnicosInactivos />} />
          <Route path="/seguimiento" element={<SeguimientoSolicitud />} />
        </Route>

        <Route element={<RequireRole roles={['tecnico']} />}>
          <Route path="/casos-por-resolver" element={<CasosPorResolverTabla />} />
          <Route path="/mis-casos" element={<Navigate to="/casos-por-resolver" replace />} />
          <Route path="/casos-resueltos" element={<CasosResueltosTabla />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
