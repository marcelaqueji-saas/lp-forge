/**
 * Edge function para gerar robots.txt dinâmico
 * 
 * Endpoint: GET /functions/v1/robots
 * 
 * Bloqueia rotas administrativas e respeita configurações de noindex
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Base URL configurável via env
    // TODO: Configurar SITE_BASE_URL no ambiente de produção
    const baseUrl = Deno.env.get('SITE_BASE_URL') || 'https://seudominio.com';

    // Robots.txt padrão seguro
    // Permite indexação das LPs públicas, bloqueia admin/auth
    const robotsTxt = `# robots.txt gerado dinamicamente
# SaaS LP - Plataforma de Landing Pages

User-agent: *

# Rotas públicas permitidas
Allow: /
Allow: /lp/
Allow: /site/
Allow: /saaslp

# Rotas administrativas bloqueadas
Disallow: /admin/
Disallow: /master/
Disallow: /painel/
Disallow: /meu-site/
Disallow: /auth/
Disallow: /onboarding/
Disallow: /reset-password

# APIs e funções
Disallow: /functions/
Disallow: /api/

# Assets estáticos - permitir
Allow: /assets/
Allow: /*.css$
Allow: /*.js$
Allow: /*.png$
Allow: /*.jpg$
Allow: /*.webp$
Allow: /*.svg$

# Sitemap
Sitemap: ${baseUrl}/functions/v1/sitemap

# Crawl delay recomendado
Crawl-delay: 1
`;

    return new Response(robotsTxt, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // Cache 24 horas
      },
    });

  } catch (error) {
    console.error('[Robots] Error:', error);
    
    // Fallback seguro - bloqueia tudo
    return new Response(
      'User-agent: *\nDisallow: /',
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/plain; charset=utf-8',
        },
      }
    );
  }
});
