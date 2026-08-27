import { RouterProvider } from 'react-router'
import { router } from '@/routes/router'
import { QueryProvider } from '@/app/providers/QueryProvider'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { Toaster } from '@/shared/components/ui/sonner'
import { GlobalLoadingIndicator } from '@/shared/components/feedback/GlobalLoadingIndicator'

/**
 * Composição raiz da aplicação. Ordem dos providers: Tema → Estado de servidor → Rotas —
 * nenhum depende de dado vindo de rota para existir. `AuthProvider` (sessão do usuário) é
 * adicionado aqui quando S1 existir no backend (`pendencias.md`, Seção 7) — deliberadamente
 * ausente nesta etapa, por instrução explícita (`decisions.md`, decisão #41).
 */
export function App() {
  return (
    <ThemeProvider>
      <QueryProvider>
        <GlobalLoadingIndicator />
        <Toaster position="top-right" richColors />
        <RouterProvider router={router} />
      </QueryProvider>
    </ThemeProvider>
  )
}
