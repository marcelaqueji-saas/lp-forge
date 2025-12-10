// src/components/admin-sections/TeamKanbanSection.tsx
import { Card, CardContent } from '@/components/ui/card';

export function TeamKanbanSection() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-xs font-semibold mb-2">Backlog</p>
          <p className="text-xs text-muted-foreground">
            Espaço reservado para organizar demandas internas do time noBRon.
          </p>
        </CardContent>
      </Card>
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-xs font-semibold mb-2">Em andamento</p>
          <p className="text-xs text-muted-foreground">
            Aqui você poderá visualizar o que está em execução.
          </p>
        </CardContent>
      </Card>
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-xs font-semibold mb-2">Concluído</p>
          <p className="text-xs text-muted-foreground">
            Bloco para acompanhar entregas finalizadas.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
