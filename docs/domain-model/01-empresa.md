# EMPRESA

> Nota de identidade (válida para todas as entidades deste modelo): toda entidade possui uma identidade conceitual única, usada para relacionamentos. A representação técnica dessa identidade (sequencial, identificador universal, chave natural) é decisão da fase de modelagem física do banco — fora do escopo deste documento.

## 1. Visão geral

**Finalidade**: representar cada unidade do grupo empresarial (H Vieira, Helierti, CV, CD, Camila, Celso) à qual Contas Bancárias, Veículos e Contratos Financeiros pertencem.

**Responsabilidade**: servir de referência organizacional para segregar dados financeiros e patrimoniais entre as diferentes unidades do grupo.

**Quem cria**: cadastro manual, por usuário autorizado. O perfil exato de autorização depende da pendência 5 do conceitual (modelo de permissões, ainda não definido).

**Quem altera**: o mesmo perfil que cria — cadastro manual, sem gatilho automático.

**Quem consulta**: `CONTA_BANCÁRIA`, `VEÍCULO`, `CONTRATO_FINANCEIRO` (para saber a que Empresa pertencem); `LOG_AUDITORIA` (para contextualizar alterações); qualquer módulo que futuramente segregue dados por escopo de Empresa (permissão por empresa, pendência 5 do conceitual e Divergência 4 da arbitragem técnica).

**Quem nunca deve alterar**: qualquer módulo automatizado — Conciliação, Financeiro, Cartão, Obras, Frota, Balanço, IA. Nenhum desses cria ou altera Empresa como efeito colateral de sua operação normal.

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `nome` | Nome pelo qual a unidade do grupo é identificada (ex.: "H Vieira", "Helierti") | Texto | Sim | Nenhum | Sim (correção de cadastro) | Mesmo perfil que cria | Não pode ser vazio. O conceitual não define regra explícita de unicidade entre Empresas — não presumida aqui. | — |
| `tipo` | Classificação da unidade dentro do grupo | Lista de valores predefinidos | Sim (campo principal listado no conceitual) | Nenhum | Indefinido — depende de como a pendência 1 for resolvida | Mesmo perfil que cria, sujeito à mesma ressalva | Não definida — os valores válidos são exatamente o objeto da pendência 1 | Ver Seção 7. O checklist do conceitual (Seção 18) já impede avançar o cadastro de Empresa sem resolver isso primeiro |

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Empresa → Conta Bancária | 1:N | Uma Empresa pode ter várias Contas Bancárias; cada Conta pertence a exatamente uma Empresa | Cadastro manual da Conta Bancária | Conta Bancária não existe sem Empresa | Nenhuma adicional documentada |
| Empresa → Veículo | 1:N | Uma Empresa pode ter vários Veículos; cada Veículo pertence a exatamente uma Empresa | Cadastro manual do Veículo | Veículo não existe sem Empresa | Nenhuma adicional documentada |
| Empresa → Contrato Financeiro | 1:N | Uma Empresa pode ter vários Contratos Financeiros | Cadastro manual do Contrato | Contrato não existe sem Empresa | Nenhuma adicional documentada |
| Empresa → Cartão de Crédito | 1:N (indireto) | Cartão pertence a uma Conta Bancária, que pertence a uma Empresa — não há vínculo direto Empresa↔Cartão no catálogo do conceitual | Cadastro manual do Cartão, via Conta Bancária | — | O conceitual lista "Cartão" entre os relacionamentos de Empresa (Seção 3), mas a entidade `CARTÃO_CRÉDITO` só declara `conta_bancária_id` como campo — o vínculo com Empresa é sempre transitivo |

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral de `nome` e `tipo`.
- **Regras de criação**: sempre cadastro manual; nenhum outro módulo cria Empresa como efeito colateral.
- **Regras de alteração**: alteração manual; toda alteração deve gerar entrada em `LOG_AUDITORIA` (princípio 10 do conceitual).
- **Regras de exclusão**: não definidas no conceitual. Dado o princípio "nada desaparece" (princípio 5, aplicado a fatos financeiros) e a ausência de qualquer menção a exclusão de cadastro-base, não se deve presumir que uma Empresa com Contas/Veículos/Contratos vinculados possa ser excluída fisicamente — isso é uma observação, não uma regra confirmada.
- **Regras de auditoria**: toda alteração de campo (`nome`, `tipo`) deve ser registrada por campo (regra 31 do conceitual).
- **Regras de integridade**: Conta Bancária, Veículo e Contrato Financeiro não podem existir sem referenciar uma Empresa válida.
- **Regras de negócio**: nenhuma regra de comportamento financeiro diferenciado por `tipo` de Empresa está definida no conceitual — esse é exatamente o conteúdo da pendência 1.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `nome`, `tipo` |
| Imutáveis | Nenhum — ambos os campos são corrigíveis por cadastro manual |
| Auditáveis | `nome`, `tipo` |

---

## 6. Dependências com outras entidades

`CONTA_BANCÁRIA`, `VEÍCULO` e `CONTRATO_FINANCEIRO` dependem diretamente de `EMPRESA` (não existem sem uma Empresa válida). `CARTÃO_CRÉDITO` depende indiretamente, via `CONTA_BANCÁRIA`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Sim.**

- **Qual decisão**: pendência 1 do conceitual — natureza jurídica das 6 "empresas" do grupo.
- **Por que**: o campo `tipo` não pode ter seus valores válidos definidos, nem se sabe se ele deve acionar comportamento diferenciado no sistema (ex. relatórios fiscais separados), até essa decisão ser tomada. O próprio checklist de migração do conceitual (Seção 18) já condiciona o desenho do cadastro de Empresa a essa confirmação.
- **O que muda na entidade**: os valores possíveis de `tipo` (hoje indefinidos); possivelmente novos campos ainda não previstos, caso a natureza jurídica definida exija dados adicionais (ex. um identificador fiscal formal, se alguma "empresa" for pessoa jurídica própria). Nenhum campo desse tipo é adicionado aqui, para não inventar estrutura não documentada — fica registrado como consequência em aberto, não como campo.
