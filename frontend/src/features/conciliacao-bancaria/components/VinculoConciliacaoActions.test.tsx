import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VinculoConciliacaoActions } from './VinculoConciliacaoActions'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'
import type { VinculoConciliacao } from '../types'

vi.mock('@/shared/hooks/useLancamentoOptions', () => ({ useLancamentoOptions: vi.fn() }))

function baseVinculo(overrides: Partial<VinculoConciliacao> = {}): VinculoConciliacao {
  return {
    id: 'v1',
    movimentacaoBancariaId: 'm1',
    lancamentosFinanceirosIds: [],
    estadoConciliacao: 'Não Vinculado',
    ...overrides,
  }
}

describe('VinculoConciliacaoActions', () => {
  beforeEach(() => {
    vi.mocked(useLancamentoOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useLancamentoOptions>)
  })

  it('não mostra nenhum botão quando o estado é Confirmado (estado final)', () => {
    render(
      <VinculoConciliacaoActions
        vinculo={baseVinculo({ estadoConciliacao: 'Confirmado', lancamentosFinanceirosIds: ['l1'] })}
        onConfirmar={vi.fn()}
        onMarcarDivergente={vi.fn()}
        onMarcarSemCorrespondencia={vi.fn()}
        onVincularManualmente={vi.fn()}
        isPending={false}
      />,
    )

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('mostra "Sem correspondência" e "Vincular manualmente" quando Não Vinculado, sem Confirmar/Divergente', () => {
    render(
      <VinculoConciliacaoActions
        vinculo={baseVinculo({ estadoConciliacao: 'Não Vinculado' })}
        onConfirmar={vi.fn()}
        onMarcarDivergente={vi.fn()}
        onMarcarSemCorrespondencia={vi.fn()}
        onVincularManualmente={vi.fn()}
        isPending={false}
      />,
    )

    expect(screen.getByRole('button', { name: /sem correspondência/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vincular manualmente/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^confirmar$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /marcar divergente/i })).not.toBeInTheDocument()
  })

  it('mostra "Confirmar", "Marcar divergente" e "Vincular manualmente" quando Sugerido', () => {
    render(
      <VinculoConciliacaoActions
        vinculo={baseVinculo({ estadoConciliacao: 'Sugerido', lancamentosFinanceirosIds: ['l1'] })}
        onConfirmar={vi.fn()}
        onMarcarDivergente={vi.fn()}
        onMarcarSemCorrespondencia={vi.fn()}
        onVincularManualmente={vi.fn()}
        isPending={false}
      />,
    )

    expect(screen.getByRole('button', { name: /^confirmar$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /marcar divergente/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vincular manualmente/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sem correspondência/i })).not.toBeInTheDocument()
  })

  it('mostra só "Marcar divergente" e "Vincular manualmente" quando já Divergente (não pode confirmar nem marcar sem correspondência)', () => {
    render(
      <VinculoConciliacaoActions
        vinculo={baseVinculo({ estadoConciliacao: 'Divergente', lancamentosFinanceirosIds: ['l1'] })}
        onConfirmar={vi.fn()}
        onMarcarDivergente={vi.fn()}
        onMarcarSemCorrespondencia={vi.fn()}
        onVincularManualmente={vi.fn()}
        isPending={false}
      />,
    )

    expect(screen.getByRole('button', { name: /marcar divergente/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /vincular manualmente/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^confirmar$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sem correspondência/i })).not.toBeInTheDocument()
  })

  it('chama onConfirmar ao clicar em Confirmar', async () => {
    const user = userEvent.setup()
    const onConfirmar = vi.fn()
    render(
      <VinculoConciliacaoActions
        vinculo={baseVinculo({ estadoConciliacao: 'Sugerido', lancamentosFinanceirosIds: ['l1'] })}
        onConfirmar={onConfirmar}
        onMarcarDivergente={vi.fn()}
        onMarcarSemCorrespondencia={vi.fn()}
        onVincularManualmente={vi.fn()}
        isPending={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /^confirmar$/i }))

    expect(onConfirmar).toHaveBeenCalledOnce()
  })

  it('abre a lista de Lançamentos e chama onVincularManualmente com os ids marcados', async () => {
    vi.mocked(useLancamentoOptions).mockReturnValue({
      data: [
        { id: 'l1', tipo: 'Despesa', valor: 500, vencimento: '2026-08-01', situacaoAdministrativa: 'Ativo', statusFinanceiro: 'Não Conciliado' },
        { id: 'l2', tipo: 'Despesa', valor: 300, vencimento: '2026-08-02', situacaoAdministrativa: 'Ativo', statusFinanceiro: 'Não Conciliado' },
      ],
      isLoading: false,
    } as unknown as ReturnType<typeof useLancamentoOptions>)

    const user = userEvent.setup()
    const onVincularManualmente = vi.fn()
    render(
      <VinculoConciliacaoActions
        vinculo={baseVinculo({ estadoConciliacao: 'Não Vinculado' })}
        onConfirmar={vi.fn()}
        onMarcarDivergente={vi.fn()}
        onMarcarSemCorrespondencia={vi.fn()}
        onVincularManualmente={onVincularManualmente}
        isPending={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: /vincular manualmente/i }))
    const checkboxes = screen.getAllByRole('checkbox')
    await user.click(checkboxes[0])
    await user.click(checkboxes[1])
    await user.click(screen.getByRole('button', { name: /^vincular$/i }))

    expect(onVincularManualmente).toHaveBeenCalledWith(['l1', 'l2'])
  })
})
