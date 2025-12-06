
-- ====================================================================
-- WEBHOOKS TABLE
-- ====================================================================
CREATE TABLE public.lp_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id uuid NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  url text NOT NULL,
  tipo text NOT NULL DEFAULT 'generic' CHECK (tipo IN ('generic', 'hubspot', 'pipedrive')),
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lp_webhooks ENABLE ROW LEVEL SECURITY;

-- Only owners can manage webhooks
CREATE POLICY "Owners can manage webhooks"
ON public.lp_webhooks
FOR ALL
USING (public.is_lp_owner(auth.uid(), lp_id))
WITH CHECK (public.is_lp_owner(auth.uid(), lp_id));

-- Editors can view webhooks
CREATE POLICY "Editors can view webhooks"
ON public.lp_webhooks
FOR SELECT
USING (public.can_edit_lp(auth.uid(), lp_id));

-- ====================================================================
-- EVENTS TABLE (Internal Metrics)
-- ====================================================================
CREATE TABLE public.lp_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id uuid NOT NULL REFERENCES public.landing_pages(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('view', 'cta_click', 'lead_submit')),
  metadata jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS (events can be inserted by anyone for public LPs)
ALTER TABLE public.lp_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events for published LPs
CREATE POLICY "Anyone can insert events for published LPs"
ON public.lp_events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.landing_pages lp
    WHERE lp.id = lp_events.lp_id AND lp.publicado = true
  )
);

-- Only editors can view events
CREATE POLICY "Editors can view events"
ON public.lp_events
FOR SELECT
USING (public.can_edit_lp(auth.uid(), lp_id));

-- ====================================================================
-- WEBHOOK LOGS TABLE
-- ====================================================================
CREATE TABLE public.lp_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id uuid NOT NULL REFERENCES public.lp_webhooks(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.lp_leads(id) ON DELETE SET NULL,
  status_code integer,
  response_body text,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lp_webhook_logs ENABLE ROW LEVEL SECURITY;

-- Owners can view webhook logs
CREATE POLICY "Owners can view webhook logs"
ON public.lp_webhook_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.lp_webhooks w
    WHERE w.id = lp_webhook_logs.webhook_id
    AND public.is_lp_owner(auth.uid(), w.lp_id)
  )
);

-- ====================================================================
-- INDEXES
-- ====================================================================
CREATE INDEX idx_lp_events_lp_id ON public.lp_events(lp_id);
CREATE INDEX idx_lp_events_created_at ON public.lp_events(created_at);
CREATE INDEX idx_lp_events_type ON public.lp_events(event_type);
CREATE INDEX idx_lp_webhooks_lp_id ON public.lp_webhooks(lp_id);

-- ====================================================================
-- FUNCTION: Get event counts for LP
-- ====================================================================
CREATE OR REPLACE FUNCTION public.get_lp_event_counts(_lp_id uuid)
RETURNS TABLE (
  event_type text,
  count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT event_type, COUNT(*) as count
  FROM public.lp_events
  WHERE lp_id = _lp_id
  GROUP BY event_type
$$;
