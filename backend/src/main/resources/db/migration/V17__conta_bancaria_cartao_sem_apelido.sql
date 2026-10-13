-- Decisão de negócio (Sprint 3, rodada de evolução operacional): Conta Bancária e Cartão de
-- Crédito perdem o campo "apelido" — identificação passa a ser Empresa + Banco. Removida no
-- início da sprint (não é parte do risco da remoção de Liquidação/Ajuste, por isso não precisa
-- esperar o final) — mesmo precedente de V14 (DROP COLUMN direto).
ALTER TABLE contas_bancarias DROP COLUMN apelido;
ALTER TABLE cartoes_credito DROP COLUMN apelido;
