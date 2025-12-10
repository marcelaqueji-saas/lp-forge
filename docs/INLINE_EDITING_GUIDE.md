# 📝 Guia de Edição Inline - noBRon

Este documento explica como funciona a edição inline no editor de Landing Pages do noBRon.

## Visão Geral

A edição inline permite que usuários editem conteúdo diretamente no preview da seção, sem precisar abrir formulários separados. Isso proporciona uma experiência WYSIWYG ("What You See Is What You Get").

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      ContentPhase                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Section Card                         │   │
│  │  ┌───────────────────────────────────────────────┐   │   │
│  │  │            *Editable Component                 │   │   │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐   │   │   │
│  │  │  │EditableField│ │EditableImage│ │EditableLink│ │   │   │
│  │  │  └───────────┘ └───────────┘ └───────────┘   │   │   │
│  │  └───────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Componentes Editáveis

### 1. EditableField

Permite edição de texto inline com tooltip VisionGlass.

```tsx
import { EditableField } from '@/components/editor/InlineEditableSection';

<EditableField
  value={content.titulo}
  fieldKey="titulo"
  sectionKey="hero"
  lpId={lpId}
  content={content}
  onUpdate={handleUpdate}
  as="h1"                    // Elemento HTML a renderizar
  editable={true}            // Habilita/desabilita edição
  placeholder="Título"       // Texto quando vazio
  multiline={false}          // Permite quebra de linha (Enter)
/>
```

**Props:**
| Prop | Tipo | Descrição |
|------|------|-----------|
| `value` | `string` | Valor atual do campo |
| `fieldKey` | `string` | Chave no objeto content |
| `sectionKey` | `SectionKey` | Identificador da seção |
| `lpId` | `string` | ID da Landing Page |
| `content` | `LPContent` | Objeto completo de conteúdo |
| `onUpdate` | `(key, value) => void` | Callback ao salvar |
| `as` | `'h1' \| 'h2' \| 'p' \| 'span'` | Elemento HTML |
| `editable` | `boolean` | Modo edição ativo |
| `placeholder` | `string` | Texto placeholder |
| `multiline` | `boolean` | Permite múltiplas linhas |

### 2. EditableImageField

Permite upload e troca de imagens com preview.

```tsx
import { EditableImageField } from '@/components/editor/InlineEditableSection';

<EditableImageField
  src={content.imagem}
  fieldKey="imagem"
  sectionKey="hero"
  lpId={lpId}
  content={content}
  userPlan={userPlan}
  onUpdate={handleUpdate}
  alt="Hero image"
  aspectRatio="video"        // 'square' | 'video' | 'wide' | 'auto'
  editable={true}
/>
```

**Validações automáticas:**
- Tamanho máximo: Free (10MB), Pro (20MB), Premium/Master (50MB)
- Apenas tipos de imagem aceitos
- Upload para Supabase Storage

### 3. EditableLink

Permite edição de botões/links com label e URL.

```tsx
import { EditableLink } from '@/components/editor/InlineEditableSection';

<EditableLink
  label={content.cta_label}
  url={content.cta_url}
  labelKey="cta_label"
  urlKey="cta_url"
  sectionKey="hero"
  lpId={lpId}
  content={content}
  onUpdate={handleUpdate}
  editable={true}
>
  <Button>{content.cta_label}</Button>
</EditableLink>
```

## Componentes *Editable por Seção

Cada seção possui um componente Editable dedicado:

| Seção | Componente | Arquivo |
|-------|------------|---------|
| Menu | `MenuEditable` | `src/components/sections/MenuEditable.tsx` |
| Hero | `HeroEditable` | `src/components/sections/HeroEditable.tsx` |
| Como Funciona | `ComoFuncionaEditable` | `src/components/sections/ComoFuncionaEditable.tsx` |
| Para Quem É | `ParaQuemEEditable` | `src/components/sections/ParaQuemEEditable.tsx` |
| Benefícios | `BeneficiosEditable` | `src/components/sections/BeneficiosEditable.tsx` |
| Provas Sociais | `ProvasSociaisEditable` | `src/components/sections/ProvasSociaisEditable.tsx` |
| Planos | `PlanosEditable` | `src/components/sections/PlanosEditable.tsx` |
| FAQ | `FAQEditable` | `src/components/sections/FAQEditable.tsx` |
| Chamada Final | `ChamadaFinalEditable` | `src/components/sections/ChamadaFinalEditable.tsx` |
| Rodapé | `RodapeEditable` | `src/components/sections/RodapeEditable.tsx` |

## Campos Editáveis por Seção

### Hero
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `badge` | text | Badge/tag superior |
| `titulo` | text | Título principal (H1) |
| `destaque` | text | Palavra em destaque (gradient) |
| `subtitulo` | textarea | Subtítulo/descrição |
| `texto_botao_primario` | text | Label do CTA principal |
| `url_botao_primario` | url | URL do CTA principal |
| `texto_botao_secundario` | text | Label do CTA secundário |
| `url_botao_secundario` | url | URL do CTA secundário |
| `imagem_principal` | image | Imagem do hero |

### Benefícios
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `titulo` | text | Título da seção |
| `subtitulo` | text | Subtítulo |
| `beneficios_json` | json[] | Lista de benefícios |

**Estrutura `beneficios_json`:**
```json
[
  {
    "titulo": "Título do benefício",
    "descricao": "Descrição breve",
    "icone": "Sparkles"  // Nome do ícone Lucide
  }
]
```

### FAQ
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `titulo` | text | Título da seção |
| `subtitulo` | text | Subtítulo |
| `perguntas_json` | json[] | Lista de perguntas |

**Estrutura `perguntas_json`:**
```json
[
  {
    "pergunta": "Pergunta frequente?",
    "resposta": "Resposta detalhada aqui."
  }
]
```

### Planos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `titulo` | text | Título da seção |
| `subtitulo` | text | Subtítulo |
| `planos_json` | json[] | Lista de planos |

**Estrutura `planos_json`:**
```json
[
  {
    "nome": "Pro",
    "preco": "R$ 49/mês",
    "destaque": true,
    "descricao": "Para profissionais",
    "itens": ["5 LPs", "10GB", "Domínio"]
  }
]
```

## Fluxo de Salvamento

1. Usuário clica no elemento editável
2. Componente entra em modo de edição (contentEditable/input)
3. Usuário faz alteração
4. Ao sair do foco (onBlur) ou pressionar Enter:
   - Atualiza estado local
   - Chama `saveSectionContent(lpId, sectionKey, newContent)`
   - Exibe toast de confirmação
   - Chama `onContentUpdate` para sincronizar parent

```tsx
const handleSave = async () => {
  const updatedContent = { ...content, [fieldKey]: localValue };
  await saveSectionContent(lpId, sectionKey, updatedContent);
  onUpdate(fieldKey, localValue);
  toast({ title: 'Conteúdo salvo' });
};
```

## Fallbacks e Defaults

Cada componente Editable define um objeto `defaultContent`:

```tsx
const defaultContent = {
  titulo: 'Título padrão',
  subtitulo: 'Descrição padrão',
  // ...
};

// Merge com content recebido
const localContent = { ...defaultContent, ...content };
```

Isso garante que:
- LPs novas sempre têm conteúdo inicial
- Campos não definidos não quebram a renderização
- Placeholders são exibidos corretamente

## Ícones Suportados

Para seções que usam ícones (Benefícios, Como Funciona), os ícones disponíveis são do [Lucide React](https://lucide.dev/):

```tsx
const iconMap = {
  Check, Sparkles, Shield, Zap, Globe, 
  BarChart3, Clock, Star, Heart, Award, 
  TrendingUp, Users, // ...
};
```

**Nota:** A escolha de ícone é feita pelo campo `icone` no JSON. Se o ícone não existir no mapa, usa `Check` como fallback.

## Adicionando Novos Campos

Para adicionar um novo campo editável:

1. **Adicione ao SECTION_MODELS** (`src/lib/sectionModels.ts`):
```ts
fields: [
  ...SECTION_TITLE_FIELDS,
  { key: 'novo_campo', label: 'Novo Campo', type: 'text' },
],
```

2. **Adicione ao defaultContent** do componente Editable:
```tsx
const defaultContent = {
  novo_campo: 'Valor padrão',
  // ...
};
```

3. **Adicione o EditableField** no JSX:
```tsx
<EditableField
  value={fc.novo_campo || ''}
  fieldKey="novo_campo"
  // ...
/>
```

4. **Atualize a documentação** em `TEMPLATE_CATALOG.md`

## Debugging

Todos os componentes Editable incluem logs de QA:

```tsx
console.log('[S4.3 QA] HeroEditable: mounted', { lpId, editable, variante });
console.log('[S4.3 QA] InlineText: OK -', key);
```

Para verificar se a edição está funcionando:
1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Filtre por `[S4.3 QA]` ou `[S5.0 QA]`

---

*Última atualização: Dezembro 2024*
