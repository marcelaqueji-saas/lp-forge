-- ====================================================================
-- FASE 1: MULTI-TENANT, ROLES, DOMÍNIOS, MÍDIA, SEO
-- ====================================================================

-- 1. Criar enum para roles
CREATE TYPE public.lp_role AS ENUM ('owner', 'editor', 'viewer');

-- 2. Tabela de roles por LP/usuário
CREATE TABLE public.lp_user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lp_id UUID NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role lp_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (lp_id, user_id)
);

ALTER TABLE public.lp_user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Adicionar coluna de verificação de domínio
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS dominio_verificado BOOLEAN DEFAULT false;

-- 4. Adicionar coluna de ordem nas seções
ALTER TABLE public.lp_content 
ADD COLUMN IF NOT EXISTS section_order INTEGER DEFAULT 0;

-- 5. Criar bucket de mídia
INSERT INTO storage.buckets (id, name, public)
VALUES ('lp-media', 'lp-media', true)
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- FUNÇÕES DE SEGURANÇA (SECURITY DEFINER)
-- ====================================================================

-- Função para verificar se usuário tem role na LP
CREATE OR REPLACE FUNCTION public.has_lp_role(_user_id UUID, _lp_id UUID, _roles lp_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.lp_user_roles
        WHERE user_id = _user_id
        AND lp_id = _lp_id
        AND role = ANY(_roles)
    )
$$;

-- Função para verificar se usuário é owner da LP
CREATE OR REPLACE FUNCTION public.is_lp_owner(_user_id UUID, _lp_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.landing_pages
        WHERE id = _lp_id
        AND owner_id = _user_id
    )
$$;

-- Função para verificar acesso à LP (owner direto OU via lp_user_roles)
CREATE OR REPLACE FUNCTION public.can_access_lp(_user_id UUID, _lp_id UUID, _min_role lp_role DEFAULT 'viewer')
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.landing_pages lp
        WHERE lp.id = _lp_id
        AND (
            lp.owner_id = _user_id
            OR EXISTS (
                SELECT 1 FROM public.lp_user_roles ur
                WHERE ur.lp_id = _lp_id
                AND ur.user_id = _user_id
                AND (
                    (_min_role = 'viewer') OR
                    (_min_role = 'editor' AND ur.role IN ('owner', 'editor')) OR
                    (_min_role = 'owner' AND ur.role = 'owner')
                )
            )
        )
    )
$$;

-- Função para verificar se pode editar LP
CREATE OR REPLACE FUNCTION public.can_edit_lp(_user_id UUID, _lp_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.is_lp_owner(_user_id, _lp_id) 
    OR public.has_lp_role(_user_id, _lp_id, ARRAY['owner'::lp_role, 'editor'::lp_role])
$$;

-- Função para verificar se pode gerenciar LP (apenas owner)
CREATE OR REPLACE FUNCTION public.can_manage_lp(_user_id UUID, _lp_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.is_lp_owner(_user_id, _lp_id) 
    OR public.has_lp_role(_user_id, _lp_id, ARRAY['owner'::lp_role])
$$;

-- ====================================================================
-- RLS POLICIES - LANDING_PAGES
-- ====================================================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Owners can manage their LPs" ON public.landing_pages;
DROP POLICY IF EXISTS "Public can view published LPs" ON public.landing_pages;

-- SELECT: Usuário pode ver suas LPs ou LPs onde tem role
CREATE POLICY "Users can view their LPs"
ON public.landing_pages
FOR SELECT
TO authenticated
USING (
    owner_id = auth.uid() 
    OR public.has_lp_role(auth.uid(), id, ARRAY['owner'::lp_role, 'editor'::lp_role, 'viewer'::lp_role])
);

-- SELECT: Público pode ver LPs publicadas
CREATE POLICY "Public can view published LPs"
ON public.landing_pages
FOR SELECT
TO anon
USING (publicado = true);

-- INSERT: Apenas usuários autenticados, owner_id deve ser o próprio usuário
CREATE POLICY "Authenticated users can create LPs"
ON public.landing_pages
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- UPDATE: Apenas owner ou editor (via função)
CREATE POLICY "Owners and editors can update LPs"
ON public.landing_pages
FOR UPDATE
TO authenticated
USING (public.can_edit_lp(auth.uid(), id))
WITH CHECK (public.can_edit_lp(auth.uid(), id));

-- DELETE: Apenas owner
CREATE POLICY "Only owners can delete LPs"
ON public.landing_pages
FOR DELETE
TO authenticated
USING (public.can_manage_lp(auth.uid(), id));

-- ====================================================================
-- RLS POLICIES - LP_CONTENT
-- ====================================================================

DROP POLICY IF EXISTS "Authenticated can manage content" ON public.lp_content;
DROP POLICY IF EXISTS "Public can view content of published LPs" ON public.lp_content;

-- SELECT: Quem pode acessar a LP pode ver o conteúdo
CREATE POLICY "Users can view LP content"
ON public.lp_content
FOR SELECT
TO authenticated
USING (public.can_access_lp(auth.uid(), lp_id));

-- SELECT: Público pode ver conteúdo de LPs publicadas
CREATE POLICY "Public can view published LP content"
ON public.lp_content
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM public.landing_pages lp
        WHERE lp.id = lp_id AND lp.publicado = true
    )
);

-- INSERT/UPDATE/DELETE: Apenas owner ou editor
CREATE POLICY "Editors can manage LP content"
ON public.lp_content
FOR ALL
TO authenticated
USING (public.can_edit_lp(auth.uid(), lp_id))
WITH CHECK (public.can_edit_lp(auth.uid(), lp_id));

-- ====================================================================
-- RLS POLICIES - LP_SETTINGS
-- ====================================================================

DROP POLICY IF EXISTS "Authenticated can manage settings" ON public.lp_settings;
DROP POLICY IF EXISTS "Public can view settings of published LPs" ON public.lp_settings;

-- SELECT: Quem pode acessar a LP pode ver settings
CREATE POLICY "Users can view LP settings"
ON public.lp_settings
FOR SELECT
TO authenticated
USING (public.can_access_lp(auth.uid(), lp_id));

-- SELECT: Público pode ver settings de LPs publicadas
CREATE POLICY "Public can view published LP settings"
ON public.lp_settings
FOR SELECT
TO anon
USING (
    EXISTS (
        SELECT 1 FROM public.landing_pages lp
        WHERE lp.id = lp_id AND lp.publicado = true
    )
);

-- INSERT/UPDATE/DELETE: Apenas owner ou editor
CREATE POLICY "Editors can manage LP settings"
ON public.lp_settings
FOR ALL
TO authenticated
USING (public.can_edit_lp(auth.uid(), lp_id))
WITH CHECK (public.can_edit_lp(auth.uid(), lp_id));

-- ====================================================================
-- RLS POLICIES - LP_LEADS
-- ====================================================================

DROP POLICY IF EXISTS "Authenticated can view leads" ON public.lp_leads;
DROP POLICY IF EXISTS "Public can insert leads" ON public.lp_leads;

-- SELECT: Apenas owner e editor podem ver leads
CREATE POLICY "Editors can view LP leads"
ON public.lp_leads
FOR SELECT
TO authenticated
USING (public.can_edit_lp(auth.uid(), lp_id));

-- INSERT: Público pode inserir leads
CREATE POLICY "Anyone can submit leads"
ON public.lp_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- DELETE: Apenas owner pode deletar leads
CREATE POLICY "Only owners can delete leads"
ON public.lp_leads
FOR DELETE
TO authenticated
USING (public.can_manage_lp(auth.uid(), lp_id));

-- ====================================================================
-- RLS POLICIES - LP_USER_ROLES
-- ====================================================================

-- SELECT: Usuário pode ver seus próprios roles ou owner pode ver todos da LP
CREATE POLICY "Users can view their roles"
ON public.lp_user_roles
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR public.is_lp_owner(auth.uid(), lp_id)
);

-- INSERT/UPDATE/DELETE: Apenas owner da LP pode gerenciar roles
CREATE POLICY "Owners can manage LP roles"
ON public.lp_user_roles
FOR ALL
TO authenticated
USING (public.is_lp_owner(auth.uid(), lp_id))
WITH CHECK (public.is_lp_owner(auth.uid(), lp_id));

-- ====================================================================
-- STORAGE POLICIES - LP-MEDIA
-- ====================================================================

-- SELECT: Público pode ver arquivos
CREATE POLICY "Public can view LP media"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'lp-media');

-- INSERT: Owner e editor podem fazer upload
CREATE POLICY "Editors can upload LP media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'lp-media'
    AND public.can_edit_lp(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- UPDATE: Owner e editor podem atualizar
CREATE POLICY "Editors can update LP media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'lp-media'
    AND public.can_edit_lp(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- DELETE: Apenas owner pode deletar
CREATE POLICY "Owners can delete LP media"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'lp-media'
    AND public.can_manage_lp(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- ====================================================================
-- FUNÇÃO PARA RATE LIMITING DE LEADS
-- ====================================================================

CREATE OR REPLACE FUNCTION public.check_lead_rate_limit(_lp_id UUID, _email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    -- Contar leads do mesmo email nos últimos 5 minutos
    SELECT COUNT(*) INTO recent_count
    FROM public.lp_leads
    WHERE lp_id = _lp_id
    AND email = _email
    AND created_at > NOW() - INTERVAL '5 minutes';
    
    -- Permitir se menos de 3 envios nos últimos 5 minutos
    RETURN recent_count < 3;
END;
$$;

-- ====================================================================
-- ATUALIZAR LP DEFAULT COM OWNER
-- ====================================================================

-- Garantir que a LP default tenha as configurações iniciais de ordem
UPDATE public.lp_content 
SET section_order = CASE section
    WHEN 'hero' THEN 1
    WHEN 'como_funciona' THEN 2
    WHEN 'para_quem_e' THEN 3
    WHEN 'beneficios' THEN 4
    WHEN 'provas_sociais' THEN 5
    WHEN 'planos' THEN 6
    WHEN 'faq' THEN 7
    WHEN 'chamada_final' THEN 8
    WHEN 'rodape' THEN 9
    ELSE 10
END
WHERE section_order = 0 OR section_order IS NULL;