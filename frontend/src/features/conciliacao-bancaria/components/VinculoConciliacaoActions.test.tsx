import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VinculoConciliacaoActions } from './VinculoConciliacaoActions'
import { useLiquidacaoOptions } from '@/shared/hooks/useLiquidacaoOptions'
import type { VinculoConciliacao } from '../types'

vi.mock('@/shared/hooks/useLiquidacaoOptions', () => ({ useLiquidacaoOptions: vi.fn() }))

function baseVinculo(overrides: Partial<VinculoConciliacao> = {}): VinculoConciliacao {
  return {
    id: 'v1',
    movimentacaoBancariaId: 'm1',
    liquidacaoFinanceiraId: null,
    estadoConciliacao: 'Não Vinculado',
    ...overrides,
  }
}

describe('VinculoConciliacaoActions', () => {
  beforeEach(() => {
    vi.mocked(useLiquidacaoOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useLiquidacaoOptions>)
  })

  it('não mostra nenhum botão quando o estado é Confirmado (estado final)', () => {
    render(
      <VinculoConciliacaoActions
        vinculo={baseVinculo({ estadoConciliacao: 'Confirmado', liquidacaoFinanceiraId: 'l1' })}
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
        vinculo={baseVinculo({ estadoConciliacao: 'Sugerido', liquidacaoFinanceiraId: 'l1' })}
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
        vinculo={baseVinculo({ estadoConciliacao: 'Divergente', liquidacaoFinanceiraId: 'l1' })}
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
        vinculo={baseVinculo({ estadoConciliacao: 'Sugerido', liquidacaoFinanceiraId: 'l1' })}
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

  it('abre o seletor de Liquidação e chama onVincularManualmente com o id escolhido', async () => {
    vi.mocked(useLiquidacaoOptions).mockReturnValue({
      data: [{ id: 'l1', tipo: 'Pagamento', dataEfetiva: '2026-08-01', valor: 500, contaBancariaId: 'cb1' }],
      isLoading: false,
    } as unknown as ReturnType<typeof useLiquidacaoOptions>)

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
    await user.selectOptions(screen.getByRole('combobox'), 'l1')
    await user.click(screen.getByRole('button', { name: /^vincular$/i }))

    expect(onVincularManualmente).toHaveBeenCalledWith('l1')
  })
})
