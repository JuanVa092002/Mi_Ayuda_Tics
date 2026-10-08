export type AmbienteDto = {
  _id: string;
  nombre: string;
  activo?: boolean;
  descripcion?: string;
};

export type TipoCasoDto = {
  _id: string;
  nombre: string;
  descripcion?: string;
};

export type Ambiente = {
  id: string;
  name: string;
  isActive: boolean;
  description?: string;
};

export type TipoCaso = {
  id: string;
  name: string;
  description?: string;
};

export type CatalogListResponseDto<T> = {
  data: T[];
};

export function mapAmbiente(dto: AmbienteDto): Ambiente {
  return {
    id: dto._id,
    name: dto.nombre,
    isActive: dto.activo !== false,
    description: dto.descripcion,
  };
}

export function mapTipoCaso(dto: TipoCasoDto): TipoCaso {
  return {
    id: dto._id,
    name: dto.nombre,
    description: dto.descripcion,
  };
}
