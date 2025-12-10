// src/components/admin-sections/MasterOverviewSection.tsx
import { Card, CardContent } from '@/components/ui/card';

export function MasterOverviewSection() {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground mb-1">
            LPs ativas
          </p>
          <p className="text-2xl font-semibold">0</p>
        </CardContent>
      </Card>
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground mb-1">
            Leads capturados
          </p>
          <p className="text-2xl font-semibold">0</p>
        </CardContent>
      </Card>
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground mb-1">
            Usuários internos
          </p>
          <p className="text-2xl font-semibold">0</p>
        </CardContent>
      </Card>
      <Card className="border-dashed">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground mb-1">
            Última atualização
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            Em configuração
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
