/**
 * Espelha `ObraResponse` (backend). Ver `docs/domain-model/03-obra.md`. `status` só muda via
 * endpoint dedicado (`POST /api/obras/{id}/status`), nunca pelo `PUT` de atualização.
 */
export interface Obra {
  id: string
  clienteId: string
  nome: string
  valorContratado: number
  dataInicio: string
  dataPrevistaTermino: string
  dataRealTermino: string | null
  status: 'A executar' | 'Em andamento' | 'Pausada' | 'Concluída'
}

/** `clienteId` só existe na criação — imutável depois (`AtualizarObraRequest` não tem esse campo). */
export interface ObraCriarValues {
  clienteId: string
  nome: string
  valorContratado: number
  dataInicio: string
  dataPrevistaTermino: string
  dataRealTermino: string | null
}

export interface ObraAtualizarValues {
  nome: string
  valorContratado: number
  dataInicio: string
  dataPrevistaTermino: string
  dataRealTermino: string | null
}
