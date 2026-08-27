import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { cn } from '@/shared/lib/utils'

/**
 * Indicador de loading global — reage a qualquer query/mutation em andamento no TanStack
 * Query (`decisions.md`, decisão #47), sem exigir que cada tela controle seu próprio estado de
 * loading para chamadas de API. Telas continuam livres para ter loading local (ex. skeleton
 * de uma lista específica) quando fizer sentido — este componente cobre o caso global.
 */
export function GlobalLoadingIndicator() {
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()
  const isActive = isFetching > 0 || isMutating > 0

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!isActive}
      className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
    >
      <span className="sr-only">{isActive ? 'Carregando' : ''}</span>
      <div
        className={cn(
          'h-full w-full origin-left bg-primary transition-transform duration-300 ease-out',
          isActive ? 'scale-x-100 animate-pulse' : 'scale-x-0',
        )}
      />
    </div>
  )
}
