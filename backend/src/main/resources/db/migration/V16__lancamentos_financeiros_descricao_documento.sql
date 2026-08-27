-- Decisão de negócio (rodada de evolução): Lançamento Financeiro passa a registrar descrição
-- (texto livre) e documento/NF (número do documento fiscal ou comprovante). Ambos opcionais,
-- sem regra de negócio associada além da própria existência — por isso sem CHECK/NOT NULL.
ALTER TABLE lancamentos_financeiros
    ADD COLUMN descricao TEXT,
    ADD COLUMN documento TEXT;
