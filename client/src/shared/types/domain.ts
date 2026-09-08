/** Domain types — mirror backend models until @miayuda/types package exists */

export type UserRole = 'funcionario' | 'tecnico' | 'lider'

export interface MediaFile {
  url: string
}

export interface User {
  _id: string
  nombre: string
  correo: string
  telefono?: string
  rol: UserRole
  foto?: MediaFile | string
  activo?: boolean
  estado?: boolean
}

export interface AuthResponse {
  token?: string
  usuario?: User
  message?: string
}

export interface SelectOption {
  _id: string
  nombre: string
}

export interface AmbienteFormacion extends SelectOption {
  activo?: boolean
  descripcion?: string
}

export interface TipoCaso extends SelectOption {
  descripcion?: string
}

export type SolicitudEstado = string

export type TipoSolucion = 'pendiente' | 'finalizado'

export interface SolicitudCapabilities {
  canAssign?: boolean
  canReassign?: boolean
  canCancel?: boolean
  canStart?: boolean
  canUpdate?: boolean
  canRequestInfo?: boolean
  canPartialSolution?: boolean
  canResolve?: boolean
  canReply?: boolean
  canConfirm?: boolean
  canReopen?: boolean
}

export interface SolicitudHistorialEvent {
  _id?: string
  type: string
  message: string
  createdAt?: string
  author?: { nombre?: string }
}

export interface SolucionCaso {
  descripcionSolucion?: string
  evidencia?: MediaFile
}

export interface Solicitud {
  _id: string
  codigoCaso?: string
  descripcion?: string
  estado: SolicitudEstado | string
  fecha?: string
  telefono?: string
  usuario?: User | string
  tecnico?: User | string
  ambiente?: AmbienteFormacion
  ambienteFormacion?: AmbienteFormacion | string
  tipoCaso?: TipoCaso | string
  solucion?: SolucionCaso | string
  foto?: MediaFile
  tipoSolucion?: TipoSolucion
  workflowVersion?: number
  lifecycleState?: string
  displayStatus?: string
  headline?: string
  proximaAccion?: string
  capabilities?: SolicitudCapabilities
  historial?: SolicitudHistorialEvent[]
  queue?: string
  historyNote?: string
}

export interface CaseForResolution extends Solicitud {
  solucion?: string
  tipoSolucion?: TipoSolucion
  tipoCaso?: string
}

export interface LoginCredentials {
  correo: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  nombre: string
  telefono: string
  confirmPassword: string
  rol: UserRole
}

export interface LoginResponse {
  dataUser: {
    user: User
  }
}

export interface AuthContextValue {
  loading: boolean
  setLoading: (loading: boolean) => void
  user: User | null
  setUser: (user: User | null) => void
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void
}

export interface EstadisticaItem {
  nombre?: string
  _id?: number | string
  cantidad: number
}

export interface EstadisticasResponse {
  data: EstadisticaItem[]
}

export interface AssignTecnicoPayload {
  tecnico: string
}

export interface Notificacion {
  _id: string
  mensaje: string
  leida: boolean
  usuario: string
  createdAt?: string
}

export interface ApiListResponse<T> {
  data?: T
  message?: string
}
