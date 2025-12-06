import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lp_id } = await req.json();

    if (!lp_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing lp_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Creating backup for LP: ${lp_id}`);

    // Fetch all LP data
    const [lpResult, contentResult, settingsResult, leadsResult, rolesResult] = await Promise.all([
      supabase.from('landing_pages').select('*').eq('id', lp_id).single(),
      supabase.from('lp_content').select('*').eq('lp_id', lp_id),
      supabase.from('lp_settings').select('*').eq('lp_id', lp_id),
      supabase.from('lp_leads').select('*').eq('lp_id', lp_id),
      supabase.from('lp_user_roles').select('*').eq('lp_id', lp_id),
    ]);

    if (lpResult.error) {
      console.error('Error fetching LP:', lpResult.error);
      return new Response(
        JSON.stringify({ success: false, error: 'LP not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create backup object
    const backup = {
      version: '1.0',
      created_at: new Date().toISOString(),
      landing_page: lpResult.data,
      content: contentResult.data || [],
      settings: settingsResult.data || [],
      leads: leadsResult.data || [],
      user_roles: rolesResult.data || [],
    };

    // Convert to JSON string
    const backupJson = JSON.stringify(backup, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${lp_id}/${timestamp}.json`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('lp-backups')
      .upload(fileName, backupJson, {
        contentType: 'application/json',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading backup:', uploadError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save backup' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get signed URL for download (valid for 1 hour)
    const { data: signedUrl } = await supabase.storage
      .from('lp-backups')
      .createSignedUrl(fileName, 3600);

    // Log the backup
    await supabase.rpc('log_system_event', {
      _lp_id: lp_id,
      _level: 'info',
      _source: 'backup',
      _message: `Backup created: ${fileName}`,
      _metadata: { file_size: backupJson.length }
    });

    console.log(`Backup created successfully: ${fileName}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        file_name: fileName,
        download_url: signedUrl?.signedUrl,
        stats: {
          content_items: backup.content.length,
          settings_items: backup.settings.length,
          leads_count: backup.leads.length,
          roles_count: backup.user_roles.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in export-backup:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});