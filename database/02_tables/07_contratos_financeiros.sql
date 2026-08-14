CREATE TABLE contratos_financeiros (
    id UUID DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    empresa_id UUID NOT NULL,
    conta_bancaria_id UUID NOT NULL,
    instituicao TEXT NOT NULL,
    valor_contratado NUMERIC NOT NULL,
    taxa NUMERIC,
    grupo_cota TEXT,
    contemplado BOOLEAN DEFAULT false,
    veiculo_id UUID,
    CONSTRAINT pk_contratos_financeiros PRIMARY KEY (id),
    CONSTRAINT ck_contratos_financeiros_tipo CHECK (tipo IN ('Financiamento', 'Consórcio')),
    CONSTRAINT ck_contratos_financeiros_taxa_grupo_cota_exclusivo CHECK (
        (tipo = 'Financiamento' AND taxa IS NOT NULL AND grupo_cota IS NULL AND contemplado IS NULL)
        OR
        (tipo = 'Consórcio' AND taxa IS NULL AND grupo_cota IS NOT NULL AND contemplado IS NOT NULL)
    ),
    CONSTRAINT ck_contratos_financeiros_veiculo_apenas_consorcio_contemplado CHECK (
        veiculo_id IS NULL OR (tipo = 'Consórcio' AND contemplado = true)
    )
);
