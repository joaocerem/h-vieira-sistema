ALTER TABLE lancamentos_financeiros ADD CONSTRAINT fk_lancamentos_financeiros_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE RESTRICT;
ALTER TABLE lancamentos_financeiros ADD CONSTRAINT fk_lancamentos_financeiros_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id) ON DELETE RESTRICT;
ALTER TABLE lancamentos_financeiros ADD CONSTRAINT fk_lancamentos_financeiros_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE RESTRICT;
ALTER TABLE lancamentos_financeiros ADD CONSTRAINT fk_lancamentos_financeiros_obra FOREIGN KEY (obra_id) REFERENCES obras (id) ON DELETE RESTRICT;
ALTER TABLE lancamentos_financeiros ADD CONSTRAINT fk_lancamentos_financeiros_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos (id) ON DELETE RESTRICT;

ALTER TABLE aplicacoes_de_liquidacao ADD CONSTRAINT fk_aplicacoes_de_liquidacao_lancamento_financeiro FOREIGN KEY (lancamento_financeiro_id) REFERENCES lancamentos_financeiros (id) ON DELETE RESTRICT;
ALTER TABLE aplicacoes_de_liquidacao ADD CONSTRAINT fk_aplicacoes_de_liquidacao_liquidacao_financeira FOREIGN KEY (liquidacao_financeira_id) REFERENCES liquidacoes_financeiras (id) ON DELETE RESTRICT;

ALTER TABLE ajustes_financeiros ADD CONSTRAINT fk_ajustes_financeiros_lancamento_original FOREIGN KEY (lancamento_original_id) REFERENCES lancamentos_financeiros (id) ON DELETE RESTRICT;
ALTER TABLE ajustes_financeiros ADD CONSTRAINT fk_ajustes_financeiros_lancamento_ajuste FOREIGN KEY (lancamento_ajuste_id) REFERENCES lancamentos_financeiros (id) ON DELETE RESTRICT;
ALTER TABLE ajustes_financeiros ADD CONSTRAINT fk_ajustes_financeiros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT;

ALTER TABLE compras_cartao ADD CONSTRAINT fk_compras_cartao_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedores (id) ON DELETE RESTRICT;
ALTER TABLE compras_cartao ADD CONSTRAINT fk_compras_cartao_categoria FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE RESTRICT;
ALTER TABLE compras_cartao ADD CONSTRAINT fk_compras_cartao_obra FOREIGN KEY (obra_id) REFERENCES obras (id) ON DELETE RESTRICT;
ALTER TABLE compras_cartao ADD CONSTRAINT fk_compras_cartao_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos (id) ON DELETE RESTRICT;

ALTER TABLE faturas ADD CONSTRAINT fk_faturas_liquidacao_financeira FOREIGN KEY (liquidacao_financeira_id) REFERENCES liquidacoes_financeiras (id) ON DELETE RESTRICT;

ALTER TABLE parcelas ADD CONSTRAINT fk_parcelas_compra_cartao FOREIGN KEY (compra_cartao_id) REFERENCES compras_cartao (id) ON DELETE RESTRICT;
ALTER TABLE parcelas ADD CONSTRAINT fk_parcelas_contrato_financeiro FOREIGN KEY (contrato_financeiro_id) REFERENCES contratos_financeiros (id) ON DELETE RESTRICT;
ALTER TABLE parcelas ADD CONSTRAINT fk_parcelas_fatura FOREIGN KEY (fatura_id) REFERENCES faturas (id) ON DELETE RESTRICT;
ALTER TABLE parcelas ADD CONSTRAINT fk_parcelas_lancamento_financeiro FOREIGN KEY (lancamento_financeiro_id) REFERENCES lancamentos_financeiros (id) ON DELETE RESTRICT;

ALTER TABLE contratos_financeiros ADD CONSTRAINT fk_contratos_financeiros_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id) ON DELETE RESTRICT;
ALTER TABLE contratos_financeiros ADD CONSTRAINT fk_contratos_financeiros_veiculo FOREIGN KEY (veiculo_id) REFERENCES veiculos (id) ON DELETE RESTRICT;

ALTER TABLE obras ADD CONSTRAINT fk_obras_cliente FOREIGN KEY (cliente_id) REFERENCES clientes (id) ON DELETE RESTRICT;

ALTER TABLE veiculos ADD CONSTRAINT fk_veiculos_empresa FOREIGN KEY (empresa_id) REFERENCES empresas (id) ON DELETE RESTRICT;

ALTER TABLE rateios_despesa ADD CONSTRAINT fk_rateios_despesa_lancamento_financeiro FOREIGN KEY (lancamento_financeiro_id) REFERENCES lancamentos_financeiros (id) ON DELETE RESTRICT;
ALTER TABLE rateios_despesa ADD CONSTRAINT fk_rateios_despesa_obra FOREIGN KEY (obra_id) REFERENCES obras (id) ON DELETE RESTRICT;

ALTER TABLE sugestoes_ia ADD CONSTRAINT fk_sugestoes_ia_grupo_sugestao FOREIGN KEY (grupo_sugestao_id) REFERENCES sugestoes_ia (id) ON DELETE RESTRICT;

ALTER TABLE logs_auditoria ADD CONSTRAINT fk_logs_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE RESTRICT;
