CREATE TABLE obras (
    id UUID DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL,
    nome TEXT NOT NULL,
    valor_contratado NUMERIC NOT NULL,
    data_inicio DATE NOT NULL,
    data_prevista_termino DATE NOT NULL,
    data_real_termino DATE,
    status TEXT NOT NULL DEFAULT 'A executar',
    CONSTRAINT pk_obras PRIMARY KEY (id),
    CONSTRAINT ck_obras_status CHECK (status IN ('A executar', 'Em andamento', 'Pausada', 'Concluída'))
);

CREATE TABLE veiculos (
    id UUID DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL,
    nome_identificacao TEXT NOT NULL,
    tipo TEXT NOT NULL,
    obra_atual_id UUID,
    CONSTRAINT pk_veiculos PRIMARY KEY (id),
    CONSTRAINT ck_veiculos_tipo CHECK (tipo IN ('Caminhão', 'Escavadeira', 'Pá carregadeira', 'Trator', 'Rolo compactador', 'Veículo leve', 'Terceiro', 'Outro'))
);

CREATE TABLE rateios_despesa (
    id UUID DEFAULT gen_random_uuid(),
    lancamento_financeiro_id UUID NOT NULL,
    obra_id UUID NOT NULL,
    valor_rateado NUMERIC NOT NULL,
    criterio_informado TEXT,
    CONSTRAINT pk_rateios_despesa PRIMARY KEY (id)
);
