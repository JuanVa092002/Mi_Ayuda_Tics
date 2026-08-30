export type TipoSolucion = 'pendiente' | 'finalizado';

export type ResolveCasoInput = {
  solutionDescription: string;
  caseTypeId: string;
  solutionType: TipoSolucion;
  evidenceUri?: string;
  evidenceMimeType?: string;
  evidenceFileName?: string;
};

export type SolucionCasoResponseDto = {
  message: string;
  solucionCaso?: {
    _id: string;
    descripcionSolucion?: string;
  };
};

export type SolucionResult = {
  message: string;
  id?: string;
};

export function mapSolucionResponse(dto: SolucionCasoResponseDto): SolucionResult {
  return {
    message: dto.message,
    id: dto.solucionCaso?._id,
  };
}
