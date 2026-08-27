import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ObraStatusActions } from './ObraStatusActions'

describe('ObraStatusActions', () => {
  it('mostra só a transição "Em andamento" quando o status é "A executar"', () => {
    render(<ObraStatusActions statusAtual="A executar" onTransicionar={vi.fn()} isPending={false} />)

    expect(screen.getByRole('button', { name: /marcar como "em andamento"/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /pausada/i })).not.toBeInTheDocument()
  })

  it('mostra Pausada e Concluída quando o status é "Em andamento"', () => {
    render(<ObraStatusActions statusAtual="Em andamento" onTransicionar={vi.fn()} isPending={false} />)

    expect(screen.getByRole('button', { name: /pausada/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /concluída/i })).toBeInTheDocument()
  })

  it('não mostra nenhum botão quando o status é "Concluída" (transição final)', () => {
    const { container } = render(
      <ObraStatusActions statusAtual="Concluída" onTransicionar={vi.fn()} isPending={false} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('chama onTransicionar com o novo status ao clicar', async () => {
    const user = userEvent.setup()
    const onTransicionar = vi.fn()
    render(<ObraStatusActions statusAtual="A executar" onTransicionar={onTransicionar} isPending={false} />)

    await user.click(screen.getByRole('button', { name: /em andamento/i }))

    expect(onTransicionar).toHaveBeenCalledWith('Em andamento')
  })
})
