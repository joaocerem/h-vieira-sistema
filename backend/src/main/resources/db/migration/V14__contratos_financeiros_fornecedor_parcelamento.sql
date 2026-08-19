-- Decisão #40 (docs/decisions.md): CONTRATO_FINANCEIRO ganha estrutura de parcelamento e passa a
-- referenciar FORNECEDOR diretamente, em vez de manter "instituicao" como texto livre.
-- Tabela sem registros no momento desta migration — sem necessidade de migração de dados.

ALTER TABLE contratos_financeiros DROP COLUMN instituicao;

ALTER TABLE contratos_financeiros ADD COLUMN fornecedor_id UUID NOT NULL;
ALTER TABLE contratos_financeiros ADD CONSTRAINT fk_contratos_financeiros_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id) ON DELETE RESTRICT;
CREATE INDEX idx_contratos_financeiros_fornecedor_id ON contratos_financeiros (fornecedor_id);

ALTER TABLE contratos_financeiros ADD COLUMN numero_parcelas INTEGER NOT NULL;
ALTER TABLE contratos_financeiros ADD COLUMN data_vencimento_primeira_parcela DATE NOT NULL;
