CREATE TABLE obras (
    id UUID DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL,
    nome TEXT NOT NULL,
    valor_contratado NUMERIC NOT NULL,
    data_inicio DATE NOT NULL,
    data_prevista_termino DATE NOT NULL,
    data_real_termino DATE,
    status TEXT NOT NULL,
    CONSTRAINT pk_obras PRIMARY KEY (id)
);

CREATE TABLE veiculos (
    id UUID DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL,
    nome_identificacao TEXT NOT NULL,
    tipo TEXT NOT NULL,
    CONSTRAINT pk_veiculos PRIMARY KEY (id)
);

CREATE TABLE rateios_despesa (
    id UUID DEFAULT gen_random_uuid(),
    lancamento_financeiro_id UUID NOT NULL,
    obra_id UUID NOT NULL,
    valor_rateado NUMERIC NOT NULL,
    criterio_informado TEXT,
    CONSTRAINT pk_rateios_despesa PRIMARY KEY (id)
);
