import { Link, Outlet } from 'react-router'

/**
 * Layout base da aplicação — cabeçalho fixo + área de conteúdo (`<Outlet />`, React Router,
 * `decisions.md`, decisão #44). Navegação hoje é só uma lista direta dos módulos já
 * implementados — um menu real, condicionado a papel/Empresa, é construído quando S2/S3
 * existirem (ver `docs/architecture/arquitetura-tecnica-frontend.md`, Seção 12).
 */
const CADASTROS_BASE_NAV = [
  { to: '/empresas', label: 'Empresas' },
  { to: '/fornecedores', label: 'Fornecedores' },
  { to: '/clientes', label: 'Clientes' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/contas-bancarias', label: 'Contas Bancárias' },
  { to: '/cartoes-credito', label: 'Cartões de Crédito' },
  { to: '/usuarios', label: 'Usuários' },
]

const FINANCEIRO_NAV = [
  { to: '/lancamentos-financeiros', label: 'Lançamentos' },
  { to: '/liquidacoes-financeiras', label: 'Liquidações' },
  { to: '/ajustes-financeiros', label: 'Ajustes' },
  { to: '/conciliacao-bancaria', label: 'Conciliação Bancária' },
  { to: '/balanco', label: 'Balanço' },
]

const CARTAO_CREDITO_NAV = [
  { to: '/compras-cartao', label: 'Compras Cartão' },
  { to: '/faturas', label: 'Faturas' },
  { to: '/parcelas', label: 'Parcelas' },
  { to: '/contratos-financeiros', label: 'Financiamentos e Consórcios' },
]

const OPERACIONAL_NAV = [
  { to: '/obras', label: 'Obras' },
  { to: '/veiculos', label: 'Veículos' },
]

export function AppShell() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-4 overflow-x-auto border-b border-border px-4">
        <Link to="/" className="shrink-0 text-sm font-semibold">
          H. Vieira ERP
        </Link>
        <nav className="flex shrink-0 gap-3 text-sm text-muted-foreground">
          {FINANCEIRO_NAV.map((item) => (
            <Link key={item.to} to={item.to} className="whitespace-nowrap hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <span className="mx-1 text-border">|</span>
          {CARTAO_CREDITO_NAV.map((item) => (
            <Link key={item.to} to={item.to} className="whitespace-nowrap hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <span className="mx-1 text-border">|</span>
          {OPERACIONAL_NAV.map((item) => (
            <Link key={item.to} to={item.to} className="whitespace-nowrap hover:text-foreground">
              {item.label}
            </Link>
          ))}
          <span className="mx-1 text-border">|</span>
          {CADASTROS_BASE_NAV.map((item) => (
            <Link key={item.to} to={item.to} className="whitespace-nowrap hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}
