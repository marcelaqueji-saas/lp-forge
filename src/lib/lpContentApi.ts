import { supabase } from '@/integrations/supabase/client';

export interface LPContent {
  [key: string]: string | undefined;
}

export interface LPSettings {
  [key: string]: string | undefined;
}

export interface LandingPage {
  id: string;
  nome: string;
  slug: string;
  dominio?: string;
  dominio_verificado?: boolean;
  publicado: boolean;
  created_at: string;
  owner_id?: string;
}

export type LPRole = 'owner' | 'editor' | 'viewer';

export interface LPUserRole {
  id: string;
  lp_id: string;
  user_id: string;
  role: LPRole;
  created_at: string;
}

export interface LPWebhook {
  id: string;
  lp_id: string;
  url: string;
  tipo: 'generic' | 'hubspot' | 'pipedrive';
  ativo: boolean;
  created_at: string;
}

export interface LPEventCounts {
  view: number;
  cta_click: number;
  lead_submit: number;
}

// Get default LP
export const getDefaultLP = async (): Promise<LandingPage | null> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', 'default')
    .eq('publicado', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching default LP:', error);
    return null;
  }

  return data;
};

// Get LP by ID
export const getLPById = async (id: string): Promise<LandingPage | null> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching LP:', error);
    return null;
  }

  return data;
};

// Get LP by slug
export const getLPBySlug = async (slug: string): Promise<LandingPage | null> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('slug', slug)
    .eq('publicado', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching LP by slug:', error);
    return null;
  }

  return data;
};

// Get LP by domain
export const getLPByDomain = async (domain: string): Promise<LandingPage | null> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('dominio', domain)
    .eq('publicado', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching LP by domain:', error);
    return null;
  }

  return data;
};

// Get all LPs for admin (filtered by RLS)
export const getAllLPs = async (): Promise<LandingPage[]> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching LPs:', error);
    return [];
  }

  return data || [];
};

// Get all LPs with user role info
export const getAllLPsWithRoles = async (): Promise<(LandingPage & { userRole: LPRole })[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const lps = await getAllLPs();
  const result: (LandingPage & { userRole: LPRole })[] = [];

  for (const lp of lps) {
    const role = await getUserRoleForLP(lp.id);
    if (role) {
      result.push({ ...lp, userRole: role });
    }
  }

  return result;
};

// Get user role for a specific LP
export const getUserRoleForLP = async (lpId: string): Promise<LPRole | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  // First check if user is owner
  const { data: lp } = await supabase
    .from('landing_pages')
    .select('owner_id')
    .eq('id', lpId)
    .maybeSingle();

  if (lp?.owner_id === session.user.id) {
    return 'owner';
  }

  // Check lp_user_roles
  const { data: roleData } = await supabase
    .from('lp_user_roles')
    .select('role')
    .eq('lp_id', lpId)
    .eq('user_id', session.user.id)
    .maybeSingle();

  return (roleData?.role as LPRole) || null;
};

// Get all users with roles for an LP
export const getLPUserRoles = async (lpId: string): Promise<LPUserRole[]> => {
  const { data, error } = await supabase
    .from('lp_user_roles')
    .select('*')
    .eq('lp_id', lpId);

  if (error) {
    console.error('Error fetching LP user roles:', error);
    return [];
  }

  return data || [];
};

// Add user role to LP
export const addUserRoleToLP = async (lpId: string, userId: string, role: LPRole): Promise<boolean> => {
  const { error } = await supabase
    .from('lp_user_roles')
    .upsert({
      lp_id: lpId,
      user_id: userId,
      role
    }, { onConflict: 'lp_id,user_id' });

  if (error) {
    console.error('Error adding user role:', error);
    return false;
  }

  return true;
};

// Remove user role from LP
export const removeUserRoleFromLP = async (lpId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('lp_user_roles')
    .delete()
    .eq('lp_id', lpId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing user role:', error);
    return false;
  }

  return true;
};

// Get content for a section
export const getSectionContent = async (lpId: string, section: string): Promise<LPContent> => {
  const { data, error } = await supabase
    .from('lp_content')
    .select('key, value')
    .eq('lp_id', lpId)
    .eq('section', section);

  if (error) {
    console.error('Error fetching section content:', error);
    return {};
  }

  const content: LPContent = {};
  data?.forEach((item) => {
    content[item.key] = item.value || undefined;
  });

  return content;
};

// Get all content for an LP (ordered by section_order)
export const getAllContent = async (lpId: string): Promise<Record<string, LPContent>> => {
  const { data, error } = await supabase
    .from('lp_content')
    .select('section, key, value, section_order')
    .eq('lp_id', lpId)
    .order('section_order', { ascending: true });

  if (error) {
    console.error('Error fetching all content:', error);
    return {};
  }

  const content: Record<string, LPContent> = {};
  data?.forEach((item) => {
    if (!content[item.section]) {
      content[item.section] = {};
    }
    content[item.section][item.key] = item.value || undefined;
  });

  return content;
};

// Get section order for an LP
export const getSectionOrder = async (lpId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('lp_content')
    .select('section, section_order')
    .eq('lp_id', lpId)
    .order('section_order', { ascending: true });

  if (error) {
    console.error('Error fetching section order:', error);
    return Object.keys(SECTION_NAMES);
  }

  const sectionsSet = new Set<string>();
  data?.forEach(item => sectionsSet.add(item.section));
  
  const orderedSections = Array.from(sectionsSet);
  
  Object.keys(SECTION_NAMES).forEach(section => {
    if (!orderedSections.includes(section)) {
      orderedSections.push(section);
    }
  });

  return orderedSections;
};

// Update section order
export const updateSectionOrder = async (lpId: string, sections: string[]): Promise<boolean> => {
  try {
    for (let i = 0; i < sections.length; i++) {
      const { error } = await supabase
        .from('lp_content')
        .update({ section_order: i + 1 })
        .eq('lp_id', lpId)
        .eq('section', sections[i]);

      if (error) {
        console.error('Error updating section order:', error);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error updating section order:', error);
    return false;
  }
};

// Save section content
export const saveSectionContent = async (
  lpId: string,
  section: string,
  content: LPContent,
  sectionOrder?: number
): Promise<boolean> => {
  const entries = Object.entries(content).filter(([, value]) => value !== undefined);

  for (const [key, value] of entries) {
    const { error } = await supabase
      .from('lp_content')
      .upsert(
        {
          lp_id: lpId,
          section,
          key,
          value: value || '',
          section_order: sectionOrder ?? 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'lp_id,section,key' }
      );

    if (error) {
      console.error('Error saving content:', error);
      return false;
    }
  }

  return true;
};

// Get all settings for an LP
export const getSettings = async (lpId: string): Promise<LPSettings> => {
  const { data, error } = await supabase
    .from('lp_settings')
    .select('key, value')
    .eq('lp_id', lpId);

  if (error) {
    console.error('Error fetching settings:', error);
    return {};
  }

  const settings: LPSettings = {};
  data?.forEach((item) => {
    settings[item.key] = item.value || undefined;
  });

  return settings;
};

// Get a specific setting
export const getSetting = async (lpId: string, key: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('lp_settings')
    .select('value')
    .eq('lp_id', lpId)
    .eq('key', key)
    .maybeSingle();

  if (error) {
    console.error('Error fetching setting:', error);
    return null;
  }

  return data?.value || null;
};

// Save settings
export const saveSettings = async (lpId: string, settings: LPSettings): Promise<boolean> => {
  const entries = Object.entries(settings).filter(([, value]) => value !== undefined);

  for (const [key, value] of entries) {
    const { error } = await supabase
      .from('lp_settings')
      .upsert(
        {
          lp_id: lpId,
          key,
          value: value || '',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'lp_id,key' }
      );

    if (error) {
      console.error('Error saving setting:', error);
      return false;
    }
  }

  return true;
};

// Check rate limit before saving lead
export const checkLeadRateLimit = async (lpId: string, email: string): Promise<boolean> => {
  const { data, error } = await supabase
    .rpc('check_lead_rate_limit', { _lp_id: lpId, _email: email });

  if (error) {
    console.error('Error checking rate limit:', error);
    return true;
  }

  return data as boolean;
};

// Save a lead and trigger webhooks
export const saveLead = async (
  lpId: string,
  lead: { nome?: string; email?: string; telefone?: string },
  utm?: Record<string, string>
): Promise<{ success: boolean; error?: string }> => {
  if (lead.email) {
    const allowed = await checkLeadRateLimit(lpId, lead.email);
    if (!allowed) {
      return { success: false, error: 'rate_limit' };
    }
  }

  const { data: insertedLead, error } = await supabase.from('lp_leads').insert({
    lp_id: lpId,
    nome: lead.nome || null,
    email: lead.email || null,
    telefone: lead.telefone || null,
    utm: utm || null,
  }).select().single();

  if (error) {
    console.error('Error saving lead:', error);
    return { success: false, error: 'db_error' };
  }

  // Track lead_submit event
  await trackLPEvent(lpId, 'lead_submit');

  // Trigger webhooks asynchronously
  triggerWebhooks(lpId, insertedLead).catch(console.error);

  return { success: true };
};

// Trigger webhooks for a lead
const triggerWebhooks = async (lpId: string, lead: any) => {
  const { data: webhooks } = await supabase
    .from('lp_webhooks')
    .select('*')
    .eq('lp_id', lpId)
    .eq('ativo', true);

  if (!webhooks || webhooks.length === 0) return;

  const payload = {
    lp_id: lpId,
    lead_id: lead.id,
    nome: lead.nome,
    email: lead.email,
    telefone: lead.telefone,
    utm: lead.utm,
    created_at: lead.created_at,
  };

  for (const webhook of webhooks) {
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Log webhook result
      await supabase.from('lp_webhook_logs').insert({
        webhook_id: webhook.id,
        lead_id: lead.id,
        status_code: response.status,
        response_body: await response.text().catch(() => null),
      });
    } catch (err: any) {
      await supabase.from('lp_webhook_logs').insert({
        webhook_id: webhook.id,
        lead_id: lead.id,
        error_message: err.message,
      });
    }
  }
};

// Get leads for an LP
export const getLeads = async (lpId: string) => {
  const { data, error } = await supabase
    .from('lp_leads')
    .select('*')
    .eq('lp_id', lpId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data || [];
};

// ====================================================================
// WEBHOOKS
// ====================================================================

export const getWebhooks = async (lpId: string): Promise<LPWebhook[]> => {
  const { data, error } = await supabase
    .from('lp_webhooks')
    .select('*')
    .eq('lp_id', lpId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching webhooks:', error);
    return [];
  }

  return (data || []) as LPWebhook[];
};

export const createWebhook = async (lpId: string, url: string, tipo: 'generic' | 'hubspot' | 'pipedrive' = 'generic'): Promise<LPWebhook | null> => {
  const { data, error } = await supabase
    .from('lp_webhooks')
    .insert({ lp_id: lpId, url, tipo })
    .select()
    .single();

  if (error) {
    console.error('Error creating webhook:', error);
    return null;
  }

  return data as LPWebhook;
};

export const updateWebhook = async (id: string, updates: Partial<Pick<LPWebhook, 'url' | 'tipo' | 'ativo'>>): Promise<boolean> => {
  const { error } = await supabase
    .from('lp_webhooks')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating webhook:', error);
    return false;
  }

  return true;
};

export const deleteWebhook = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('lp_webhooks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting webhook:', error);
    return false;
  }

  return true;
};

// ====================================================================
// EVENTS / METRICS
// ====================================================================

export const trackLPEvent = async (lpId: string, eventType: 'view' | 'cta_click' | 'lead_submit', metadata?: Record<string, any>): Promise<boolean> => {
  const { error } = await supabase
    .from('lp_events')
    .insert({
      lp_id: lpId,
      event_type: eventType,
      metadata: metadata || null,
    });

  if (error) {
    console.error('Error tracking event:', error);
    return false;
  }

  return true;
};

export const getEventCounts = async (lpId: string): Promise<LPEventCounts> => {
  const { data, error } = await supabase
    .rpc('get_lp_event_counts', { _lp_id: lpId });

  if (error) {
    console.error('Error fetching event counts:', error);
    return { view: 0, cta_click: 0, lead_submit: 0 };
  }

  const counts: LPEventCounts = { view: 0, cta_click: 0, lead_submit: 0 };
  (data || []).forEach((row: { event_type: string; count: number }) => {
    if (row.event_type in counts) {
      counts[row.event_type as keyof LPEventCounts] = Number(row.count);
    }
  });

  return counts;
};

// Section names mapping
export const SECTION_NAMES: Record<string, string> = {
  menu: 'Menu',
  hero: 'Topo / Hero',
  como_funciona: 'Como funciona',
  para_quem_e: 'Para quem é',
  beneficios: 'Benefícios',
  provas_sociais: 'Provas sociais',
  planos: 'Planos',
  faq: 'FAQ',
  chamada_final: 'Chamada final',
  rodape: 'Rodapé',
};

export const SECTIONS_WITH_VARIANTS = [
  'menu',
  'hero',
  'como_funciona',
  'para_quem_e',
  'beneficios',
  'provas_sociais',
  'planos',
  'faq',
  'chamada_final',
  'rodape',
];

export const DEFAULT_SECTION_ORDER = [
  'menu',
  'hero',
  'como_funciona',
  'para_quem_e',
  'beneficios',
  'provas_sociais',
  'planos',
  'faq',
  'chamada_final',
  'rodape',
];

// Create LP from template
export const createLPFromTemplate = async (
  name: string,
  slug: string,
  template: 'conversao_direta' | 'lead_magnet'
): Promise<LandingPage | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: newLP, error: lpError } = await supabase
    .from('landing_pages')
    .insert({
      nome: name,
      slug,
      publicado: false,
      owner_id: session.user.id,
    })
    .select()
    .single();

  if (lpError || !newLP) {
    console.error('Error creating LP:', lpError);
    return null;
  }

  const templateContent = template === 'conversao_direta' 
    ? TEMPLATE_CONVERSAO_DIRETA 
    : TEMPLATE_LEAD_MAGNET;

  for (const [section, content] of Object.entries(templateContent.content)) {
    const sectionOrder = DEFAULT_SECTION_ORDER.indexOf(section) + 1;
    for (const [key, value] of Object.entries(content)) {
      await supabase.from('lp_content').insert({
        lp_id: newLP.id,
        section,
        key,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        section_order: sectionOrder,
      });
    }
  }

  for (const [key, value] of Object.entries(templateContent.settings)) {
    await supabase.from('lp_settings').insert({
      lp_id: newLP.id,
      key,
      value: value as string,
    });
  }

  return newLP;
};

// Duplicate LP with all content and settings
export const duplicateLP = async (sourceLpId: string, newName: string, newSlug: string): Promise<LandingPage | null> => {
  const sourceLP = await getLPById(sourceLpId);
  if (!sourceLP) return null;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: newLP, error: lpError } = await supabase
    .from('landing_pages')
    .insert({
      nome: newName,
      slug: newSlug,
      dominio: null,
      publicado: false,
      owner_id: session.user.id,
    })
    .select()
    .single();

  if (lpError || !newLP) {
    console.error('Error creating new LP:', lpError);
    return null;
  }

  const { data: sourceContent } = await supabase
    .from('lp_content')
    .select('section, key, value, section_order')
    .eq('lp_id', sourceLpId);

  if (sourceContent && sourceContent.length > 0) {
    const contentToInsert = sourceContent.map(item => ({
      lp_id: newLP.id,
      section: item.section,
      key: item.key,
      value: item.value,
      section_order: item.section_order,
    }));

    await supabase.from('lp_content').insert(contentToInsert);
  }

  const { data: sourceSettings } = await supabase
    .from('lp_settings')
    .select('key, value')
    .eq('lp_id', sourceLpId);

  if (sourceSettings && sourceSettings.length > 0) {
    const settingsToInsert = sourceSettings.map(item => ({
      lp_id: newLP.id,
      key: item.key,
      value: item.value,
    }));

    await supabase.from('lp_settings').insert(settingsToInsert);
  }

  return newLP;
};

// Update LP publication status
export const updateLPStatus = async (lpId: string, publicado: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from('landing_pages')
    .update({ publicado })
    .eq('id', lpId);

  if (error) {
    console.error('Error updating LP status:', error);
    return false;
  }

  return true;
};

// Update LP domain
export const updateLPDomain = async (lpId: string, dominio: string | null): Promise<boolean> => {
  const { error } = await supabase
    .from('landing_pages')
    .update({ 
      dominio, 
      dominio_verificado: false 
    })
    .eq('id', lpId);

  if (error) {
    console.error('Error updating LP domain:', error);
    return false;
  }

  return true;
};

// Delete LP
export const deleteLP = async (lpId: string): Promise<boolean> => {
  await supabase.from('lp_leads').delete().eq('lp_id', lpId);
  await supabase.from('lp_settings').delete().eq('lp_id', lpId);
  await supabase.from('lp_content').delete().eq('lp_id', lpId);
  await supabase.from('lp_user_roles').delete().eq('lp_id', lpId);
  await supabase.from('lp_webhooks').delete().eq('lp_id', lpId);
  await supabase.from('lp_events').delete().eq('lp_id', lpId);
  
  const { error } = await supabase
    .from('landing_pages')
    .delete()
    .eq('id', lpId);

  if (error) {
    console.error('Error deleting LP:', error);
    return false;
  }

  return true;
};

// Upload media file
export const uploadMedia = async (lpId: string, file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${lpId}/${fileName}`;

  const { error } = await supabase.storage
    .from('lp-media')
    .upload(filePath, file);

  if (error) {
    console.error('Error uploading media:', error);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('lp-media')
    .getPublicUrl(filePath);

  return publicUrl;
};

// Get media files for LP
export const getMediaFiles = async (lpId: string): Promise<{ name: string; url: string }[]> => {
  const { data, error } = await supabase.storage
    .from('lp-media')
    .list(lpId);

  if (error) {
    console.error('Error listing media:', error);
    return [];
  }

  return (data || []).map(file => ({
    name: file.name,
    url: supabase.storage.from('lp-media').getPublicUrl(`${lpId}/${file.name}`).data.publicUrl
  }));
};

// Delete media file
export const deleteMedia = async (lpId: string, fileName: string): Promise<boolean> => {
  const { error } = await supabase.storage
    .from('lp-media')
    .remove([`${lpId}/${fileName}`]);

  if (error) {
    console.error('Error deleting media:', error);
    return false;
  }

  return true;
};

// Export leads to CSV
export const exportLeadsToCSV = (leads: any[]): string => {
  const headers = ['Nome', 'Email', 'Telefone', 'Data', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term'];
  
  const rows = leads.map(lead => {
    const utm = lead.utm || {};
    return [
      lead.nome || '',
      lead.email || '',
      lead.telefone || '',
      new Date(lead.created_at).toLocaleString('pt-BR'),
      utm.utm_source || '',
      utm.utm_medium || '',
      utm.utm_campaign || '',
      utm.utm_content || '',
      utm.utm_term || '',
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

// ====================================================================
// TEMPLATES
// ====================================================================

const TEMPLATE_CONVERSAO_DIRETA = {
  content: {
    hero: {
      badge: 'Oferta por tempo limitado',
      titulo: 'Transforme seus resultados com',
      destaque: 'nossa solução',
      subtitulo: 'Descubra como milhares de clientes já alcançaram seus objetivos com nossa plataforma completa.',
      texto_botao_primario: 'Começar agora',
      url_botao_primario: '#planos',
      texto_botao_secundario: 'Ver como funciona',
      url_botao_secundario: '#como-funciona',
    },
    beneficios: {
      titulo: 'Por que escolher nossa solução?',
      subtitulo: 'Recursos poderosos que fazem a diferença',
      beneficios_json: JSON.stringify([
        { titulo: 'Fácil de usar', descricao: 'Interface intuitiva que qualquer pessoa pode usar', icone: 'Zap' },
        { titulo: 'Resultados rápidos', descricao: 'Veja melhorias em poucos dias de uso', icone: 'TrendingUp' },
        { titulo: 'Suporte 24/7', descricao: 'Nossa equipe está sempre pronta para ajudar', icone: 'HeadphonesIcon' },
        { titulo: 'Garantia total', descricao: '30 dias de garantia ou seu dinheiro de volta', icone: 'Shield' },
      ]),
    },
    provas_sociais: {
      titulo: 'O que nossos clientes dizem',
      depoimentos_json: JSON.stringify([
        { nome: 'Maria Silva', cargo: 'CEO, TechCorp', texto: 'Incrível! Nossos resultados triplicaram em apenas 3 meses.' },
        { nome: 'João Santos', cargo: 'Diretor de Marketing', texto: 'A melhor decisão que tomamos foi contratar esta solução.' },
        { nome: 'Ana Costa', cargo: 'Empreendedora', texto: 'Simples, eficiente e com ótimo custo-benefício.' },
      ]),
    },
    planos: {
      titulo: 'Escolha o plano ideal para você',
      subtitulo: 'Preços acessíveis para todos os tamanhos de negócio',
      planos_json: JSON.stringify([
        { nome: 'Básico', preco: 'R$ 97/mês', descricao: 'Perfeito para começar', destaque: false, itens: ['Até 1.000 contatos', 'Suporte por email', '1 usuário'] },
        { nome: 'Profissional', preco: 'R$ 197/mês', descricao: 'Mais popular', destaque: true, itens: ['Até 10.000 contatos', 'Suporte prioritário', '5 usuários', 'Relatórios avançados'] },
        { nome: 'Enterprise', preco: 'R$ 497/mês', descricao: 'Para grandes empresas', destaque: false, itens: ['Contatos ilimitados', 'Suporte 24/7', 'Usuários ilimitados', 'API completa'] },
      ]),
    },
    faq: {
      titulo: 'Perguntas frequentes',
      perguntas_json: JSON.stringify([
        { pergunta: 'Como funciona o período de teste?', resposta: 'Você tem 14 dias para testar gratuitamente todas as funcionalidades.' },
        { pergunta: 'Posso cancelar a qualquer momento?', resposta: 'Sim, você pode cancelar sua assinatura quando quiser, sem multas.' },
        { pergunta: 'Vocês oferecem suporte?', resposta: 'Sim, oferecemos suporte por email, chat e telefone dependendo do seu plano.' },
        { pergunta: 'Meus dados estão seguros?', resposta: 'Absolutamente. Usamos criptografia de ponta e seguimos as melhores práticas de segurança.' },
        { pergunta: 'Posso mudar de plano depois?', resposta: 'Sim, você pode fazer upgrade ou downgrade a qualquer momento.' },
      ]),
    },
    chamada_final: {
      titulo: 'Pronto para transformar seus resultados?',
      subtitulo: 'Junte-se a milhares de clientes satisfeitos. Comece hoje mesmo!',
      texto_botao: 'Começar agora',
      url_botao: '#planos',
    },
    rodape: {
      copyright: '© 2024 Sua Empresa. Todos os direitos reservados.',
      links_json: JSON.stringify([
        { label: 'Termos de Uso', url: '/termos' },
        { label: 'Privacidade', url: '/privacidade' },
        { label: 'Contato', url: '/contato' },
      ]),
    },
  },
  settings: {
    hero_variante: 'modelo_a',
    beneficios_variante: 'modelo_a',
    provas_sociais_variante: 'modelo_a',
    planos_variante: 'modelo_a',
    faq_variante: 'modelo_a',
    chamada_final_variante: 'modelo_a',
  },
};

const TEMPLATE_LEAD_MAGNET = {
  content: {
    hero: {
      badge: 'Download gratuito',
      titulo: 'Baixe nosso eBook exclusivo:',
      destaque: 'Guia Completo',
      subtitulo: 'Descubra os segredos que os especialistas usam para alcançar resultados extraordinários.',
      texto_botao_primario: 'Baixar eBook grátis',
      url_botao_primario: '#lead-form',
      texto_botao_secundario: 'Saiba mais',
      url_botao_secundario: '#como-funciona',
    },
    como_funciona: {
      titulo: 'Como funciona',
      subtitulo: 'Em 3 passos simples você terá acesso ao conteúdo',
      passos_json: JSON.stringify([
        { titulo: 'Preencha o formulário', descricao: 'Insira seu nome e email para receber o material', icone: 'FileText' },
        { titulo: 'Confirme seu email', descricao: 'Verifique sua caixa de entrada e clique no link', icone: 'Mail' },
        { titulo: 'Acesse o conteúdo', descricao: 'Baixe imediatamente o eBook completo', icone: 'Download' },
      ]),
    },
    para_quem_e: {
      titulo: 'Para quem é este material?',
      subtitulo: 'Este eBook foi criado especialmente para:',
      perfis_json: JSON.stringify([
        { titulo: 'Empreendedores', descricao: 'Que querem escalar seus negócios', icone: 'Rocket' },
        { titulo: 'Profissionais', descricao: 'Buscando crescimento na carreira', icone: 'Briefcase' },
        { titulo: 'Estudantes', descricao: 'Interessados em aprender novas habilidades', icone: 'GraduationCap' },
      ]),
    },
    provas_sociais: {
      titulo: 'O que dizem sobre o material',
      depoimentos_json: JSON.stringify([
        { nome: 'Pedro Lima', cargo: 'Empresário', texto: 'Conteúdo incrível! Mudou minha visão sobre o mercado.' },
        { nome: 'Carla Mendes', cargo: 'Consultora', texto: 'Material completo e muito bem organizado. Recomendo!' },
      ]),
    },
    chamada_final: {
      titulo: 'Não perca esta oportunidade!',
      subtitulo: 'Baixe agora o eBook gratuito e transforme seus resultados.',
      texto_botao: 'Quero meu eBook grátis',
      url_botao: '#lead-form',
    },
    rodape: {
      copyright: '© 2024 Sua Empresa. Todos os direitos reservados.',
      links_json: JSON.stringify([
        { label: 'Termos de Uso', url: '/termos' },
        { label: 'Privacidade', url: '/privacidade' },
      ]),
    },
  },
  settings: {
    hero_variante: 'modelo_b',
    como_funciona_variante: 'modelo_a',
    para_quem_e_variante: 'modelo_a',
    provas_sociais_variante: 'modelo_b',
    chamada_final_variante: 'modelo_a',
  },
};

// ====================================================================
// CAPTCHA VERIFICATION
// ====================================================================

export const verifyCaptcha = async (lpId: string, captchaToken: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-captcha', {
      body: { lp_id: lpId, captcha_token: captchaToken },
    });

    if (error) {
      console.error('Error verifying captcha:', error);
      return false;
    }

    return data?.success === true;
  } catch (error) {
    console.error('Error calling verify-captcha function:', error);
    return false;
  }
};

// ====================================================================
// DOMAIN & BACKUP FUNCTIONS
// ====================================================================

export const verifyDomain = async (lpId: string): Promise<{ success: boolean; verified?: boolean; message?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('verify-domain', {
      body: { lp_id: lpId },
    });
    if (error) return { success: false, message: error.message };
    return data;
  } catch (error) {
    return { success: false, message: 'Error verifying domain' };
  }
};

export const exportBackup = async (lpId: string): Promise<{ success: boolean; download_url?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('export-backup', {
      body: { lp_id: lpId },
    });
    if (error) return { success: false, error: error.message };
    return data;
  } catch (error) {
    return { success: false, error: 'Error creating backup' };
  }
};

export const getSystemLogs = async (lpId?: string, limit = 50) => {
  let query = supabase.from('system_logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (lpId) query = query.eq('lp_id', lpId);
  const { data } = await query;
  return data || [];
};

export const getUptimeChecks = async (limit = 50) => {
  const { data } = await supabase.from('uptime_checks').select('*').order('checked_at', { ascending: false }).limit(limit);
  return data || [];
};
