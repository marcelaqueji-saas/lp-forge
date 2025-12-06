import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lp_id, captcha_token } = await req.json();

    if (!lp_id || !captcha_token) {
      console.error('Missing required fields:', { lp_id: !!lp_id, captcha_token: !!captcha_token });
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get captcha secret key from lp_settings
    const { data: settings, error: settingsError } = await supabase
      .from('lp_settings')
      .select('key, value')
      .eq('lp_id', lp_id)
      .in('key', ['captcha_provider', 'captcha_secret_key']);

    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Error fetching settings' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const settingsMap: Record<string, string> = {};
    settings?.forEach(s => {
      settingsMap[s.key] = s.value || '';
    });

    const captchaProvider = settingsMap['captcha_provider'];
    const captchaSecretKey = settingsMap['captcha_secret_key'];

    if (!captchaSecretKey) {
      console.error('No captcha secret key configured for LP:', lp_id);
      // If no secret key is configured, allow the request (captcha not properly set up)
      return new Response(
        JSON.stringify({ success: true, message: 'Captcha not configured, skipping validation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate with hCaptcha
    if (captchaProvider === 'hcaptcha') {
      console.log('Validating hCaptcha token...');
      
      const formData = new URLSearchParams();
      formData.append('response', captcha_token);
      formData.append('secret', captchaSecretKey);

      const verifyResponse = await fetch('https://hcaptcha.com/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const verifyResult = await verifyResponse.json();
      console.log('hCaptcha verification result:', verifyResult);

      if (verifyResult.success) {
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        console.error('hCaptcha verification failed:', verifyResult['error-codes']);
        return new Response(
          JSON.stringify({ success: false, error: 'Captcha verification failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Unknown or unconfigured provider - allow by default
    console.log('Unknown captcha provider or not configured:', captchaProvider);
    return new Response(
      JSON.stringify({ success: true, message: 'Unknown captcha provider' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in verify-captcha function:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});