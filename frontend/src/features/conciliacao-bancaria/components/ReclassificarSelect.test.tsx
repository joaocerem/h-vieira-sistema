import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReclassificarSelect } from './ReclassificarSelect'
import type { MovimentacaoBancaria } from '../types'

const movimentacaoBase: MovimentacaoBancaria = {
  id: 'm1',
  contaBancariaId: 'cb1',
  data: '2026-08-01',
  descricao: 'Pagamento fornecedor',
  valor: -500,
  classificacao: 'Não Classificada',
}

describe('ReclassificarSelect', () => {
  it('mostra as quatro classificações atribuíveis, sem "Transferência Interna"', () => {
    render(<ReclassificarSelect movimentacao={movimentacaoBase} onReclassificar={vi.fn()} isPending={false} />)

    const select = screen.getByRole('combobox')
    const opcoes = Array.from(select.querySelectorAll('option')).map((opcao) => opcao.textContent)
    expect(opcoes).toEqual(['Terraplanagem', 'Fora da Operação', 'Retirada do Patrão', 'Não Classificada'])
  })

  it('chama onReclassificar com o novo valor ao trocar a seleção', async () => {
    const user = userEvent.setup()
    const onReclassificar = vi.fn()
    render(<ReclassificarSelect movimentacao={movimentacaoBase} onReclassificar={onReclassificar} isPending={false} />)

    await user.selectOptions(screen.getByRole('combobox'), 'Retirada do Patrão')

    expect(onReclassificar).toHaveBeenCalledWith('Retirada do Patrão')
  })

  it('mostra um rótulo fixo, sem select, quando já classificada como Transferência Interna', () => {
    render(
      <ReclassificarSelect
        movimentacao={{ ...movimentacaoBase, classificacao: 'Transferência Interna' }}
        onReclassificar={vi.fn()}
        isPending={false}
      />,
    )

    expect(screen.getByText('Transferência Interna')).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })
})
