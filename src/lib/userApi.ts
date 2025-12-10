import { supabase } from '@/integrations/supabase/client';
import { LandingPage, saveSectionContent, saveSettings } from './lpContentApi';

// Get user's first LP (where they are owner)
export const getUserFirstLP = async (): Promise<LandingPage | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data, error } = await supabase
    .from('landing_pages')
    .select('*')
    .eq('owner_id', session.user.id)
    .eq('is_site', false)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user LP:', error);
    return null;
  }

  return data;
};

// Generate a unique slug for a new LP
const generateUniqueSlug = async (baseName: string): Promise<string> => {
  const baseSlug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
};

// Create user's first LP with template content
export const createUserFirstLP = async (userName: string): Promise<LandingPage | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const lpName = 'Minha primeira página';
  const slug = await generateUniqueSlug(lpName);

  // Create the LP
  const { data: newLP, error } = await supabase
    .from('landing_pages')
    .insert({
      nome: lpName,
      slug,
      publicado: false,
      owner_id: session.user.id,
      is_site: false,
    })
    .select()
    .single();

  if (error || !newLP) {
    console.error('Error creating LP:', error);
    return null;
  }

  // Apply default template content
  await applyDefaultTemplate(newLP.id, userName);

  return newLP;
};

// Create an empty LP (for "build from scratch" flow)
export const createEmptyLP = async (): Promise<LandingPage | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const lpName = 'Nova página';
  const slug = await generateUniqueSlug(lpName);

  // Create the LP without template content
  const { data: newLP, error } = await supabase
    .from('landing_pages')
    .insert({
      nome: lpName,
      slug,
      publicado: false,
      owner_id: session.user.id,
      is_site: false,
    })
    .select()
    .single();

  if (error || !newLP) {
    console.error('Error creating empty LP:', error);
    return null;
  }

  return newLP;
};

// Apply default template content to a new LP
const applyDefaultTemplate = async (lpId: string, userName: string) => {
  // Default content for all sections
  const contentEntries = [
    // Menu
    { section: 'menu', key: 'brand_name', value: userName || 'Minha Página' },
    { section: 'menu', key: 'links_json', value: JSON.stringify([
      { label: 'Início', url: '#inicio' },
      { label: 'Sobre', url: '#sobre' },
      { label: 'Contato', url: '#contato' },
    ]) },
    { section: 'menu', key: 'cta_label', value: 'Fale conosco' },
    { section: 'menu', key: 'cta_url', value: '#contato' },
    
    // Hero
    { section: 'hero', key: 'badge', value: 'Novo' },
    { section: 'hero', key: 'titulo', value: 'Olá! Eu sou' },
    { section: 'hero', key: 'destaque', value: userName || 'Seu Nome' },
    { section: 'hero', key: 'subtitulo', value: 'Bem-vindo à minha página. Aqui você encontra informações sobre meu trabalho e como posso ajudar você.' },
    { section: 'hero', key: 'texto_botao_primario', value: 'Fale comigo' },
    { section: 'hero', key: 'url_botao_primario', value: '#contato' },
    { section: 'hero', key: 'texto_botao_secundario', value: 'Saiba mais' },
    { section: 'hero', key: 'url_botao_secundario', value: '#sobre' },
    
    // Como funciona
    { section: 'como_funciona', key: 'titulo', value: 'Como posso te ajudar' },
    { section: 'como_funciona', key: 'subtitulo', value: 'Processo simples e transparente' },
    { section: 'como_funciona', key: 'passos_json', value: JSON.stringify([
      { titulo: 'Primeiro contato', descricao: 'Você entra em contato e conta sobre sua necessidade', icone: 'MessageCircle' },
      { titulo: 'Análise e proposta', descricao: 'Analiso sua demanda e proponho a melhor solução', icone: 'FileSearch' },
      { titulo: 'Execução', descricao: 'Desenvolvimento e entrega do projeto com qualidade', icone: 'CheckCircle' },
    ]) },

    // Para quem é
    { section: 'para_quem_e', key: 'titulo', value: 'Para quem é' },
    { section: 'para_quem_e', key: 'subtitulo', value: 'Ideal para você que busca:' },
    { section: 'para_quem_e', key: 'perfis_json', value: JSON.stringify([
      { titulo: 'Empreendedores', descricao: 'Que querem presença digital profissional' },
      { titulo: 'Profissionais liberais', descricao: 'Que buscam atrair mais clientes' },
      { titulo: 'Pequenas empresas', descricao: 'Que precisam de uma página de vendas' },
    ]) },
    
    // Benefícios
    { section: 'beneficios', key: 'titulo', value: 'Por que me escolher' },
    { section: 'beneficios', key: 'subtitulo', value: 'Benefícios de trabalhar comigo' },
    { section: 'beneficios', key: 'beneficios_json', value: JSON.stringify([
      { titulo: 'Qualidade garantida', descricao: 'Entrego sempre o melhor resultado', icone: 'Award' },
      { titulo: 'Atendimento personalizado', descricao: 'Cada projeto é único', icone: 'Heart' },
      { titulo: 'Prazo cumprido', descricao: 'Compromisso com entregas no prazo', icone: 'Clock' },
      { titulo: 'Suporte contínuo', descricao: 'Estou aqui para ajudar sempre', icone: 'Headphones' },
    ]) },
    
    // Provas sociais
    { section: 'provas_sociais', key: 'titulo', value: 'O que dizem sobre mim' },
    { section: 'provas_sociais', key: 'depoimentos_json', value: JSON.stringify([
      { nome: 'Cliente satisfeito', cargo: 'Empresário', texto: 'Excelente profissional! Recomendo demais.' },
      { nome: 'Maria Silva', cargo: 'Empreendedora', texto: 'Superou todas as minhas expectativas.' },
      { nome: 'João Santos', cargo: 'Freelancer', texto: 'Atendimento impecável e resultado perfeito.' },
    ]) },
    
    // Planos
    { section: 'planos', key: 'titulo', value: 'Planos e preços' },
    { section: 'planos', key: 'subtitulo', value: 'Escolha a melhor opção para você' },
    { section: 'planos', key: 'planos_json', value: JSON.stringify([
      { nome: 'Básico', preco: 'R$ 99', descricao: 'Ideal para começar', destaque: false, itens: ['1 revisão', 'Entrega em 7 dias', 'Suporte por email'] },
      { nome: 'Profissional', preco: 'R$ 199', descricao: 'Mais popular', destaque: true, itens: ['3 revisões', 'Entrega em 5 dias', 'Suporte prioritário', 'Bônus exclusivo'] },
      { nome: 'Premium', preco: 'R$ 399', descricao: 'Solução completa', destaque: false, itens: ['Revisões ilimitadas', 'Entrega em 3 dias', 'Suporte 24/7', 'Consultoria inclusa'] },
    ]) },
    
    // FAQ
    { section: 'faq', key: 'titulo', value: 'Perguntas frequentes' },
    { section: 'faq', key: 'subtitulo', value: 'Dúvidas comuns respondidas' },
    { section: 'faq', key: 'perguntas_json', value: JSON.stringify([
      { pergunta: 'Qual o prazo de entrega?', resposta: 'O prazo varia de acordo com o plano escolhido, de 3 a 7 dias úteis.' },
      { pergunta: 'Como funciona o pagamento?', resposta: 'Aceito PIX, cartão de crédito e transferência bancária.' },
      { pergunta: 'Posso solicitar alterações?', resposta: 'Sim! Cada plano inclui um número de revisões gratuitas.' },
      { pergunta: 'Oferecem suporte após a entrega?', resposta: 'Sim, oferecemos suporte de acordo com o plano contratado.' },
    ]) },
    
    // Chamada final
    { section: 'chamada_final', key: 'titulo', value: 'Vamos trabalhar juntos?' },
    { section: 'chamada_final', key: 'subtitulo', value: 'Entre em contato agora e vamos transformar suas ideias em realidade.' },
    { section: 'chamada_final', key: 'texto_botao', value: 'Entrar em contato' },
    { section: 'chamada_final', key: 'url_botao', value: '#contato' },
    
    // Rodapé
    { section: 'rodape', key: 'copyright', value: `© ${new Date().getFullYear()} ${userName || 'Minha Página'}. Todos os direitos reservados.` },
    { section: 'rodape', key: 'links_json', value: JSON.stringify([
      { label: 'Início', url: '#' },
      { label: 'Sobre', url: '#sobre' },
      { label: 'Contato', url: '#contato' },
    ]) },
  ];

  // Save content for each section with order
  const sectionOrder = ['menu', 'hero', 'como_funciona', 'para_quem_e', 'beneficios', 'provas_sociais', 'planos', 'faq', 'chamada_final', 'rodape'];
  
  for (let i = 0; i < sectionOrder.length; i++) {
    const section = sectionOrder[i];
    const sectionContent: Record<string, string> = {};
    
    contentEntries
      .filter(entry => entry.section === section)
      .forEach(entry => {
        sectionContent[entry.key] = entry.value;
      });
    
    await saveSectionContent(lpId, section, sectionContent, i + 1);
  }

  // Save default settings (variants)
  await saveSettings(lpId, {
    menu_variante: 'modelo_a',
    hero_variante: 'modelo_a',
    como_funciona_variante: 'modelo_a',
    para_quem_e_variante: 'modelo_a',
    beneficios_variante: 'modelo_a',
    provas_sociais_variante: 'modelo_a',
    planos_variante: 'modelo_a',
    faq_variante: 'modelo_a',
    chamada_final_variante: 'modelo_a',
    rodape_variante: 'modelo_a',
  });
};

// Check if user has completed onboarding
export const hasCompletedOnboarding = (): boolean => {
  return localStorage.getItem('nobron_onboarding_completed') === 'true';
};

// Mark onboarding as completed
export const markOnboardingCompleted = () => {
  localStorage.setItem('nobron_onboarding_completed', 'true');
};

// Check if editor tour is completed
export const hasCompletedEditorTour = (): boolean => {
  return localStorage.getItem('nobron_editor_tour_completed') === 'true';
};

// Mark editor tour as completed
export const markEditorTourCompleted = () => {
  localStorage.setItem('nobron_editor_tour_completed', 'true');
};
