import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { NomeUnicoTable } from './NomeUnicoTable'

describe('NomeUnicoTable', () => {
  it('mostra a mensagem de vazio fornecida quando não há itens', () => {
    render(
      <NomeUnicoTable itens={[]} editarHref={(id) => `/x/${id}`} mensagemVazio="Nada aqui." />,
      { wrapper: MemoryRouter },
    )

    expect(screen.getByText('Nada aqui.')).toBeInTheDocument()
  })

  it('lista os itens com link de edição resolvido por editarHref', () => {
    render(
      <NomeUnicoTable
        itens={[
          { id: '1', nome: 'Fornecedor A' },
          { id: '2', nome: 'Fornecedor B' },
        ]}
        editarHref={(id) => `/fornecedores/${id}/editar`}
        mensagemVazio="Nada aqui."
      />,
      { wrapper: MemoryRouter },
    )

    expect(screen.getByText('Fornecedor A')).toBeInTheDocument()
    const links = screen.getAllByRole('link', { name: /editar/i })
    expect(links[0]).toHaveAttribute('href', '/fornecedores/1/editar')
  })
})
