CREATE TABLE aplicacoes_de_liquidacao (
    id UUID DEFAULT gen_random_uuid(),
    lancamento_financeiro_id UUID NOT NULL,
    liquidacao_financeira_id UUID NOT NULL,
    valor_aplicado NUMERIC NOT NULL,
    CONSTRAINT pk_aplicacoes_de_liquidacao PRIMARY KEY (id),
    CONSTRAINT ck_aplicacoes_de_liquidacao_valor_positivo CHECK (valor_aplicado > 0)
);
