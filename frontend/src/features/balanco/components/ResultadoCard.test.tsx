import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultadoCard } from './ResultadoCard'

describe('ResultadoCard', () => {
  it('mostra o rótulo e o valor formatado em Real', () => {
    render(<ResultadoCard label="Resultado realizado" valor={1500.5} />)

    expect(screen.getByText('Resultado realizado')).toBeInTheDocument()
    expect(screen.getByText('R$ 1.500,50')).toBeInTheDocument()
  })

  it('formata valor negativo corretamente', () => {
    render(<ResultadoCard label="Resultado projetado" valor={-250} />)

    expect(screen.getByText('-R$ 250,00')).toBeInTheDocument()
  })
})
