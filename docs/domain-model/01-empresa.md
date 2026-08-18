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

**Nota sobre `tipo`**: o catálogo conceitual original (`arquitetura-conceitual.md`, Seção 3 — documento nunca alterado) lista `tipo` como campo de `EMPRESA`. O campo foi **removido do modelo** por decisão (D1, `decisions.md`, decisão #23) — auditoria documental completa não encontrou nenhuma regra, decisão congelada, entidade ou mecanismo que o utilizasse em toda a evolução do projeto; sua existência decorria só de herança do catálogo original, sem função de negócio jamais confirmada (princípio 2 de modelagem). Ver Seção 7.

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
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral de `nome`.
- **Regras de criação**: sempre cadastro manual; nenhum outro módulo cria Empresa como efeito colateral.
- **Regras de alteração**: alteração manual; toda alteração deve gerar entrada em `LOG_AUDITORIA` (princípio 10 do conceitual).
- **Regras de exclusão**: não definidas no conceitual. Dado o princípio "nada desaparece" (princípio 5, aplicado a fatos financeiros) e a ausência de qualquer menção a exclusão de cadastro-base, não se deve presumir que uma Empresa com Contas/Veículos/Contratos vinculados possa ser excluída fisicamente — isso é uma observação, não uma regra confirmada.
- **Regras de auditoria**: toda alteração de campo (`nome`) deve ser registrada por campo (regra 31 do conceitual).
- **Regras de integridade**: Conta Bancária, Veículo e Contrato Financeiro não podem existir sem referenciar uma Empresa válida.
- **Regras de negócio**: nenhuma definida — Empresa é puro cadastro de identidade organizacional (D1, decisão #23).

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `nome` |
| Imutáveis | Nenhum — corrigível por cadastro manual |
| Auditáveis | `nome` |

---

## 6. Dependências com outras entidades

`CONTA_BANCÁRIA`, `VEÍCULO` e `CONTRATO_FINANCEIRO` dependem diretamente de `EMPRESA` (não existem sem uma Empresa válida). `CARTÃO_CRÉDITO` depende indiretamente, via `CONTA_BANCÁRIA`.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Não — resolvida.**

- ~~Pendência 1 do conceitual — natureza jurídica das 6 "empresas" do grupo, para definir os valores válidos de `EMPRESA.tipo`~~ — **Resolvida (D1), com reformulação.** Auditoria documental completa (regras de negócio vigentes, decisões #1-#22, 24 entidades de domínio, modelagem lógica/física, schema implementado) não encontrou nenhum uso funcional do campo em toda a evolução do projeto. A pergunta original foi substituída por "o atributo ainda pertence ao modelo?", respondida como não — `tipo` foi **removido** da entidade (`decisions.md`, decisão #23). Se no futuro a natureza jurídica das unidades do grupo precisar acionar comportamento diferenciado, um campo equivalente deverá ser reintroduzido como nova decisão de modelagem, com definição de negócio concreta.
