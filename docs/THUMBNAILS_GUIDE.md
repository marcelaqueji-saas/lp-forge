# 🖼️ Guia de Thumbnails - noBRon

Este documento explica a infraestrutura de thumbnails para os modelos de seção.

## Estrutura de Arquivos

```
src/
└── components/
    └── editor/
        └── ModelThumbnail.tsx    # Componente principal com todos os thumbnails

public/
└── thumbnails/                   # (Opcional) Imagens estáticas de thumbnail
    └── {sectionKey}/
        └── {modelId}.webp
```

## Convenção de Nomes

Os thumbnails seguem a convenção:

- **Arquivo estático**: `/thumbnails/{sectionKey}/{modelId}.webp`
- **Exemplo**: `/thumbnails/hero/hero_glass_aurora.webp`

## Implementação Atual

Os thumbnails são **componentes React abstratos** que representam visualmente o layout de cada modelo. Isso garante:

1. **Consistência visual** - Todos os thumbnails seguem o mesmo estilo
2. **Sem dependência de imagens** - Funcionam sem necessidade de assets externos
3. **Temas** - Adaptam-se automaticamente ao tema claro/escuro
4. **Performance** - Renderização instantânea, sem carregamento de imagens

## Componente ModelThumbnail

```tsx
import { ModelThumbnail } from '@/components/editor/ModelThumbnail';

<ModelThumbnail
  modelId="hero_glass_aurora"
  name="Hero glass aurora"
  plan="free"
  stylePreset="aurora"
  isLocked={false}
  isSelected={true}
  onClick={() => handleSelect('hero_glass_aurora')}
/>
```

### Props

| Prop | Tipo | Descrição |
|------|------|-----------|
| `modelId` | `string` | ID único do modelo (usado para buscar o thumbnail) |
| `name` | `string` | Nome exibido no thumbnail |
| `plan` | `'free' \| 'pro' \| 'premium'` | Plano mínimo necessário |
| `stylePreset` | `StylePreset` | Preset visual (glass, visionos, aurora, neumorphic) |
| `isLocked` | `boolean` | Se o modelo está bloqueado para o usuário |
| `isSelected` | `boolean` | Se o modelo está selecionado |
| `onClick` | `() => void` | Callback ao clicar |

## Style Presets e Backgrounds

Cada `stylePreset` aplica um background diferente ao thumbnail:

```tsx
const STYLE_PRESET_GRADIENTS = {
  glass: 'bg-gradient-to-br from-background via-background to-muted/20',
  visionos: 'bg-gradient-to-br from-slate-100/50 to-slate-200/30',
  aurora: 'bg-gradient-to-br from-violet-500/10 via-background to-cyan-500/10',
  neumorphic: 'bg-muted/40',
};
```

## Adicionando um Novo Thumbnail

### 1. Criar o componente de thumbnail abstrato

Adicione ao arquivo `src/components/editor/ModelThumbnail.tsx`:

```tsx
const NovoModeloThumb = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
    {/* Elementos visuais simplificados do layout */}
    <div className="w-3/4 h-2 bg-current/30 rounded" />
    <div className="w-1/2 h-1.5 bg-current/20 rounded" />
  </div>
);
```

### 2. Registrar no mapa de thumbnails

```tsx
const MODEL_THUMBNAIL_COMPONENTS: Record<string, React.FC> = {
  // ...existing thumbnails
  novo_modelo_id: NovoModeloThumb,
};
```

### 3. (Opcional) Adicionar imagem estática

Se preferir usar uma imagem estática:

1. Crie a imagem em 400x300px (aspect ratio 4:3)
2. Salve como WebP para melhor compressão
3. Coloque em `/public/thumbnails/{sectionKey}/{modelId}.webp`

## Boas Práticas para Thumbnails Abstratos

1. **Simplicidade**: Use formas básicas (divs, círculos) para representar elementos
2. **Opacidade**: Use `bg-current/XX` para cores que adaptam ao tema
3. **Proporção**: Mantenha o aspect ratio 4:3 (definido pelo container)
4. **Hierarquia**: Elementos maiores representam elementos principais (título, imagem)
5. **Layout fiel**: Tente representar o layout real (grid, colunas, timeline)

## Exemplo de Thumbnail Abstrato

```tsx
// Thumbnail para um layout de 3 colunas com cards
const GridCardsThumb = () => (
  <div className="w-full h-full grid grid-cols-3 gap-1 p-2">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-current/15 rounded flex flex-col items-center p-0.5">
        <div className="w-3 h-3 rounded-full bg-current/20" />
        <div className="w-full h-0.5 bg-current/10 rounded mt-0.5" />
      </div>
    ))}
  </div>
);
```

## Catálogo Completo de Thumbnails

O arquivo `ModelThumbnail.tsx` contém thumbnails para todos os 32 modelos:

| Seção | Modelos com Thumbnail |
|-------|----------------------|
| Menu | 3 |
| Hero | 4 |
| Como Funciona | 3 |
| Para Quem É | 3 |
| Benefícios | 3 |
| Provas Sociais | 4 |
| Planos | 3 |
| FAQ | 3 |
| Chamada Final | 3 |
| Rodapé | 3 |
| **Total** | **32** |

## Verificação Visual

Para verificar todos os thumbnails:

1. Acesse a página de QA: `/qa/sections`
2. Visualize todos os thumbnails na view "Thumbnails"
3. Clique em qualquer thumbnail para ver o preview completo

---

*Última atualização: Dezembro 2024*
