import { useMemo, useRef, useState } from 'react'
import { Popover } from 'radix-ui'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { cn } from '@/shared/lib/utils'

export interface AutocompleteOption {
  value: string
  label: string
}

/**
 * Campo de referência com busca por texto + cadastro rápido embutido (decisão de negócio,
 * Sprint 2 — "Fluxo completo de Lançamentos": autocomplete substitui `<select>` tradicional
 * para Fornecedor/Categoria, com opção de criar um registro novo sem sair da tela). Substitui
 * `SelectField` só para os campos que ganharam essa capacidade — os demais campos de
 * referência do projeto (Empresa, Obra, Veículo, Cliente) continuam em `SelectField`, sem
 * migração forçada onde não foi decidido (Cliente permanece `<select>` — decisão explícita,
 * volume baixo, autocomplete não traz ganho operacional).
 *
 * Controlado (mesmo motivo de `CurrencyInput.tsx` — precisa interceptar cada tecla para
 * filtrar/abrir o painel), usado via `Controller` do react-hook-form.
 *
 * `open`/`busca` são estado local, não vêm de fora — o valor "de verdade" do campo é só
 * `value` (o id selecionado). Enquanto o painel está aberto, o input mostra o texto de busca
 * digitado; fechado, mostra o `label` da opção selecionada (resolvido a partir de `options`,
 * nunca guardado separadamente — mesma disciplina de "sem duplicar fonte de verdade" do
 * restante do projeto).
 */
export function AutocompleteField({
  id,
  label,
  error,
  value,
  onValueChange,
  options,
  placeholder,
  disabled,
  isLoading,
  onQuickCreate,
  quickCreateLabel = (texto) => `+ Criar "${texto}"`,
}: {
  id: string
  label: string
  error?: string
  value: string
  onValueChange: (value: string) => void
  options: AutocompleteOption[]
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  /** Ausente = sem cadastro rápido para este campo (nenhum caso atual, mas a prop é opcional). */
  onQuickCreate?: (nomeDigitado: string) => Promise<AutocompleteOption>
  quickCreateLabel?: (nomeDigitado: string) => string
}) {
  const [open, setOpen] = useState(false)
  const [busca, setBusca] = useState('')
  const [criando, setCriando] = useState(false)
  const [destacado, setDestacado] = useState(0)
  // Fallback só para o intervalo entre "acabei de criar" e "a lista de opções (TanStack Query)
  // já foi invalidada/refeita e passou a incluir o novo registro" — sem isso, o campo mostraria
  // vazio nesse intervalo, já que `value` aponta para um id que `options` ainda não conhece.
  const [criadaAgoraPouco, setCriadaAgoraPouco] = useState<AutocompleteOption | null>(null)
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const selecionada =
    options.find((option) => option.value === value) ??
    (criadaAgoraPouco?.value === value ? criadaAgoraPouco : undefined)
  const textoExibido = open ? busca : (selecionada?.label ?? '')

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return options
    return options.filter((option) => option.label.toLowerCase().includes(termo))
  }, [busca, options])

  const termoDigitado = busca.trim()
  const semCorrespondenciaExata =
    termoDigitado !== '' &&
    !options.some((option) => option.label.toLowerCase() === termoDigitado.toLowerCase())
  const mostrarCriarNovo = Boolean(onQuickCreate) && semCorrespondenciaExata

  // Lista "navegável" por teclado — as opções filtradas, e o item de cadastro rápido por
  // último, quando presente. Um único índice cobre as duas.
  const totalNavegavel = filtradas.length + (mostrarCriarNovo ? 1 : 0)

  function abrir() {
    setBusca('')
    setDestacado(0)
    setOpen(true)
  }

  function fechar() {
    setOpen(false)
    setBusca('')
  }

  function selecionar(option: AutocompleteOption) {
    onValueChange(option.value)
    fechar()
  }

  async function criarNovo() {
    if (!onQuickCreate || !termoDigitado) return
    setCriando(true)
    try {
      const nova = await onQuickCreate(termoDigitado)
      setCriadaAgoraPouco(nova)
      selecionar(nova)
    } finally {
      setCriando(false)
    }
  }

  function handleFocus() {
    if (disabled || isLoading) return
    abrir()
  }

  function handleBlur() {
    // Delay para o `onClick`/`onKeyDown` de um item da lista rodar antes do painel fechar —
    // sem isso, o blur fecha o painel antes do clique ser processado.
    blurTimeoutRef.current = setTimeout(fechar, 150)
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setBusca(event.target.value)
    setDestacado(0)
    if (!open) setOpen(true)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setDestacado((atual) => Math.min(atual + 1, totalNavegavel - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setDestacado((atual) => Math.max(atual - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      clearTimeout(blurTimeoutRef.current)
      if (destacado < filtradas.length) {
        const opcao = filtradas[destacado]
        if (opcao) selecionar(opcao)
      } else if (mostrarCriarNovo) {
        void criarNovo()
      }
    } else if (event.key === 'Escape') {
      event.preventDefault()
      fechar()
    }
  }

  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Popover.Root open={open && !disabled && !isLoading} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <Input
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            value={textoExibido}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'Carregando...' : placeholder}
            disabled={disabled || isLoading}
            autoComplete="off"
          />
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(event) => event.preventDefault()}
            // O painel é aberto/fechado inteiramente por `onFocus`/`onBlur`/`onKeyDown` do
            // próprio input (abaixo) — o `DismissableLayer` do Radix, por padrão, também tenta
            // fechar sozinho em qualquer interação "de fora" do `Content`. Como o input vive
            // dentro de `Popover.Anchor` (só posicionamento, não é o `Trigger` que o Radix
            // reconhece como "de dentro"), o próprio clique que abre o campo já conta como
            // "fora" para o Radix, fechando o painel no mesmo instante em que ele abre — achado
            // real, só reproduzível com foco de janela verdadeiro (não em jsdom). Desligado
            // aqui porque já é redundante com o `onBlur` que trata exatamente esse caso.
            onPointerDownOutside={(event) => event.preventDefault()}
            onFocusOutside={(event) => event.preventDefault()}
            className="z-50 max-h-60 w-[var(--radix-popper-anchor-width)] overflow-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
          >
            {filtradas.length === 0 && !mostrarCriarNovo && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">Nenhum resultado</p>
            )}
            {filtradas.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setDestacado(index)}
                onClick={() => selecionar(option)}
                className={cn(
                  'block w-full rounded-md px-2 py-1.5 text-left text-sm',
                  index === destacado ? 'bg-accent text-accent-foreground' : 'hover:bg-accent',
                )}
              >
                {option.label}
              </button>
            ))}
            {mostrarCriarNovo && (
              <button
                type="button"
                role="option"
                aria-selected={false}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setDestacado(filtradas.length)}
                onClick={() => void criarNovo()}
                disabled={criando}
                className={cn(
                  'block w-full rounded-md px-2 py-1.5 text-left text-sm text-primary disabled:opacity-50',
                  destacado === filtradas.length ? 'bg-accent' : 'hover:bg-accent',
                )}
              >
                {criando ? 'Criando...' : quickCreateLabel(termoDigitado)}
              </button>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
