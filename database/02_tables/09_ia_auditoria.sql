CREATE TABLE sugestoes_ia (
    id UUID DEFAULT gen_random_uuid(),
    entidade_alvo_tipo TEXT NOT NULL,
    entidade_alvo_id UUID NOT NULL,
    campo_sugerido TEXT NOT NULL,
    valor_sugerido TEXT NOT NULL,
    justificativa TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    grupo_sugestao_id UUID,
    CONSTRAINT pk_sugestoes_ia PRIMARY KEY (id),
    CONSTRAINT ck_sugestoes_ia_campo_sugerido CHECK (campo_sugerido IN ('categoria', 'classificação', 'obra', 'veículo')),
    CONSTRAINT ck_sugestoes_ia_entidade_alvo_tipo CHECK (entidade_alvo_tipo IN ('Movimentação Bancária', 'Lançamento Financeiro'))
);

CREATE TABLE acoes_propostas_ia (
    id UUID DEFAULT gen_random_uuid(),
    tipo_acao TEXT NOT NULL,
    dados_propostos TEXT NOT NULL,
    nivel_sensibilidade TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    empresa_id UUID,
    CONSTRAINT pk_acoes_propostas_ia PRIMARY KEY (id),
    CONSTRAINT ck_acoes_propostas_ia_nivel_sensibilidade CHECK (nivel_sensibilidade IN ('Baixo', 'Médio', 'Alto')),
    CONSTRAINT ck_acoes_propostas_ia_empresa_condicional CHECK (
        (status = 'Aguardando Empresa' AND empresa_id IS NULL)
        OR
        (status <> 'Aguardando Empresa' AND empresa_id IS NOT NULL)
    )
);

CREATE TABLE logs_auditoria (
    id UUID DEFAULT gen_random_uuid(),
    entidade TEXT NOT NULL,
    entidade_id UUID NOT NULL,
    campo_alterado TEXT NOT NULL,
    valor_anterior TEXT NOT NULL,
    valor_novo TEXT NOT NULL,
    data_hora TIMESTAMPTZ NOT NULL,
    usuario_id UUID,
    origem TEXT NOT NULL,
    referencia_tipo TEXT,
    referencia_id UUID,
    CONSTRAINT pk_logs_auditoria PRIMARY KEY (id),
    CONSTRAINT ck_logs_auditoria_origem CHECK (origem IN ('Manual', 'Importação Bancária', 'Sugestão de IA Confirmada', 'Ação de IA Confirmada')),
    CONSTRAINT ck_logs_auditoria_usuario_condicional CHECK (
        (origem = 'Importação Bancária' AND usuario_id IS NULL)
        OR
        (origem <> 'Importação Bancária' AND usuario_id IS NOT NULL)
    ),
    CONSTRAINT ck_logs_auditoria_referencia_condicional CHECK (
        (origem IN ('Sugestão de IA Confirmada', 'Ação de IA Confirmada') AND referencia_tipo IS NOT NULL AND referencia_id IS NOT NULL)
        OR
        (origem NOT IN ('Sugestão de IA Confirmada', 'Ação de IA Confirmada') AND referencia_tipo IS NULL AND referencia_id IS NULL)
    )
);
