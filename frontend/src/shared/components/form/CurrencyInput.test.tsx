import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CurrencyInput } from './CurrencyInput'
import { formatCurrency } from '@/shared/lib/formatters'

/**
 * `CurrencyInput` é controlado (ver comentário no componente) — para exercitar a digitação
 * como ela acontece de verdade (dentro de um form com `Controller`), o teste precisa de um
 * wrapper com estado que realimenta `value` a partir de `onValueChange`. Passar um `value`
 * estático e só espiar o último `onValueChange` não reproduz o comportamento real: sem
 * realimentação, cada keystroke é descartado pela re-renderização seguinte em vez de acumular.
 */
function ControlledWrapper({
  initialValue,
  onValueChange,
  allowNegative,
}: {
  initialValue: number | undefined
  onValueChange: (value: number | undefined) => void
  allowNegative?: boolean
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <CurrencyInput
      id="valor"
      value={value}
      allowNegative={allowNegative}
      onValueChange={(v) => {
        setValue(v)
        onValueChange(v)
      }}
    />
  )
}

describe('CurrencyInput', () => {
  it('mostra vazio quando o valor e undefined', () => {
    render(<CurrencyInput id="valor" value={undefined} onValueChange={vi.fn()} />)
    expect(screen.getByRole('textbox')).toHaveValue('')
  })

  it('formata um valor ja preenchido como moeda', () => {
    render(<CurrencyInput id="valor" value={1234.5} onValueChange={vi.fn()} />)
    // Usa o proprio formatador como referencia: Intl.NumberFormat pt-BR insere um caractere
    // de espaco especial (nao separavel) entre "R$" e o valor, diferente de um espaco comum,
    // entao um literal digitado a mao no teste nao bateria por engano.
    expect(screen.getByRole('textbox')).toHaveValue(formatCurrency(1234.5))
  })

  it('monta o valor em centavos conforme o usuario digita', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ControlledWrapper initialValue={undefined} onValueChange={onValueChange} />)

    await user.type(screen.getByRole('textbox'), '150')

    // "1" -> 0,01; "15" -> 0,15; "150" -> 1,50 -- mesmo comportamento de caixa eletronico.
    expect(onValueChange).toHaveBeenLastCalledWith(1.5)
  })

  it('volta a undefined quando o campo e esvaziado', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<CurrencyInput id="valor" value={100} onValueChange={onValueChange} />)
    await user.clear(screen.getByRole('textbox'))
    expect(onValueChange).toHaveBeenLastCalledWith(undefined)
  })

  it('aceita valor negativo quando allowNegative esta ativo', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ControlledWrapper initialValue={undefined} onValueChange={onValueChange} allowNegative />)

    await user.type(screen.getByRole('textbox'), '-500')

    expect(onValueChange).toHaveBeenLastCalledWith(-5)
  })

  it('ignora o sinal de negativo quando allowNegative esta desativado', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ControlledWrapper initialValue={undefined} onValueChange={onValueChange} />)

    await user.type(screen.getByRole('textbox'), '-500')

    expect(onValueChange).toHaveBeenLastCalledWith(5)
  })
})
