import { useState } from 'react'
import { Input } from '@/shared/components/ui/input'
import { formatCurrency } from '@/shared/lib/formatters'

/**
 * Máscara de moeda em tempo real — símbolo `R$`, separador de milhar e centavos aparecem
 * enquanto o usuário digita (decisão de negócio: máscara de moeda padronizada em todo o
 * sistema). O usuário digita só dígitos (da direita para a esquerda, como em qualquer caixa
 * eletrônico); os dois últimos dígitos são sempre os centavos.
 *
 * Componente controlado — não é compatível com `register()` puro (a formatação exige
 * interceptar cada `onChange`), por isso é usado via `Controller` do react-hook-form, não
 * `{...form.register(campo)}`. Único ponto do projeto que usa `Controller` — os demais campos
 * continuam em `register`, sem motivo para migrar o que já funciona.
 *
 * `onValueChange` recebe `number | undefined` diretamente (`undefined` quando o campo está
 * vazio) — nunca `NaN`. Por isso o schema Zod correspondente usa `z.number()` direto, não
 * `z.coerce.number()`: o achado de Zod 4 + `.superRefine()` documentado em
 * `arquitetura-tecnica-frontend.md`, Seção 5, vinha exatamente de `valueAsNumber`/`z.coerce`
 * produzindo `NaN` a partir de string vazia — este componente nunca produz `NaN`.
 */
export function CurrencyInput({
  id,
  value,
  onValueChange,
  allowNegative = false,
  disabled,
  className,
  placeholder,
}: {
  id: string
  value: number | undefined
  onValueChange: (value: number | undefined) => void
  allowNegative?: boolean
  disabled?: boolean
  className?: string
  placeholder?: string
}) {
  // Guarda só o "-" digitado antes de qualquer dígito. `value` (number) não tem como
  // representar "negativo, mas ainda sem valor" — sem esse estado local, o React restaura o
  // DOM do input controlado para o último `value` conhecido logo após o evento (mesmo sem
  // re-render disparado por nós), apagando o "-" antes que o próximo dígito chegue.
  const [pendingNegative, setPendingNegative] = useState(false)

  const displayValue =
    value === undefined ? (pendingNegative ? '-' : '') : formatCurrency(value)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value

    if (raw === '') {
      setPendingNegative(false)
      onValueChange(undefined)
      return
    }

    const negativo = allowNegative && raw.trim().startsWith('-')
    const digitos = raw.replace(/\D/g, '')

    if (digitos === '') {
      setPendingNegative(negativo)
      onValueChange(undefined)
      return
    }

    setPendingNegative(false)
    const centavos = parseInt(digitos, 10)
    const numero = (negativo ? -centavos : centavos) / 100
    onValueChange(numero)
  }

  return (
    <Input
      id={id}
      inputMode="decimal"
      autoComplete="off"
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
    />
  )
}
