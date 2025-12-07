/**
 * Edge function para exportar leads em CSV
 * 
 * Endpoint: GET /functions/v1/export-leads?lp_id=xxx
 * 
 * Requer autenticação e verifica:
 * - Usuário é owner/editor da LP
 * - Plano do usuário permite exportação (export_leads_enabled)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    // Criar client com token do usuário
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Autenticação necessária' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Obter parâmetros
    const url = new URL(req.url);
    const lpId = url.searchParams.get('lp_id');

    if (!lpId) {
      return new Response(
        JSON.stringify({ error: 'lp_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('[ExportLeads] Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se usuário tem acesso à LP (via RLS)
    const { data: lp, error: lpError } = await supabase
      .from('landing_pages')
      .select('id, nome, slug, owner_id')
      .eq('id', lpId)
      .maybeSingle();

    if (lpError || !lp) {
      console.error('[ExportLeads] LP not found or access denied:', lpError);
      return new Response(
        JSON.stringify({ error: 'LP não encontrada ou sem acesso' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar permissão de edição (owner ou editor)
    const isOwner = lp.owner_id === user.id;
    let hasEditorRole = false;

    if (!isOwner) {
      const { data: roleData } = await supabase
        .from('lp_user_roles')
        .select('role')
        .eq('lp_id', lpId)
        .eq('user_id', user.id)
        .maybeSingle();

      hasEditorRole = roleData?.role === 'editor' || roleData?.role === 'owner';
    }

    if (!isOwner && !hasEditorRole) {
      return new Response(
        JSON.stringify({ error: 'Sem permissão para exportar leads desta LP' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se o plano permite exportação
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('plan')
      .eq('user_id', user.id)
      .maybeSingle();

    const userPlan = profile?.plan || 'free';

    const { data: planLimits } = await supabase
      .from('plan_limits')
      .select('export_leads_enabled')
      .eq('plan', userPlan)
      .maybeSingle();

    if (!planLimits?.export_leads_enabled) {
      return new Response(
        JSON.stringify({ 
          error: 'Seu plano não permite exportar leads',
          upgrade_required: true 
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Buscar leads
    const { data: leads, error: leadsError } = await supabase
      .from('lp_leads')
      .select('*')
      .eq('lp_id', lpId)
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('[ExportLeads] Error fetching leads:', leadsError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar leads' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar CSV
    const csvLines: string[] = [];
    
    // Header
    csvLines.push([
      'ID',
      'Nome',
      'Email',
      'Telefone',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'UTM Term',
      'UTM Content',
      'Dispositivo',
      'Referrer',
      'Data/Hora',
    ].map(escapeCSV).join(','));

    // Dados
    for (const lead of leads || []) {
      const utm = lead.utm as Record<string, string> || {};
      csvLines.push([
        lead.id,
        lead.nome || '',
        lead.email || '',
        lead.telefone || '',
        utm.utm_source || '',
        utm.utm_medium || '',
        utm.utm_campaign || '',
        utm.utm_term || '',
        utm.utm_content || '',
        lead.device_type || '',
        lead.referrer || '',
        lead.created_at ? new Date(lead.created_at).toLocaleString('pt-BR') : '',
      ].map(escapeCSV).join(','));
    }

    const csv = csvLines.join('\n');
    const filename = `leads-${lp.slug}-${new Date().toISOString().split('T')[0]}.csv`;

    // Log de auditoria (best effort)
    try {
      await supabase.rpc('log_audit_event', {
        _action: 'export_leads',
        _target_type: 'lp_leads',
        _target_id: lpId,
        _details: { lead_count: leads?.length || 0, format: 'csv' }
      });
    } catch (auditErr) {
      console.error('[ExportLeads] Audit log error:', auditErr);
    }

    return new Response(csv, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('[ExportLeads] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Escape para CSV
function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
