import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from '@/app/App'

describe('App', () => {
  it('renderiza o bootstrap da aplicação sem erros', async () => {
    render(<App />)

    expect(
      await screen.findByText(/infraestrutura do frontend pronta/i),
    ).toBeInTheDocument()
    expect(screen.getByText(/h\. vieira erp/i)).toBeInTheDocument()
  })
})
