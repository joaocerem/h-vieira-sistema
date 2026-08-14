CREATE INDEX idx_lancamentos_financeiros_categoria_id ON lancamentos_financeiros (categoria_id);
CREATE INDEX idx_lancamentos_financeiros_fornecedor_id ON lancamentos_financeiros (fornecedor_id);
CREATE INDEX idx_lancamentos_financeiros_cliente_id ON lancamentos_financeiros (cliente_id);
CREATE INDEX idx_lancamentos_financeiros_obra_id ON lancamentos_financeiros (obra_id);
CREATE INDEX idx_lancamentos_financeiros_veiculo_id ON lancamentos_financeiros (veiculo_id);
CREATE INDEX idx_lancamentos_financeiros_data_competencia ON lancamentos_financeiros (data_competencia);

CREATE INDEX idx_aplicacoes_de_liquidacao_lancamento_financeiro_id ON aplicacoes_de_liquidacao (lancamento_financeiro_id);
CREATE INDEX idx_aplicacoes_de_liquidacao_liquidacao_financeira_id ON aplicacoes_de_liquidacao (liquidacao_financeira_id);

CREATE INDEX idx_ajustes_financeiros_lancamento_original_id ON ajustes_financeiros (lancamento_original_id);
CREATE INDEX idx_ajustes_financeiros_usuario_id ON ajustes_financeiros (usuario_id);

CREATE INDEX idx_compras_cartao_fornecedor_id ON compras_cartao (fornecedor_id);
CREATE INDEX idx_compras_cartao_categoria_id ON compras_cartao (categoria_id);
CREATE INDEX idx_compras_cartao_obra_id ON compras_cartao (obra_id);
CREATE INDEX idx_compras_cartao_veiculo_id ON compras_cartao (veiculo_id);

CREATE INDEX idx_parcelas_compra_cartao_id ON parcelas (compra_cartao_id);
CREATE INDEX idx_parcelas_contrato_financeiro_id ON parcelas (contrato_financeiro_id);
CREATE INDEX idx_parcelas_fatura_id ON parcelas (fatura_id);

CREATE INDEX idx_contratos_financeiros_empresa_id ON contratos_financeiros (empresa_id);
CREATE INDEX idx_contratos_financeiros_veiculo_id ON contratos_financeiros (veiculo_id);

CREATE INDEX idx_obras_cliente_id ON obras (cliente_id);

CREATE INDEX idx_veiculos_empresa_id ON veiculos (empresa_id);

CREATE INDEX idx_rateios_despesa_lancamento_financeiro_id ON rateios_despesa (lancamento_financeiro_id);
CREATE INDEX idx_rateios_despesa_obra_id ON rateios_despesa (obra_id);

CREATE INDEX idx_sugestoes_ia_grupo_sugestao_id ON sugestoes_ia (grupo_sugestao_id);

CREATE INDEX idx_logs_auditoria_usuario_id ON logs_auditoria (usuario_id);
