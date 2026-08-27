/**
 * Formatadores compartilhados — extraídos nesta sessão porque Lançamento Financeiro e
 * Liquidação Financeira precisam exatamente da mesma formatação de data e valor monetário
 * (reuso real e simultâneo, não antecipado).
 */

/**
 * `YYYY-MM-DD` (formato de `LocalDate` do backend, já serializado assim pelo Jackson) →
 * `DD/MM/AAAA`. Manipulação de string, não `Date` — evitar `new Date('YYYY-MM-DD')` é
 * proposital: o JS interpreta essa string como UTC meia-noite, e `toLocaleDateString` pode
 * exibir o dia anterior em fusos horários negativos (ex. Brasil, UTC-3).
 */
export function formatDate(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split('-')
  return `${dia}/${mes}/${ano}`
}

/** Valor monetário em Real (BRL) — usado em toda exibição de `valor`/`valorAplicado`. */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
