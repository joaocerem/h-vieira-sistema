CREATE TABLE liquidacoes_financeiras (
    id UUID DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    data_efetiva DATE NOT NULL,
    valor NUMERIC NOT NULL,
    conta_bancaria_id UUID NOT NULL,
    CONSTRAINT pk_liquidacoes_financeiras PRIMARY KEY (id),
    CONSTRAINT ck_liquidacoes_financeiras_tipo CHECK (tipo IN ('Pagamento', 'Recebimento')),
    CONSTRAINT ck_liquidacoes_financeiras_valor_positivo CHECK (valor > 0)
);
