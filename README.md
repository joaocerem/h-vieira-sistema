# H. Vieira ERP

Sistema de gestão financeira e operacional desenvolvido para a H. Vieira Terraplanagem.

## Objetivo

Centralizar em um único sistema todos os controles atualmente realizados em planilhas, incluindo:

- Financeiro
- Conciliação bancária
- Contas a pagar
- Contas a receber
- Agenda de pagamentos
- Controle de cartões
- Controle de frota
- Lucro por obra
- Financiamentos
- Consórcios
- Integração futura com IA
- Integração bancária futura

O projeto busca eliminar retrabalho, evitar duplicação de informações e manter uma única fonte de verdade para todos os dados da empresa.

---

## Documentação

Toda a documentação do projeto está na pasta `docs`.

**Por onde começar (contexto atual do projeto):**

- `docs/fluxos-operacionais-definitivos.md` — **fonte oficial atual das regras operacionais e de negócio aprovadas** (Passo 1). Em caso de conflito com a documentação técnica anterior, este documento prevalece.
- `docs/interface-funcional-financeiro.md` — **Passo 2**: decisões de interface funcional já validadas (como o usuário opera as telas). Não define regras de negócio — estas pertencem ao documento de fluxos acima.
- `docs/handoff.md` — estado e histórico do projeto, sessão a sessão (a nota mais recente está no fim do documento).
- `docs/decisions.md` — decisões técnicas e de negócio registradas (a #51 é a mais recente: remoção de Liquidação/Ajuste Financeiro).

O schema vigente do banco é o das migrations Flyway em `backend/src/main/resources/db/migration/`; a pasta `database/` é material legado da Fase 3 (ver `database/README.md`).

Documentos atuais:

- Arquitetura Conceitual
- Arquitetura Técnica (Backend)
- Arquitetura Técnica (Frontend)
- Project Rules
- Roadmap
- Changelog
- Decisions
- Pendências

---

## Situação atual

🚧 Em desenvolvimento.

Backend (Fase 4) implementado e encerrado — ver `docs/freeze-fase-4.md`. Autenticação, autorização, escopo por Empresa e auditoria automática foram deliberadamente adiadas para a Fase 5 (ver `docs/pendencias.md`, Seção 7).

Frontend (Fase 5): arquitetura técnica em `docs/architecture/arquitetura-tecnica-frontend.md`. Backend e frontend já possuem implementação funcional, com módulos implementados e testados (ver `docs/changelog.md` e `docs/handoff.md`). O sistema continua em desenvolvimento e **não está concluído**.

Os fluxos operacionais (`docs/fluxos-operacionais-definitivos.md`) e a interface funcional (`docs/interface-funcional-financeiro.md`) estão sendo revisados e refinados antes das próximas implementações. Nem toda a implementação atual está alinhada a esses documentos — por exemplo, a Conciliação Bancária ainda será revisada.

---

## Organização

```
backend/
frontend/
database/
docs/
prompts/
```

---

## Licença

Projeto privado.