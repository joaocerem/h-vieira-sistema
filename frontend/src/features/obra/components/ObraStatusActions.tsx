import { Button } from '@/shared/components/ui/button'
import type { Obra } from '../types'

/**
 * Espelha `ObraService.TRANSICOES_VALIDAS` (backend) — só para decidir quais botões mostrar;
 * o backend é quem de fato valida a transição (`BusinessException` se inválida, toast global).
 */
const TRANSICOES_VALIDAS: Record<Obra['status'], Obra['status'][]> = {
  'A executar': ['Em andamento'],
  'Em andamento': ['Pausada', 'Concluída'],
  Pausada: ['Em andamento'],
  Concluída: [],
}

export function ObraStatusActions({
  statusAtual,
  onTransicionar,
  isPending,
}: {
  statusAtual: Obra['status']
  onTransicionar: (novoStatus: Obra['status']) => void
  isPending: boolean
}) {
  const transicoesPossiveis = TRANSICOES_VALIDAS[statusAtual]

  if (transicoesPossiveis.length === 0) {
    return null
  }

  return (
    <div className="flex gap-2">
      {transicoesPossiveis.map((status) => (
        <Button
          key={status}
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => onTransicionar(status)}
        >
          {isPending ? 'Alterando...' : `Marcar como "${status}"`}
        </Button>
      ))}
    </div>
  )
}
