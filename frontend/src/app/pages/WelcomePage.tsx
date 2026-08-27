import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'

/**
 * Página temporária — só prova que o bootstrap (providers, layout, tema, UI compartilhada)
 * está funcionando. Substituída pela primeira feature real (`features/`) na próxima etapa de
 * implementação.
 */
export function WelcomePage() {
  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader>
        <CardTitle>Infraestrutura do Frontend pronta</CardTitle>
        <CardDescription>
          Bootstrap da Fase 5 concluído. Nenhuma feature de negócio implementada ainda.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Ver <code>docs/architecture/arquitetura-tecnica-frontend.md</code>, Seção 11, para a
        ordem recomendada das próximas implementações.
      </CardContent>
    </Card>
  )
}
