/**
 * Edge function para buscar analytics de uma LP
 * 
 * Endpoint: GET /functions/v1/get-analytics?lp_id=xxx&days=30
 * 
 * Retorna métricas agregadas: views, clicks, leads, conversão, device breakdown, top UTMs
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
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

    const url = new URL(req.url);
    const lpId = url.searchParams.get('lp_id');
    const days = parseInt(url.searchParams.get('days') || '30');

    if (!lpId) {
      return new Response(
        JSON.stringify({ error: 'lp_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar acesso à LP
    const { data: lp, error: lpError } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('id', lpId)
      .maybeSingle();

    if (lpError || !lp) {
      return new Response(
        JSON.stringify({ error: 'LP não encontrada ou sem acesso' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calcular datas
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Usar a função agregadora do banco
    const { data: analyticsData, error: analyticsError } = await supabase
      .rpc('get_lp_analytics', {
        _lp_id: lpId,
        _start_date: startDate.toISOString(),
        _end_date: endDate.toISOString()
      });

    if (analyticsError) {
      console.error('[Analytics] RPC error:', analyticsError);
      // Fallback: buscar dados manualmente
    }

    // Buscar eventos por dia para gráfico
    const { data: dailyEvents } = await supabase
      .from('lp_events')
      .select('event_type, created_at')
      .eq('lp_id', lpId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    // Agregar por dia
    const dailyStats: Record<string, { views: number; clicks: number; leads: number }> = {};
    
    for (const event of dailyEvents || []) {
      const day = event.created_at?.split('T')[0] || '';
      if (!dailyStats[day]) {
        dailyStats[day] = { views: 0, clicks: 0, leads: 0 };
      }
      if (event.event_type === 'view') dailyStats[day].views++;
      if (event.event_type === 'cta_click') dailyStats[day].clicks++;
      if (event.event_type === 'lead_submit') dailyStats[day].leads++;
    }

    // Buscar top UTMs
    const { data: utmEvents } = await supabase
      .from('lp_events')
      .select('utm_source, utm_medium, utm_campaign')
      .eq('lp_id', lpId)
      .gte('created_at', startDate.toISOString())
      .not('utm_source', 'is', null);

    const utmCounts: Record<string, number> = {};
    for (const event of utmEvents || []) {
      const source = event.utm_source || 'direct';
      utmCounts[source] = (utmCounts[source] || 0) + 1;
    }

    const topUtms = Object.entries(utmCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([source, count]) => ({ source, count }));

    // Buscar device breakdown
    const { data: deviceEvents } = await supabase
      .from('lp_events')
      .select('device_type')
      .eq('lp_id', lpId)
      .gte('created_at', startDate.toISOString());

    const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
    for (const event of deviceEvents || []) {
      const device = event.device_type || 'desktop';
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    }

    // Construir resposta
    const baseStats = analyticsData?.[0] || {
      total_views: 0,
      total_clicks: 0,
      total_leads: 0,
      unique_sessions: 0,
      conversion_rate: 0
    };

    const response = {
      summary: {
        views: Number(baseStats.total_views) || 0,
        clicks: Number(baseStats.total_clicks) || 0,
        leads: Number(baseStats.total_leads) || 0,
        sessions: Number(baseStats.unique_sessions) || 0,
        conversion_rate: Number(baseStats.conversion_rate) || 0,
      },
      daily: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        ...stats,
      })),
      devices: deviceCounts,
      top_sources: topUtms,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Analytics] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
