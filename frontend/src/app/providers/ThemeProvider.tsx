import type { ReactNode } from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

/**
 * Estado de UI local — tema (`decisions.md`, decisão #47: Context API, sem Redux). `next-themes`
 * é usado como implementação (é, ele próprio, baseado em Context React, apesar do nome) por já
 * resolver persistência e a troca de classe `.dark` no `<html>`, consistente com as variáveis
 * CSS já definidas em `index.css` pelo shadcn/ui (`decisions.md`, decisão #49).
 *
 * Nenhum toggle de tema é exposto na UI nesta etapa — nenhuma necessidade de negócio
 * confirmada para modo escuro (ver `docs/architecture/arquitetura-tecnica-frontend.md`,
 * Seção 8). `attribute="class"` só deixa a estrutura pronta para essa extensão futura, sem
 * decidir por ela agora.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  )
}
