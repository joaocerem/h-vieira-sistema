import { createBrowserRouter } from 'react-router'
import { AppShell } from '@/shared/components/layout/AppShell'
import { WelcomePage } from '@/app/pages/WelcomePage'
import { EmpresaListPage } from '@/features/empresa/pages/EmpresaListPage'
import { EmpresaFormPage } from '@/features/empresa/pages/EmpresaFormPage'
import { FornecedorListPage } from '@/features/fornecedor/pages/FornecedorListPage'
import { FornecedorFormPage } from '@/features/fornecedor/pages/FornecedorFormPage'
import { ClienteListPage } from '@/features/cliente/pages/ClienteListPage'
import { ClienteFormPage } from '@/features/cliente/pages/ClienteFormPage'
import { CategoriaListPage } from '@/features/categoria/pages/CategoriaListPage'
import { CategoriaFormPage } from '@/features/categoria/pages/CategoriaFormPage'
import { ContaBancariaListPage } from '@/features/conta-bancaria/pages/ContaBancariaListPage'
import { ContaBancariaFormPage } from '@/features/conta-bancaria/pages/ContaBancariaFormPage'
import { CartaoCreditoListPage } from '@/features/cartao-credito/pages/CartaoCreditoListPage'
import { CartaoCreditoFormPage } from '@/features/cartao-credito/pages/CartaoCreditoFormPage'
import { UsuarioListPage } from '@/features/usuario/pages/UsuarioListPage'
import { UsuarioFormPage } from '@/features/usuario/pages/UsuarioFormPage'
import { LancamentoListPage } from '@/features/lancamento-financeiro/pages/LancamentoListPage'
import { LancamentoFormPage } from '@/features/lancamento-financeiro/pages/LancamentoFormPage'
import { LiquidacaoListPage } from '@/features/liquidacao-financeira/pages/LiquidacaoListPage'
import { LiquidacaoFormPage } from '@/features/liquidacao-financeira/pages/LiquidacaoFormPage'
import { LiquidacaoDetailPage } from '@/features/liquidacao-financeira/pages/LiquidacaoDetailPage'
import { ObraListPage } from '@/features/obra/pages/ObraListPage'
import { ObraFormPage } from '@/features/obra/pages/ObraFormPage'
import { VeiculoListPage } from '@/features/frota/pages/VeiculoListPage'
import { VeiculoFormPage } from '@/features/frota/pages/VeiculoFormPage'
import { MovimentacaoListPage } from '@/features/conciliacao-bancaria/pages/MovimentacaoListPage'
import { MovimentacaoImportarPage } from '@/features/conciliacao-bancaria/pages/MovimentacaoImportarPage'
import { TransferenciaInternaListPage } from '@/features/conciliacao-bancaria/pages/TransferenciaInternaListPage'
import { TransferenciaInternaFormPage } from '@/features/conciliacao-bancaria/pages/TransferenciaInternaFormPage'
import { CompraCartaoListPage } from '@/features/compra-cartao/pages/CompraCartaoListPage'
import { CompraCartaoFormPage } from '@/features/compra-cartao/pages/CompraCartaoFormPage'
import { FaturaListPage } from '@/features/fatura/pages/FaturaListPage'
import { FaturaFecharCicloPage } from '@/features/fatura/pages/FaturaFecharCicloPage'
import { FaturaDetailPage } from '@/features/fatura/pages/FaturaDetailPage'
import { FaturaPagarPage } from '@/features/fatura/pages/FaturaPagarPage'
import { ParcelaListPage } from '@/features/parcela/pages/ParcelaListPage'
import { ContratoFinanceiroListPage } from '@/features/financiamento-consorcio/pages/ContratoFinanceiroListPage'
import { ContratoFinanceiroFormPage } from '@/features/financiamento-consorcio/pages/ContratoFinanceiroFormPage'
import { BalancoPage } from '@/features/balanco/pages/BalancoPage'
import { AjusteFinanceiroListPage } from '@/features/ajuste-financeiro/pages/AjusteFinanceiroListPage'
import { AjusteFinanceiroFormPage } from '@/features/ajuste-financeiro/pages/AjusteFinanceiroFormPage'

/**
 * Definição central de rotas (`decisions.md`, decisão #44) — nenhuma feature define rota fora
 * deste arquivo. Guards de autenticação/papel (`RequireAuth`, `RequireRole`) são adicionados
 * aqui quando S1-S3 existirem no backend (`pendencias.md`, Seção 7) — deliberadamente
 * ausentes nesta etapa, por instrução explícita.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <WelcomePage /> },
      {
        path: 'empresas',
        children: [
          { index: true, element: <EmpresaListPage /> },
          { path: 'nova', element: <EmpresaFormPage /> },
          { path: ':id/editar', element: <EmpresaFormPage /> },
        ],
      },
      {
        path: 'fornecedores',
        children: [
          { index: true, element: <FornecedorListPage /> },
          { path: 'novo', element: <FornecedorFormPage /> },
          { path: ':id/editar', element: <FornecedorFormPage /> },
        ],
      },
      {
        path: 'clientes',
        children: [
          { index: true, element: <ClienteListPage /> },
          { path: 'novo', element: <ClienteFormPage /> },
          { path: ':id/editar', element: <ClienteFormPage /> },
        ],
      },
      {
        path: 'categorias',
        children: [
          { index: true, element: <CategoriaListPage /> },
          { path: 'nova', element: <CategoriaFormPage /> },
          { path: ':id/editar', element: <CategoriaFormPage /> },
        ],
      },
      {
        path: 'contas-bancarias',
        children: [
          { index: true, element: <ContaBancariaListPage /> },
          { path: 'nova', element: <ContaBancariaFormPage /> },
          { path: ':id/editar', element: <ContaBancariaFormPage /> },
        ],
      },
      {
        path: 'cartoes-credito',
        children: [
          { index: true, element: <CartaoCreditoListPage /> },
          { path: 'novo', element: <CartaoCreditoFormPage /> },
          { path: ':id/editar', element: <CartaoCreditoFormPage /> },
        ],
      },
      {
        path: 'usuarios',
        children: [
          { index: true, element: <UsuarioListPage /> },
          { path: 'novo', element: <UsuarioFormPage /> },
          { path: ':id/editar', element: <UsuarioFormPage /> },
        ],
      },
      {
        path: 'lancamentos-financeiros',
        children: [
          { index: true, element: <LancamentoListPage /> },
          { path: 'novo', element: <LancamentoFormPage /> },
          { path: ':id/editar', element: <LancamentoFormPage /> },
        ],
      },
      {
        // Sem rota `nova`+`:id/editar` juntas — Liquidação é imutável (D12), só `nova` (criação)
        // e `:id` (detalhe só leitura), nunca edição.
        path: 'liquidacoes-financeiras',
        children: [
          { index: true, element: <LiquidacaoListPage /> },
          { path: 'nova', element: <LiquidacaoFormPage /> },
          { path: ':id', element: <LiquidacaoDetailPage /> },
        ],
      },
      {
        path: 'obras',
        children: [
          { index: true, element: <ObraListPage /> },
          { path: 'nova', element: <ObraFormPage /> },
          { path: ':id/editar', element: <ObraFormPage /> },
        ],
      },
      {
        path: 'veiculos',
        children: [
          { index: true, element: <VeiculoListPage /> },
          { path: 'novo', element: <VeiculoFormPage /> },
          { path: ':id/editar', element: <VeiculoFormPage /> },
        ],
      },
      {
        // Sem `:id`/edição para Movimentação — só `classificacao` é mutável, tratado inline na
        // própria lista (`ReclassificarSelect`), sem tela própria. Transferência Interna também
        // sem edição — "Regras de alteração: não definidas" no domínio (Seção 4 de
        // `13-transferencia-interna.md`).
        path: 'conciliacao-bancaria',
        children: [
          { index: true, element: <MovimentacaoListPage /> },
          { path: 'importar', element: <MovimentacaoImportarPage /> },
          { path: 'transferencias', element: <TransferenciaInternaListPage /> },
          { path: 'transferencias/nova', element: <TransferenciaInternaFormPage /> },
        ],
      },
      {
        path: 'compras-cartao',
        children: [
          { index: true, element: <CompraCartaoListPage /> },
          { path: 'nova', element: <CompraCartaoFormPage /> },
          { path: ':id/editar', element: <CompraCartaoFormPage /> },
        ],
      },
      {
        // Sem `nova`+`:id/editar` juntas — Fatura só nasce por `fechar-ciclo` e é imutável
        // depois (`valorTotalCalculado`/`valorCobrado` congelados no fechamento).
        path: 'faturas',
        children: [
          { index: true, element: <FaturaListPage /> },
          { path: 'fechar-ciclo', element: <FaturaFecharCicloPage /> },
          { path: ':id', element: <FaturaDetailPage /> },
          { path: ':id/pagar', element: <FaturaPagarPage /> },
        ],
      },
      {
        // Sem `nova`/`:id/editar` — Parcela é sempre gerada pelo sistema, nunca digitada
        // (`docs/domain-model/21-parcela.md`, Seção 1).
        path: 'parcelas',
        children: [{ index: true, element: <ParcelaListPage /> }],
      },
      {
        path: 'contratos-financeiros',
        children: [
          { index: true, element: <ContratoFinanceiroListPage /> },
          { path: 'novo', element: <ContratoFinanceiroFormPage /> },
          { path: ':id/editar', element: <ContratoFinanceiroFormPage /> },
        ],
      },
      // Só leitura — sem rota de criar/editar (Balanço não tem entidade própria).
      { path: 'balanco', element: <BalancoPage /> },
      {
        // Sem `:id/editar` — Ajuste Financeiro é imutável desde a criação (D13).
        path: 'ajustes-financeiros',
        children: [
          { index: true, element: <AjusteFinanceiroListPage /> },
          { path: 'novo', element: <AjusteFinanceiroFormPage /> },
        ],
      },
    ],
  },
])
