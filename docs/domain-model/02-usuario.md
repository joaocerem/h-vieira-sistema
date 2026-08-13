# USUÁRIO

> **Aviso importante, válido só para esta entidade**: `USUÁRIO` **não consta no catálogo oficial de entidades da Seção 3 do conceitual**. O conceitual trata "usuários e níveis de permissão" explicitamente como **pendência 5, não bloqueante, mas não resolvida**. A `arbitragem-tecnica-final.md` (Divergência 4) também deixa o modelo de permissão como decisão pendente. Este documento existe porque o próprio conceitual pressupõe a existência de um usuário responsável em várias regras (ex. `LOG_AUDITORIA` tem campo "usuário"; confirmação de `SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA` exige um humano identificável) — mas **modela apenas o mínimo estrutural inevitável**, sem inventar papéis, permissões ou escopo por Empresa, que continuam em aberto. Qualquer campo além dos listados abaixo depende da resolução da pendência 5.

## 1. Visão geral

**Finalidade**: identificar a pessoa responsável por uma ação dentro do sistema — cadastro, alteração, confirmação de Sugestão/Ação de IA, liquidação — para fins de autoria e auditoria.

**Responsabilidade**: ser o sujeito humano ao qual toda ação relevante do sistema pode ser atribuída, conforme exigido pela granularidade de auditoria (princípio 10 e regra 31 do conceitual).

**Quem cria**: cadastro manual — presume-se administrativo, mas o perfil autorizado a criar novos Usuários é, ele mesmo, parte da pendência 5 (não é possível definir "quem pode cadastrar usuário" sem o modelo de permissão).

**Quem altera**: mesma ressalva — presumivelmente o próprio usuário (dados pessoais) e/ou um perfil administrativo, mas o "quem" exato depende da pendência 5.

**Quem consulta**: `LOG_AUDITORIA` (para registrar o responsável por cada alteração); `SUGESTÃO_IA` e `AÇÃO_PROPOSTA_IA` (para registrar quem confirmou, editou ou rejeitou); potencialmente todo módulo de escrita, no momento em que a barreira de confirmação da IA e o controle de acesso forem implementados (Divergências 3 e 4 da arbitragem técnica).

**Quem nunca deve alterar**: a IA nunca cria nem altera Usuário — nenhuma regra do conceitual prevê isso, e seria uma escrita direta em entidade de controle de acesso, o que a arquitetura já proíbe por analogia ao princípio 9 (IA nunca é fonte de verdade).

---

## 2. Campos

| Campo | Significado | Tipo conceitual | Obrigatório? | Valor padrão | Pode mudar depois de criado? | Quem pode alterar | Regra de validação | Observações |
|---|---|---|---|---|---|---|---|---|
| `nome` | Nome da pessoa responsável pelo acesso | Texto | Sim | Nenhum | Sim | Indefinido (pendência 5) | Não vazio | — |
| `identificador de acesso` | Referência usada para autenticar o usuário (ex. e-mail ou nome de usuário) | Texto | Sim | Nenhum | Indefinido — trocar o identificador de acesso pode ter implicações de segurança não avaliadas aqui | Indefinido (pendência 5) | Não vazio; unicidade entre Usuários é uma inferência razoável (dois usuários não deveriam autenticar com o mesmo identificador), mas não está confirmada no conceitual | A forma exata do identificador (e-mail, usuário, outro) não é definida no conceitual |
| `situação de acesso` | Se o usuário está apto a acessar o sistema no momento | Lista de valores (ex. Ativo / Inativo) | Indefinido | Indefinido | Indefinido | Indefinido (pendência 5) | Não definida | Campo incluído apenas como inferência estrutural mínima (um usuário desligado precisa deixar de acessar sem apagar seu histórico de autoria) — **não confirmado pelo conceitual**, sinalizado explicitamente como suposição a validar |

**Deliberadamente fora deste modelo**: credenciais de autenticação (senha, hash, token, segundo fator), papel/perfil de permissão, escopo de Empresas visíveis, e nível de confirmação de IA que o usuário pode aprovar. Esses pertencem, respectivamente, ao mecanismo de autenticação (decisão técnica, Seção 5.5 da arquitetura técnica) e ao modelo de permissão (pendência 5 do conceitual, Divergência 4 da arbitragem) — nenhum dos dois está resolvido, e modelar esses campos aqui seria inventar regra de negócio.

---

## 3. Relacionamentos

| Relacionamento | Cardinalidade | Significado | Quem controla | Regras | Restrições |
|---|---|---|---|---|---|
| Usuário → Log Auditoria | 1:N | Cada entrada de auditoria referencia o Usuário responsável pela alteração (quando a origem é Manual, Sugestão de IA Confirmada ou Ação de IA Confirmada) | Sistema, no momento em que a alteração é registrada | Toda entrada de log com origem humana precisa de um Usuário associado | Não aplicável a alterações de origem "Importação Bancária", que não têm um usuário individual por trás |
| Usuário → Sugestão IA | 1:N | Um Usuário confirma, edita ou rejeita cada Sugestão de IA | Usuário, manualmente | Nenhuma sugestão vira dado real sem essa confirmação | — |
| Usuário → Ação Proposta IA | 1:N | Um Usuário confirma ou rejeita cada Ação Proposta pela IA, com barreira reforçada quando o nível é Alto | Usuário, manualmente | Nenhuma ação executa sem confirmação explícita | O mecanismo exato da barreira "Alto" é decisão pendente (pendência 12 do conceitual) |

**Nota sobre as demais entidades do sistema**: o conceitual **não** define um campo "criado por"/"alterado por" em cada entidade de negócio individualmente — essa informação é capturada de forma centralizada em `LOG_AUDITORIA`, não duplicada entidade a entidade. Por isso, `USUÁRIO` não aparece como relacionamento direto de `EMPRESA`, `OBRA`, `LANÇAMENTO_FINANCEIRO` etc. neste modelo, mesmo que essas entidades sejam, na prática, criadas por um usuário.

---

## 4. Regras da entidade

- **Campos mutuamente exclusivos**: nenhum identificado.
- **Campos obrigatórios por contexto**: nenhum além da obrigatoriedade geral de `nome` e `identificador de acesso`.
- **Regras de criação**: indefinidas quanto a "quem pode criar um Usuário" (pendência 5).
- **Regras de alteração**: indefinidas quanto a "quem pode alterar os dados de outro Usuário" (pendência 5).
- **Regras de exclusão**: não definidas. Dado que Usuário é referenciado por `LOG_AUDITORIA` como autor histórico de alterações, uma exclusão física provavelmente comprometeria a rastreabilidade exigida pelo princípio 10 — mas isso é uma observação estrutural, não uma regra confirmada.
- **Regras de auditoria**: alterações em Usuário devem, elas mesmas, ser auditadas como qualquer outra entidade (regra 31), embora o conceitual não trate Usuário como "entidade financeira" explicitamente — inferência por analogia, não confirmada.
- **Regras de integridade**: toda entrada de `LOG_AUDITORIA` de origem humana deve referenciar um Usuário válido; toda confirmação de `SUGESTÃO_IA`/`AÇÃO_PROPOSTA_IA` deve referenciar um Usuário válido.
- **Regras de negócio**: nenhuma definida — este é o núcleo da pendência 5.

---

## 5. Classificação dos campos

| Categoria | Campos |
|---|---|
| Derivados | Nenhum |
| Calculados | Nenhum |
| Persistidos | `nome`, `identificador de acesso`, `situação de acesso` (esta última, sujeita à ressalva de não-confirmação) |
| Imutáveis | Nenhum identificado |
| Auditáveis | `nome`, `identificador de acesso`, `situação de acesso` |

---

## 6. Dependências com outras entidades

`LOG_AUDITORIA`, `SUGESTÃO_IA` e `AÇÃO_PROPOSTA_IA` dependem de `USUÁRIO` para registrar autoria/confirmação humana. Nenhuma outra entidade tem dependência estrutural direta e confirmada.

---

## 7. Checklist de decisões pendentes

**Esta entidade depende de alguma decisão ainda pendente? Sim — de forma mais profunda que qualquer outra entidade deste modelo.**

- **Qual decisão**: pendência 5 do conceitual (usuários e níveis de permissão), e a Divergência 4 da arbitragem técnica (mecanismo de checagem de permissão em dois pontos — por ação e por escopo de dado/Empresa).
- **Por que**: o conceitual nunca chegou a catalogar `USUÁRIO` como entidade formal — ele só é citado como agente em várias regras (quem confirma, quem audita, quem cria cadastro). Sem o modelo de permissão, não é possível saber se existe um único tipo de usuário ou papéis diferentes, se o acesso é segmentado por Empresa, nem que nível de confirmação de IA (Baixo/Médio/Alto) cada usuário pode exercer.
- **O que muda na entidade**: praticamente toda a estrutura de campos além de `nome` e `identificador de acesso` — papel/perfil, escopo de Empresas visíveis, nível de confirmação de IA autorizado, e qualquer regra de criação/alteração/exclusão hoje listada como "indefinida" neste documento passam a ter conteúdo definido assim que a pendência 5 for resolvida. Este documento deve ser revisado por completo nesse momento, não apenas complementado.
