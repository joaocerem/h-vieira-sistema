CREATE TABLE ajustes_financeiros (
    id UUID DEFAULT gen_random_uuid(),
    lancamento_original_id UUID NOT NULL,
    lancamento_ajuste_id UUID NOT NULL,
    tipo_ajuste TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    data DATE NOT NULL,
    usuario_id UUID NOT NULL,
    observacao TEXT,
    CONSTRAINT pk_ajustes_financeiros PRIMARY KEY (id),
    CONSTRAINT uq_ajustes_financeiros_lancamento_ajuste UNIQUE (lancamento_ajuste_id),
    CONSTRAINT ck_ajustes_financeiros_tipo_ajuste CHECK (tipo_ajuste IN ('Estorno', 'Reembolso', 'Crédito', 'Ajuste')),
    CONSTRAINT ck_ajustes_financeiros_valor_positivo CHECK (valor > 0),
    CONSTRAINT ck_ajustes_financeiros_lancamentos_distintos CHECK (lancamento_original_id <> lancamento_ajuste_id)
);
