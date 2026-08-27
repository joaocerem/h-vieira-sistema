import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { FormField } from '@/shared/components/form/FormField'
import { SelectField } from '@/shared/components/form/SelectField'
import { useLancamentoOptions } from '@/shared/hooks/useLancamentoOptions'
import { useUsuarioOptions } from '@/shared/hooks/useUsuarioOptions'
import { formatCurrency, formatDate } from '@/shared/lib/formatters'
import type { FieldError } from '@/shared/api/errors'

const TIPOS_AJUSTE = ['Estorno', 'Reembolso', 'Crédito', 'Ajuste'] as const

const schema = z.object({
  lancamentoOriginalId: z.string().min(1, 'Lançamento original é obrigatório'),
  lancamentoAjusteId: z.string().min(1, 'Lançamento de ajuste é obrigatório'),
  tipoAjuste: z.enum(TIPOS_AJUSTE, { message: 'Tipo de ajuste é obrigatório' }),
  valor: z.coerce.number().positive('Valor deve ser um valor monetário positivo'),
  data: z.string().min(1, 'Data é obrigatória'),
  usuarioId: z.string().min(1, 'Usuário é obrigatório'),
  observacao: z.string().optional(),
})

// `z.output`, não `z.infer` — `valor` via `z.coerce.number()`, mesmo padrão documentado em
// `arquitetura-tecnica-frontend.md`, Seção 5.
export type AjusteFinanceiroFormValues = z.output<typeof schema>

/**
 * Só criação — Ajuste Financeiro é imutável desde a criação (D13, `decisions.md` decisão #34),
 * sem `atualizar` (mesmo padrão de `LiquidacaoForm.tsx`, sem prop `modo`). O Lançamento de
 * ajuste (`lancamentoAjusteId`) precisa já existir — este formulário só formaliza o vínculo,
 * nunca cria o Lançamento em si (`AjusteFinanceiroService`, comentário do backend).
 *
 * Lançamentos Cancelados excluídos das duas seleções — o backend recusa tanto o original quanto
 * o de ajuste se qualquer um deles estiver Cancelado (`AjusteFinanceiroService#criar`); filtrado
 * aqui só para experiência de uso, quem valida de fato continua sendo o backend. Origem e
 * destino mutuamente exclusivas — checado manualmente no `onSubmit`, não via `.superRefine()`
 * (mesmo padrão já documentado em `TransferenciaInternaForm.tsx`).
 */
export function AjusteFinanceiroForm({
  defaultLancamentoOriginalId,
  onSubmit,
  isSubmitting,
  serverFieldErrors,
}: {
  defaultLancamentoOriginalId?: string
  onSubmit: (values: AjusteFinanceiroFormValues) => void
  isSubmitting: boolean
  serverFieldErrors?: FieldError[]
}) {
  const { data: lancamentos, isLoading: isLoadingLancamentos } = useLancamentoOptions()
  const { data: usuarios, isLoading: isLoadingUsuarios } = useUsuarioOptions()

  const form = useForm<z.input<typeof schema>, unknown, AjusteFinanceiroFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      lancamentoOriginalId: defaultLancamentoOriginalId ?? '',
      lancamentoAjusteId: '',
      tipoAjuste: 'Estorno',
      valor: undefined,
      data: '',
      usuarioId: '',
      observacao: '',
    },
  })

  useEffect(() => {
    serverFieldErrors?.forEach((fieldError) => {
      const campo = fieldError.field as keyof AjusteFinanceiroFormValues
      if (Object.keys(schema.shape).includes(campo)) {
        form.setError(campo, { type: 'server', message: fieldError.message })
      }
    })
  }, [serverFieldErrors, form])

  const lancamentosElegiveis = (lancamentos ?? []).filter(
    (lancamento) => lancamento.situacaoAdministrativa !== 'Cancelado',
  )
  const opcoesLancamento = lancamentosElegiveis.map((lancamento) => ({
    value: lancamento.id,
    label: `${lancamento.tipo} • ${formatCurrency(lancamento.valor)} • vence ${formatDate(lancamento.vencimento)}`,
  }))

  function handleValidSubmit(values: AjusteFinanceiroFormValues) {
    if (values.lancamentoOriginalId === values.lancamentoAjusteId) {
      form.setError('lancamentoAjusteId', {
        type: 'manual',
        message: 'Lançamento de ajuste deve ser diferente do original',
      })
      return
    }
    onSubmit(values)
  }

  return (
    <form onSubmit={form.handleSubmit(handleValidSubmit)} className="grid max-w-md gap-4">
      <SelectField
        id="lancamentoOriginalId"
        label="Lançamento original"
        placeholder={isLoadingLancamentos ? 'Carregando...' : 'Selecione o lançamento original'}
        options={opcoesLancamento}
        error={form.formState.errors.lancamentoOriginalId?.message}
        disabled={isLoadingLancamentos}
        {...form.register('lancamentoOriginalId')}
      />

      <SelectField
        id="lancamentoAjusteId"
        label="Lançamento de ajuste"
        placeholder={isLoadingLancamentos ? 'Carregando...' : 'Selecione o lançamento de ajuste'}
        options={opcoesLancamento}
        error={form.formState.errors.lancamentoAjusteId?.message}
        disabled={isLoadingLancamentos}
        {...form.register('lancamentoAjusteId')}
      />

      <SelectField
        id="tipoAjuste"
        label="Tipo de ajuste"
        placeholder="Selecione o tipo"
        options={TIPOS_AJUSTE.map((valor) => ({ value: valor, label: valor }))}
        error={form.formState.errors.tipoAjuste?.message}
        {...form.register('tipoAjuste')}
      />

      <FormField id="valor" label="Valor" error={form.formState.errors.valor?.message}>
        <Input id="valor" type="number" step="0.01" {...form.register('valor')} />
      </FormField>

      <FormField id="data" label="Data" error={form.formState.errors.data?.message}>
        <Input id="data" type="date" {...form.register('data')} />
      </FormField>

      <SelectField
        id="usuarioId"
        label="Usuário responsável"
        placeholder={isLoadingUsuarios ? 'Carregando...' : 'Selecione o usuário'}
        options={(usuarios ?? []).map((usuario) => ({ value: usuario.id, label: usuario.nome }))}
        error={form.formState.errors.usuarioId?.message}
        disabled={isLoadingUsuarios}
        {...form.register('usuarioId')}
      />

      <FormField id="observacao" label="Observação" error={form.formState.errors.observacao?.message}>
        <Input id="observacao" placeholder="Motivo/contexto do ajuste (opcional)" {...form.register('observacao')} />
      </FormField>

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Criar ajuste'}
        </Button>
      </div>
    </form>
  )
}
