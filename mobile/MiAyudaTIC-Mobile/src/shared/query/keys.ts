export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    currentUser: ['auth', 'currentUser'] as const,
  },
  catalogos: {
    all: ['catalogos'] as const,
    ambientes: ['catalogos', 'ambientes'] as const,
    tiposCaso: ['catalogos', 'tipos-caso'] as const,
  },
  solicitudes: {
    all: ['solicitudes'] as const,
    historial: (userId: string) => ['solicitudes', 'historial', userId] as const,
    detail: (id: string) => ['solicitudes', 'detail', id] as const,
  },
  casos: {
    all: ['casos'] as const,
    asignados: (userId: string) => ['casos', 'asignados', userId] as const,
    resueltos: (userId: string) => ['casos', 'resueltos', userId] as const,
    detail: (id: string) => ['casos', 'detail', id] as const,
  },
  media: {
    all: ['auth-media'] as const,
    file: (filename: string) => ['auth-media', filename] as const,
  },
} as const;
