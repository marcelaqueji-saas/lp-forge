-- Add domain verification token column
ALTER TABLE public.landing_pages 
ADD COLUMN IF NOT EXISTS dominio_verificacao_token text;

-- Create uptime_checks table
CREATE TABLE IF NOT EXISTS public.uptime_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checked_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'ok',
  message text
);

-- Enable RLS on uptime_checks
ALTER TABLE public.uptime_checks ENABLE ROW LEVEL SECURITY;

-- Policy for uptime checks (read-only for authenticated users)
CREATE POLICY "Authenticated users can view uptime checks"
ON public.uptime_checks FOR SELECT
TO authenticated
USING (true);

-- Create system_logs table
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id uuid REFERENCES public.landing_pages(id) ON DELETE SET NULL,
  level text NOT NULL DEFAULT 'info',
  source text NOT NULL,
  message text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Policy for system_logs (owners can view their LP logs)
CREATE POLICY "Owners can view their LP logs"
ON public.system_logs FOR SELECT
TO authenticated
USING (
  lp_id IS NULL OR 
  is_lp_owner(auth.uid(), lp_id) OR 
  has_lp_role(auth.uid(), lp_id, ARRAY['owner'::lp_role])
);

-- Create storage bucket for backups
INSERT INTO storage.buckets (id, name, public)
VALUES ('lp-backups', 'lp-backups', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for backups
CREATE POLICY "Owners can upload LP backups"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lp-backups' AND 
  is_lp_owner(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Owners can view LP backups"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'lp-backups' AND 
  is_lp_owner(auth.uid(), (storage.foldername(name))[1]::uuid)
);

CREATE POLICY "Owners can delete LP backups"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'lp-backups' AND 
  is_lp_owner(auth.uid(), (storage.foldername(name))[1]::uuid)
);

-- Create function to log system events
CREATE OR REPLACE FUNCTION public.log_system_event(
  _lp_id uuid,
  _level text,
  _source text,
  _message text,
  _metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.system_logs (lp_id, level, source, message, metadata)
  VALUES (_lp_id, _level, _source, _message, _metadata)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Create health check function
CREATE OR REPLACE FUNCTION public.health_check()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  -- Record the check
  INSERT INTO public.uptime_checks (status, message)
  VALUES ('ok', 'Health check passed');
  
  -- Return status
  result := jsonb_build_object(
    'status', 'ok',
    'timestamp', now(),
    'database', 'connected'
  );
  
  RETURN result;
END;
$$;