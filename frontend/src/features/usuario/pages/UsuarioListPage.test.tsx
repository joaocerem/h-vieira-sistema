import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UsuarioListPage } from './UsuarioListPage'
import { usuarioApi } from '../api/usuarioApi'

vi.mock('../api/usuarioApi', () => ({
  usuarioApi: { listar: vi.fn() },
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('UsuarioListPage', () => {
  it('carrega e exibe os usuários vindos da API', async () => {
    vi.mocked(usuarioApi.listar).mockResolvedValueOnce([
      { id: '1', nome: 'João Pedro', identificadorDeAcesso: 'joao.pedro', situacaoDeAcesso: 'Ativo' },
    ])

    renderWithProviders(<UsuarioListPage />)

    expect(await screen.findByText('João Pedro')).toBeInTheDocument()
    expect(screen.getByText('joao.pedro')).toBeInTheDocument()
  })

  it('mostra "—" quando situação de acesso é nula', async () => {
    vi.mocked(usuarioApi.listar).mockResolvedValueOnce([
      { id: '1', nome: 'João Pedro', identificadorDeAcesso: 'joao.pedro', situacaoDeAcesso: null },
    ])

    renderWithProviders(<UsuarioListPage />)

    expect(await screen.findByText('—')).toBeInTheDocument()
  })

  it('mostra estado vazio quando não há usuários', async () => {
    vi.mocked(usuarioApi.listar).mockResolvedValueOnce([])

    renderWithProviders(<UsuarioListPage />)

    expect(await screen.findByText(/nenhum usuário cadastrado/i)).toBeInTheDocument()
  })
})
