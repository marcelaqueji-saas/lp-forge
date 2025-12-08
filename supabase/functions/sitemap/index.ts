/**
 * Edge function para gerar sitemap.xml dinâmico
 * 
 * Endpoint: GET /functions/v1/sitemap
 * 
 * Lista todas as LPs públicas indexáveis do sistema
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Base URL configurável via env, com fallback
    // TODO: Configurar SITE_BASE_URL no ambiente de produção
    const baseUrl = Deno.env.get('SITE_BASE_URL') || 'https://seudominio.com';

    // Buscar LPs públicas e indexáveis
    const { data: lps, error } = await supabase
      .from('landing_pages')
      .select('id, slug, dominio, dominio_verificado, created_at')
      .eq('publicado', true)
      .eq('is_official', false); // Não incluir a LP oficial do SaaS aqui

    if (error) {
      console.error('[Sitemap] Error fetching LPs:', error);
      throw error;
    }

    // Para cada LP, verificar se tem noindex em settings
    const indexableLPs: Array<{
      slug: string;
      domain?: string;
      lastmod: string;
    }> = [];

    for (const lp of lps || []) {
      // Verificar se a LP está marcada como noindex
      const { data: setting } = await supabase
        .from('lp_settings')
        .select('value')
        .eq('lp_id', lp.id)
        .eq('key', 'seo_noindex')
        .maybeSingle();

      const isNoIndex = setting?.value === 'true';
      
      if (!isNoIndex) {
        indexableLPs.push({
          slug: lp.slug,
          domain: lp.dominio_verificado ? lp.dominio : undefined,
          lastmod: lp.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        });
      }
    }

    // Gerar XML
    const urls = indexableLPs.map(lp => {
      // Se tem domínio próprio verificado, usar ele
      const url = lp.domain 
        ? `https://${lp.domain}/`
        : `${baseUrl}/lp/${lp.slug}`;

      return `
    <url>
      <loc>${escapeXml(url)}</loc>
      <lastmod>${lp.lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>`;
    }).join('');

    // Adicionar homepage do SaaS
    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>${baseUrl}/</loc>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    <url>
      <loc>${baseUrl}/nobron</loc>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>${urls}
</urlset>`;

    return new Response(sitemapXml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600', // Cache 1 hora
      },
    });

  } catch (error) {
    console.error('[Sitemap] Error:', error);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml; charset=utf-8',
        },
      }
    );
  }
});

// Escape caracteres especiais para XML
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
