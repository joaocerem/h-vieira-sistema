# H. Vieira ERP — Frontend

SPA React + Vite + TypeScript, consumindo a API REST do backend (Spring Boot). Ver
`docs/architecture/arquitetura-tecnica-frontend.md` para a arquitetura completa e
`docs/decisions.md` (decisões #42, #44-#50) para as decisões técnicas registradas.

## Requisitos

- Node.js 20+ (testado com Node 24)

## Setup

```bash
cp .env.example .env   # ajuste VITE_API_BASE_URL se necessário
npm install
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Vite) |
| `npm run build` | Type-check (`tsc -b`) + build de produção |
| `npm run preview` | Serve o build de produção localmente |
| `npm run test` | Roda os testes (Vitest) uma vez |
| `npm run test:watch` | Vitest em modo watch |
| `npm run lint` | Lint (oxlint) |

## Estado atual

Infraestrutura compartilhada implementada (providers, layout base, tema, cliente HTTP,
tratamento de erro, loading global). **Nenhuma feature de negócio implementada ainda** —
autenticação e qualquer mecanismo relacionado a S1-S5 (`docs/pendencias.md`, Seção 7) estão
deliberadamente adiados. Ver `docs/architecture/arquitetura-tecnica-frontend.md`, Seção 11,
para a ordem recomendada dos próximos passos.
