-- Módulo Conciliação Bancária (docs/domain-model/12-14, docs/modelo-logico.md Seção 3.12-3.14).
-- Três tabelas: fato puro do extrato (movimentacoes_bancarias), vínculo de transferência entre contas
-- próprias (transferencias_internas) e estado da conferência banco x financeiro (vinculos_conciliacao).

CREATE TABLE movimentacoes_bancarias (
    id UUID DEFAULT gen_random_uuid(),
    conta_bancaria_id UUID NOT NULL,
    data DATE NOT NULL,
    descricao TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    classificacao TEXT NOT NULL DEFAULT 'Não Classificada',
    CONSTRAINT pk_movimentacoes_bancarias PRIMARY KEY (id),
    CONSTRAINT ck_movimentacoes_bancarias_classificacao CHECK (classificacao IN ('Terraplanagem', 'Fora da Operação', 'Transferência Interna', 'Retirada do Patrão', 'Não Classificada'))
);

ALTER TABLE movimentacoes_bancarias ADD CONSTRAINT fk_movimentacoes_bancarias_conta_bancaria FOREIGN KEY (conta_bancaria_id) REFERENCES contas_bancarias (id) ON DELETE RESTRICT;
CREATE INDEX idx_movimentacoes_bancarias_conta_bancaria_id ON movimentacoes_bancarias (conta_bancaria_id);

CREATE TABLE transferencias_internas (
    id UUID DEFAULT gen_random_uuid(),
    movimentacao_origem_id UUID NOT NULL,
    movimentacao_destino_id UUID NOT NULL,
    valor NUMERIC NOT NULL,
    data DATE NOT NULL,
    CONSTRAINT pk_transferencias_internas PRIMARY KEY (id),
    CONSTRAINT uq_transferencias_internas_movimentacao_origem UNIQUE (movimentacao_origem_id),
    CONSTRAINT uq_transferencias_internas_movimentacao_destino UNIQUE (movimentacao_destino_id),
    CONSTRAINT ck_transferencias_internas_valor_positivo CHECK (valor > 0),
    CONSTRAINT ck_transferencias_internas_origem_destino_distintos CHECK (movimentacao_origem_id <> movimentacao_destino_id)
);

ALTER TABLE transferencias_internas ADD CONSTRAINT fk_transferencias_internas_movimentacao_origem FOREIGN KEY (movimentacao_origem_id) REFERENCES movimentacoes_bancarias (id) ON DELETE RESTRICT;
ALTER TABLE transferencias_internas ADD CONSTRAINT fk_transferencias_internas_movimentacao_destino FOREIGN KEY (movimentacao_destino_id) REFERENCES movimentacoes_bancarias (id) ON DELETE RESTRICT;
CREATE INDEX idx_transferencias_internas_movimentacao_origem_id ON transferencias_internas (movimentacao_origem_id);
CREATE INDEX idx_transferencias_internas_movimentacao_destino_id ON transferencias_internas (movimentacao_destino_id);

CREATE TABLE vinculos_conciliacao (
    id UUID DEFAULT gen_random_uuid(),
    movimentacao_bancaria_id UUID NOT NULL,
    liquidacao_financeira_id UUID,
    estado_conciliacao TEXT NOT NULL DEFAULT 'Não Vinculado',
    CONSTRAINT pk_vinculos_conciliacao PRIMARY KEY (id),
    CONSTRAINT uq_vinculos_conciliacao_movimentacao_bancaria UNIQUE (movimentacao_bancaria_id),
    CONSTRAINT uq_vinculos_conciliacao_liquidacao_financeira UNIQUE (liquidacao_financeira_id),
    CONSTRAINT ck_vinculos_conciliacao_estado CHECK (estado_conciliacao IN ('Não Vinculado', 'Sugerido', 'Confirmado', 'Divergente', 'Sem Correspondência')),
    CONSTRAINT ck_vinculos_conciliacao_liquidacao_coerente_com_estado CHECK (
        (estado_conciliacao IN ('Não Vinculado', 'Sem Correspondência') AND liquidacao_financeira_id IS NULL)
        OR
        (estado_conciliacao IN ('Sugerido', 'Confirmado', 'Divergente') AND liquidacao_financeira_id IS NOT NULL)
    )
);

ALTER TABLE vinculos_conciliacao ADD CONSTRAINT fk_vinculos_conciliacao_movimentacao_bancaria FOREIGN KEY (movimentacao_bancaria_id) REFERENCES movimentacoes_bancarias (id) ON DELETE RESTRICT;
ALTER TABLE vinculos_conciliacao ADD CONSTRAINT fk_vinculos_conciliacao_liquidacao_financeira FOREIGN KEY (liquidacao_financeira_id) REFERENCES liquidacoes_financeiras (id) ON DELETE RESTRICT;
CREATE INDEX idx_vinculos_conciliacao_movimentacao_bancaria_id ON vinculos_conciliacao (movimentacao_bancaria_id);
CREATE INDEX idx_vinculos_conciliacao_liquidacao_financeira_id ON vinculos_conciliacao (liquidacao_financeira_id);
