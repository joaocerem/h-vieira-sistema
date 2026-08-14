CREATE TABLE lancamentos_financeiros (
    id UUID DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    categoria_id UUID NOT NULL,
    fornecedor_id UUID,
    cliente_id UUID,
    obra_id UUID,
    veiculo_id UUID,
    valor NUMERIC NOT NULL,
    data_competencia DATE NOT NULL,
    vencimento DATE NOT NULL,
    situacao_administrativa TEXT NOT NULL DEFAULT 'Ativo',
    origem TEXT NOT NULL,
    CONSTRAINT pk_lancamentos_financeiros PRIMARY KEY (id),
    CONSTRAINT ck_lancamentos_financeiros_tipo CHECK (tipo IN ('Despesa', 'Receita')),
    CONSTRAINT ck_lancamentos_financeiros_situacao_administrativa CHECK (situacao_administrativa IN ('Ativo', 'Cancelado')),
    CONSTRAINT ck_lancamentos_financeiros_origem CHECK (origem IN ('Manual', 'Cartão via Parcela', 'Contrato Financeiro via Parcela', 'Ação de IA Confirmada')),
    CONSTRAINT ck_lancamentos_financeiros_valor_positivo CHECK (valor > 0),
    CONSTRAINT ck_lancamentos_financeiros_fornecedor_cliente_exclusivo CHECK (
        (tipo = 'Despesa' AND fornecedor_id IS NOT NULL AND cliente_id IS NULL)
        OR
        (tipo = 'Receita' AND cliente_id IS NOT NULL AND fornecedor_id IS NULL)
    )
);
