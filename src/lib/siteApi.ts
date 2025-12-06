import { supabase } from '@/integrations/supabase/client';
import { LandingPage, LPContent, LPSettings, getUserRoleForLP, LPRole } from './lpContentApi';

export interface SitePage {
  id: string;
  lp_id: string;
  slug: string;
  nome: string;
  section_order: string[];
  publicado: boolean;
  created_at: string;
}

export interface Site extends LandingPage {
  is_site: boolean;
}

// Available sections for site pages
export const SITE_SECTIONS: Record<string, string> = {
  hero: 'Hero',
  hero_secundario: 'Hero Secundário',
  como_funciona: 'Como funciona',
  para_quem_e: 'Para quem é',
  beneficios: 'Benefícios',
  provas_sociais: 'Provas sociais',
  planos: 'Planos',
  faq: 'FAQ',
  chamada_final: 'Chamada final',
  form_contato: 'Formulário de contato',
  cta_whatsapp: 'CTA WhatsApp',
  garantia: 'Garantia',
  rodape: 'Rodapé',
};

// Get all sites (filtered by is_site = true)
export const getAllSites = async (): Promise<Site[]> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('is_site', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sites:', error);
    return [];
  }

  return (data || []) as Site[];
};

// Get all sites with user roles
export const getAllSitesWithRoles = async (): Promise<(Site & { userRole: LPRole })[]> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const sites = await getAllSites();
  const result: (Site & { userRole: LPRole })[] = [];

  for (const site of sites) {
    const role = await getUserRoleForLP(site.id);
    if (role) {
      result.push({ ...site, userRole: role });
    }
  }

  return result;
};

// Get site by ID
export const getSiteById = async (id: string): Promise<Site | null> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('id', id)
    .eq('is_site', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching site:', error);
    return null;
  }

  return data as Site | null;
};

// Get site by domain
export const getSiteByDomain = async (domain: string): Promise<Site | null> => {
  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('dominio', domain)
    .eq('is_site', true)
    .eq('publicado', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching site by domain:', error);
    return null;
  }

  return data as Site | null;
};

// Get pages for a site
export const getSitePages = async (lpId: string): Promise<SitePage[]> => {
  const { data, error } = await supabase
    .from('site_pages')
    .select('*')
    .eq('lp_id', lpId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching site pages:', error);
    return [];
  }

  return (data || []).map(page => ({
    ...page,
    section_order: page.section_order || []
  })) as SitePage[];
};

// Get a specific page
export const getSitePage = async (pageId: string): Promise<SitePage | null> => {
  const { data, error } = await supabase
    .from('site_pages')
    .select('*')
    .eq('id', pageId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching site page:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    section_order: data.section_order || []
  } as SitePage;
};

// Get page by slug
export const getSitePageBySlug = async (lpId: string, slug: string): Promise<SitePage | null> => {
  const { data, error } = await supabase
    .from('site_pages')
    .select('*')
    .eq('lp_id', lpId)
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Error fetching site page by slug:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    section_order: data.section_order || []
  } as SitePage;
};

// Create a new page
export const createSitePage = async (
  lpId: string,
  nome: string,
  slug: string,
  sectionOrder: string[] = []
): Promise<SitePage | null> => {
  const { data, error } = await supabase
    .from('site_pages')
    .insert({
      lp_id: lpId,
      nome,
      slug,
      section_order: sectionOrder,
      publicado: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating site page:', error);
    return null;
  }

  return {
    ...data,
    section_order: data.section_order || []
  } as SitePage;
};

// Update a page
export const updateSitePage = async (
  pageId: string,
  updates: Partial<Pick<SitePage, 'nome' | 'slug' | 'section_order' | 'publicado'>>
): Promise<boolean> => {
  const { error } = await supabase
    .from('site_pages')
    .update(updates)
    .eq('id', pageId);

  if (error) {
    console.error('Error updating site page:', error);
    return false;
  }

  return true;
};

// Delete a page
export const deleteSitePage = async (pageId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('site_pages')
    .delete()
    .eq('id', pageId);

  if (error) {
    console.error('Error deleting site page:', error);
    return false;
  }

  return true;
};

// Create a new site
export const createSite = async (name: string, slug: string): Promise<Site | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: newSite, error: siteError } = await supabase
    .from('landing_pages')
    .insert({
      nome: name,
      slug,
      publicado: false,
      owner_id: session.user.id,
      is_site: true,
    })
    .select()
    .single();

  if (siteError || !newSite) {
    console.error('Error creating site:', siteError);
    return null;
  }

  // Create default Home page
  await createSitePage(newSite.id, 'Home', '', ['hero', 'chamada_final', 'rodape']);

  return newSite as Site;
};

// Create site from template
export const createSiteFromTemplate = async (
  name: string,
  slug: string,
  template: 'institucional_moderno'
): Promise<Site | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: newSite, error: siteError } = await supabase
    .from('landing_pages')
    .insert({
      nome: name,
      slug,
      publicado: false,
      owner_id: session.user.id,
      is_site: true,
    })
    .select()
    .single();

  if (siteError || !newSite) {
    console.error('Error creating site:', siteError);
    return null;
  }

  if (template === 'institucional_moderno') {
    await applyInstitucionalModernoTemplate(newSite.id);
  }

  return newSite as Site;
};

// Template: Site Institucional Moderno
const applyInstitucionalModernoTemplate = async (siteId: string) => {
  // Create pages
  const pages = [
    { nome: 'Home', slug: '', sections: ['hero', 'como_funciona', 'beneficios', 'provas_sociais', 'chamada_final', 'rodape'] },
    { nome: 'Recursos', slug: 'recursos', sections: ['hero_secundario', 'beneficios', 'chamada_final', 'rodape'] },
    { nome: 'Planos', slug: 'planos', sections: ['planos', 'garantia', 'chamada_final', 'rodape'] },
    { nome: 'Contato', slug: 'contato', sections: ['form_contato', 'cta_whatsapp', 'rodape'] },
  ];

  for (const page of pages) {
    await createSitePage(siteId, page.nome, page.slug, page.sections);
  }

  // Add default content for each section
  const contentEntries = [
    // Hero
    { section: 'hero', key: 'badge', value: 'Bem-vindo ao nosso site' },
    { section: 'hero', key: 'titulo', value: 'Soluções que transformam' },
    { section: 'hero', key: 'destaque', value: 'seu negócio' },
    { section: 'hero', key: 'subtitulo', value: 'Descubra como podemos ajudar sua empresa a alcançar novos patamares.' },
    { section: 'hero', key: 'texto_botao_primario', value: 'Conhecer recursos' },
    { section: 'hero', key: 'url_botao_primario', value: '/recursos' },
    { section: 'hero', key: 'texto_botao_secundario', value: 'Ver planos' },
    { section: 'hero', key: 'url_botao_secundario', value: '/planos' },
    // Hero Secundário (para página de recursos)
    { section: 'hero_secundario', key: 'titulo', value: 'Nossos Recursos' },
    { section: 'hero_secundario', key: 'subtitulo', value: 'Ferramentas poderosas para impulsionar seu sucesso' },
    // Como funciona
    { section: 'como_funciona', key: 'titulo', value: 'Como funciona' },
    { section: 'como_funciona', key: 'subtitulo', value: 'Processo simples em 3 etapas' },
    { section: 'como_funciona', key: 'passos_json', value: JSON.stringify([
      { titulo: 'Escolha seu plano', descricao: 'Selecione o plano ideal para suas necessidades', icone: 'CheckCircle' },
      { titulo: 'Configure sua conta', descricao: 'Personalize as configurações do seu ambiente', icone: 'Settings' },
      { titulo: 'Comece a usar', descricao: 'Aproveite todos os recursos disponíveis', icone: 'Rocket' },
    ]) },
    // Benefícios
    { section: 'beneficios', key: 'titulo', value: 'Por que nos escolher?' },
    { section: 'beneficios', key: 'subtitulo', value: 'Recursos que fazem a diferença' },
    { section: 'beneficios', key: 'beneficios_json', value: JSON.stringify([
      { titulo: 'Fácil de usar', descricao: 'Interface intuitiva e amigável', icone: 'Zap' },
      { titulo: 'Suporte dedicado', descricao: 'Equipe pronta para ajudar 24/7', icone: 'HeadphonesIcon' },
      { titulo: 'Segurança total', descricao: 'Seus dados protegidos com criptografia', icone: 'Shield' },
      { titulo: 'Resultados rápidos', descricao: 'Veja melhorias em poucos dias', icone: 'TrendingUp' },
    ]) },
    // Provas sociais
    { section: 'provas_sociais', key: 'titulo', value: 'O que dizem nossos clientes' },
    { section: 'provas_sociais', key: 'depoimentos_json', value: JSON.stringify([
      { nome: 'Carlos Silva', cargo: 'CEO, TechCorp', texto: 'Excelente serviço! Transformou nossa operação.' },
      { nome: 'Ana Mendes', cargo: 'Diretora de Marketing', texto: 'Resultados incríveis em tempo recorde.' },
      { nome: 'Pedro Costa', cargo: 'Empreendedor', texto: 'Recomendo para qualquer negócio.' },
    ]) },
    // Planos
    { section: 'planos', key: 'titulo', value: 'Escolha seu plano' },
    { section: 'planos', key: 'subtitulo', value: 'Preços acessíveis para todos' },
    { section: 'planos', key: 'planos_json', value: JSON.stringify([
      { nome: 'Básico', preco: 'R$ 49/mês', descricao: 'Para começar', destaque: false, itens: ['1 usuário', 'Suporte por email', 'Recursos básicos'] },
      { nome: 'Pro', preco: 'R$ 99/mês', descricao: 'Mais popular', destaque: true, itens: ['5 usuários', 'Suporte prioritário', 'Todos os recursos', 'Relatórios'] },
      { nome: 'Enterprise', preco: 'R$ 249/mês', descricao: 'Para grandes equipes', destaque: false, itens: ['Usuários ilimitados', 'Suporte 24/7', 'API completa', 'Personalização'] },
    ]) },
    // Garantia
    { section: 'garantia', key: 'titulo', value: 'Garantia de 30 dias' },
    { section: 'garantia', key: 'descricao', value: 'Se não ficar satisfeito nos primeiros 30 dias, devolvemos seu dinheiro integralmente.' },
    // Chamada final
    { section: 'chamada_final', key: 'titulo', value: 'Pronto para começar?' },
    { section: 'chamada_final', key: 'subtitulo', value: 'Junte-se a milhares de clientes satisfeitos.' },
    { section: 'chamada_final', key: 'texto_botao', value: 'Começar agora' },
    { section: 'chamada_final', key: 'url_botao', value: '/planos' },
    // Formulário de contato
    { section: 'form_contato', key: 'titulo', value: 'Entre em contato' },
    { section: 'form_contato', key: 'subtitulo', value: 'Preencha o formulário e responderemos em breve.' },
    // CTA WhatsApp
    { section: 'cta_whatsapp', key: 'titulo', value: 'Prefere falar pelo WhatsApp?' },
    { section: 'cta_whatsapp', key: 'numero', value: '5511999999999' },
    { section: 'cta_whatsapp', key: 'mensagem', value: 'Olá! Gostaria de saber mais sobre seus serviços.' },
    // Rodapé
    { section: 'rodape', key: 'copyright', value: '© 2024 Sua Empresa. Todos os direitos reservados.' },
    { section: 'rodape', key: 'links_json', value: JSON.stringify([
      { label: 'Home', url: '/' },
      { label: 'Recursos', url: '/recursos' },
      { label: 'Planos', url: '/planos' },
      { label: 'Contato', url: '/contato' },
    ]) },
  ];

  for (const entry of contentEntries) {
    await supabase.from('lp_content').insert({
      lp_id: siteId,
      section: entry.section,
      key: entry.key,
      value: entry.value,
      section_order: 0,
    });
  }

  // Add default settings
  const settings = [
    { key: 'hero_variante', value: 'modelo_a' },
    { key: 'beneficios_variante', value: 'modelo_a' },
    { key: 'provas_sociais_variante', value: 'modelo_a' },
    { key: 'planos_variante', value: 'modelo_a' },
    { key: 'chamada_final_variante', value: 'modelo_a' },
  ];

  for (const setting of settings) {
    await supabase.from('lp_settings').insert({
      lp_id: siteId,
      key: setting.key,
      value: setting.value,
    });
  }
};

// Delete a site and all its pages
export const deleteSite = async (siteId: string): Promise<boolean> => {
  // Delete all pages first
  await supabase.from('site_pages').delete().eq('lp_id', siteId);
  
  // Delete related data
  await supabase.from('lp_leads').delete().eq('lp_id', siteId);
  await supabase.from('lp_settings').delete().eq('lp_id', siteId);
  await supabase.from('lp_content').delete().eq('lp_id', siteId);
  await supabase.from('lp_user_roles').delete().eq('lp_id', siteId);
  await supabase.from('lp_webhooks').delete().eq('lp_id', siteId);
  await supabase.from('lp_events').delete().eq('lp_id', siteId);
  
  const { error } = await supabase
    .from('landing_pages')
    .delete()
    .eq('id', siteId);

  if (error) {
    console.error('Error deleting site:', error);
    return false;
  }

  return true;
};

// Update site status
export const updateSiteStatus = async (siteId: string, publicado: boolean): Promise<boolean> => {
  const { error } = await supabase
    .from('landing_pages')
    .update({ publicado })
    .eq('id', siteId);

  if (error) {
    console.error('Error updating site status:', error);
    return false;
  }

  return true;
};

// Check if user is SaaS owner (has access to Sites menu)
export const isSaaSOwner = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return false;

  // Check if user owns any landing page (is a SaaS owner)
  const { data, error } = await supabase
    .from('landing_pages')
    .select('id')
    .eq('owner_id', session.user.id)
    .limit(1);

  if (error) {
    console.error('Error checking SaaS owner:', error);
    return false;
  }

  return (data && data.length > 0);
};
