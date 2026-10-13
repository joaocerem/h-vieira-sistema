-- Sprint 3 (rodada de evolução operacional) — remoção definitiva de Liquidação Financeira,
-- Aplicação de Liquidação e Ajuste Financeiro, substituídas pela conciliação bancária direta
-- (Vínculo Conciliação N:N com Lançamento Financeiro, V18). Migração final da sequência
-- aprovada pelo usuário: arquitetura nova construída e validada (V17/V18) antes desta remoção.

-- vinculos_conciliacao: solta a referência a liquidacoes_financeiras, incluindo o CHECK que
-- exigia liquidacao_financeira_id preenchido para os estados Sugerido/Confirmado/Divergente —
-- esse CHECK bloquearia a própria arquitetura nova (que nunca preenche essa coluna).
ALTER TABLE vinculos_conciliacao DROP CONSTRAINT ck_vinculos_conciliacao_liquidacao_coerente_com_estado;
ALTER TABLE vinculos_conciliacao DROP CONSTRAINT fk_vinculos_conciliacao_liquidacao_financeira;
ALTER TABLE vinculos_conciliacao DROP CONSTRAINT uq_vinculos_conciliacao_liquidacao_financeira;
DROP INDEX idx_vinculos_conciliacao_liquidacao_financeira_id;
ALTER TABLE vinculos_conciliacao DROP COLUMN liquidacao_financeira_id;

-- faturas: solta a referência a liquidacoes_financeiras — "paga" passa a ser sempre calculado
-- em tempo de leitura a partir da conciliação bancária das Parcelas (nunca persistido).
ALTER TABLE faturas DROP CONSTRAINT fk_faturas_liquidacao_financeira;
ALTER TABLE faturas DROP CONSTRAINT uq_faturas_liquidacao_financeira;
ALTER TABLE faturas DROP COLUMN liquidacao_financeira_id;

-- Estruturas antigas, sem mais nenhuma referência apontando para elas.
DROP TABLE aplicacoes_de_liquidacao;
DROP TABLE ajustes_financeiros;
DROP TABLE liquidacoes_financeiras;
