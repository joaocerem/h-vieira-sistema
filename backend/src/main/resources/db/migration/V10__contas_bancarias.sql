CREATE TABLE contas_bancarias (
    id UUID DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL,
    banco TEXT NOT NULL,
    apelido TEXT NOT NULL,
    CONSTRAINT pk_contas_bancarias PRIMARY KEY (id)
);
