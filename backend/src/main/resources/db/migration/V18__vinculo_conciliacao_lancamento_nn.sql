-- Sprint 3 (rodada de evolução operacional) — Etapa 1: estrutura nova, aditiva. Vínculo
-- Conciliação passa a referenciar Lançamento Financeiro diretamente (N:N) — uma única
-- Movimentação Bancária pode representar vários Lançamentos (ex. pagamento de fatura de cartão
-- cobrindo várias Parcelas de uma vez, vários títulos pagos num único débito). Sem coluna de
-- valor por par (diferente de `aplicacoes_de_liquidacao`) — não existe mais cobertura parcial,
-- não há nada para guardar além de "este Lançamento está ligado a este Vínculo". Mapeada como
-- `@ManyToMany` simples no Java (`VinculoConciliacao.lancamentosFinanceiros`) — só detalhe de
-- persistência, sem entidade de domínio própria para esta tabela.
--
-- Aditiva de propósito: a coluna `liquidacao_financeira_id` de `vinculos_conciliacao` (e as
-- tabelas de Liquidação/Aplicação/Ajuste) permanecem intactas nesta migration — removidas só
-- na migration final da sprint, depois de toda a lógica nova validada (decisão explícita do
-- usuário: reduzir risco mantendo a estrutura antiga disponível até o fim da implementação).
CREATE TABLE vinculos_conciliacao_lancamentos (
    id UUID DEFAULT gen_random_uuid(),
    vinculo_conciliacao_id UUID NOT NULL,
    lancamento_financeiro_id UUID NOT NULL,
    CONSTRAINT pk_vinculos_conciliacao_lancamentos PRIMARY KEY (id),
    CONSTRAINT uq_vinculos_conciliacao_lancamentos UNIQUE (vinculo_conciliacao_id, lancamento_financeiro_id)
);

ALTER TABLE vinculos_conciliacao_lancamentos ADD CONSTRAINT fk_vcl_vinculo_conciliacao FOREIGN KEY (vinculo_conciliacao_id) REFERENCES vinculos_conciliacao (id) ON DELETE RESTRICT;
ALTER TABLE vinculos_conciliacao_lancamentos ADD CONSTRAINT fk_vcl_lancamento_financeiro FOREIGN KEY (lancamento_financeiro_id) REFERENCES lancamentos_financeiros (id) ON DELETE RESTRICT;
CREATE INDEX idx_vcl_vinculo_conciliacao_id ON vinculos_conciliacao_lancamentos (vinculo_conciliacao_id);
CREATE INDEX idx_vcl_lancamento_financeiro_id ON vinculos_conciliacao_lancamentos (lancamento_financeiro_id);
