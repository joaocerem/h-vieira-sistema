CREATE TABLE compras_cartao (
    id UUID DEFAULT gen_random_uuid(),
    cartao_id UUID NOT NULL,
    fornecedor_id UUID NOT NULL,
    valor NUMERIC NOT NULL,
    data DATE NOT NULL,
    categoria_id UUID NOT NULL,
    classificacao TEXT NOT NULL DEFAULT 'Não Classificada',
    obra_id UUID,
    veiculo_id UUID,
    numero_parcelas INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT pk_compras_cartao PRIMARY KEY (id),
    CONSTRAINT ck_compras_cartao_valor_positivo CHECK (valor > 0),
    CONSTRAINT ck_compras_cartao_classificacao CHECK (classificacao IN ('Terraplanagem', 'Fora da Operação', 'Transferência Interna', 'Retirada do Patrão', 'Não Classificada')),
    CONSTRAINT ck_compras_cartao_numero_parcelas_positivo CHECK (numero_parcelas > 0)
);

CREATE TABLE faturas (
    id UUID DEFAULT gen_random_uuid(),
    cartao_id UUID NOT NULL,
    ciclo TEXT NOT NULL,
    valor_total_calculado NUMERIC NOT NULL,
    valor_cobrado NUMERIC NOT NULL,
    liquidacao_financeira_id UUID,
    CONSTRAINT pk_faturas PRIMARY KEY (id),
    CONSTRAINT uq_faturas_cartao_ciclo UNIQUE (cartao_id, ciclo),
    CONSTRAINT uq_faturas_liquidacao_financeira UNIQUE (liquidacao_financeira_id)
);

CREATE TABLE parcelas (
    id UUID DEFAULT gen_random_uuid(),
    origem TEXT NOT NULL,
    compra_cartao_id UUID,
    contrato_financeiro_id UUID,
    numero INTEGER NOT NULL,
    total INTEGER NOT NULL,
    valor NUMERIC NOT NULL,
    vencimento DATE NOT NULL,
    status TEXT NOT NULL,
    fatura_id UUID,
    lancamento_financeiro_id UUID,
    CONSTRAINT pk_parcelas PRIMARY KEY (id),
    CONSTRAINT uq_parcelas_lancamento_financeiro UNIQUE (lancamento_financeiro_id),
    CONSTRAINT ck_parcelas_origem CHECK (origem IN ('Compra Cartão', 'Contrato Financeiro')),
    CONSTRAINT ck_parcelas_origem_exclusiva CHECK (
        (origem = 'Compra Cartão' AND compra_cartao_id IS NOT NULL AND contrato_financeiro_id IS NULL)
        OR
        (origem = 'Contrato Financeiro' AND contrato_financeiro_id IS NOT NULL AND compra_cartao_id IS NULL)
    ),
    CONSTRAINT ck_parcelas_fatura_apenas_compra_cartao CHECK (
        fatura_id IS NULL OR origem = 'Compra Cartão'
    ),
    CONSTRAINT ck_parcelas_numero_positivo CHECK (numero > 0),
    CONSTRAINT ck_parcelas_numero_menor_igual_total CHECK (numero <= total),
    CONSTRAINT ck_parcelas_total_positivo CHECK (total > 0),
    CONSTRAINT ck_parcelas_valor_positivo CHECK (valor > 0)
);
