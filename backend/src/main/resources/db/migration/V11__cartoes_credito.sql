CREATE TABLE cartoes_credito (
    id UUID DEFAULT gen_random_uuid(),
    conta_bancaria_id UUID NOT NULL,
    banco TEXT NOT NULL,
    apelido TEXT NOT NULL,
    dia_fechamento INTEGER NOT NULL,
    dia_vencimento INTEGER NOT NULL,
    CONSTRAINT pk_cartoes_credito PRIMARY KEY (id)
);
