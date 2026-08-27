import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TransferenciaInternaForm } from './TransferenciaInternaForm'
import { useMovimentacoes } from '../hooks/useMovimentacoes'

vi.mock('../hooks/useMovimentacoes', () => ({ useMovimentacoes: vi.fn() }))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

function setupMocks() {
  vi.mocked(useMovimentacoes).mockReturnValue({
    data: [
      { id: 'm1', contaBancariaId: 'cb1', data: '2026-08-01', descricao: 'Saída Itaú', valor: -1000, classificacao: 'Não Classificada' },
      { id: 'm2', contaBancariaId: 'cb2', data: '2026-08-01', descricao: 'Entrada Nubank', valor: 1000, classificacao: 'Não Classificada' },
    ],
    isLoading: false,
  } as unknown as ReturnType<typeof useMovimentacoes>)
}

describe('TransferenciaInternaForm', () => {
  it('exige origem, destino, valor e data', async () => {
    setupMocks()
    const user = userEvent.setup()
    renderWithQueryClient(<TransferenciaInternaForm onSubmit={vi.fn()} isSubmitting={false} />)

    await user.click(screen.getByRole('button', { name: /criar transferência/i }))

    expect(await screen.findByText(/movimentação de origem é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/movimentação de destino é obrigatória/i)).toBeInTheDocument()
    expect(screen.getByText(/valor é obrigatório/i)).toBeInTheDocument()
    expect(screen.getByText(/^data é obrigatória$/i)).toBeInTheDocument()
  })

  it('recusa quando origem e destino são a mesma Movimentação, sem chamar onSubmit', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(<TransferenciaInternaForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.selectOptions(screen.getByLabelText(/movimentação de origem/i), 'm1')
    await user.selectOptions(screen.getByLabelText(/movimentação de destino/i), 'm1')
    await user.type(screen.getByLabelText(/^valor$/i), '1000')
    await user.type(screen.getByLabelText(/^data$/i), '2026-08-01')
    await user.click(screen.getByRole('button', { name: /criar transferência/i }))

    expect(await screen.findByText(/deve ser diferente da origem/i)).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('envia os valores preenchidos quando origem e destino são diferentes', async () => {
    setupMocks()
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderWithQueryClient(<TransferenciaInternaForm onSubmit={onSubmit} isSubmitting={false} />)

    await user.selectOptions(screen.getByLabelText(/movimentação de origem/i), 'm1')
    await user.selectOptions(screen.getByLabelText(/movimentação de destino/i), 'm2')
    // Máscara de dígitos: "100000" → R$ 1.000,00, mesmo comportamento de caixa eletrônico.
    await user.type(screen.getByLabelText(/^valor$/i), '100000')
    await user.type(screen.getByLabelText(/^data$/i), '2026-08-01')
    await user.click(screen.getByRole('button', { name: /criar transferência/i }))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      movimentacaoOrigemId: 'm1',
      movimentacaoDestinoId: 'm2',
      valor: 1000,
      data: '2026-08-01',
    })
  })
})
