/**
 * Addvalu IA - Sistema de Inteligência Artificial Operacional
 * Agente inteligente conectado aos dados reais do sistema
 */

import { Project, ProjectStatus, User } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mock-data';

// ============================================
// TIPOS DE INTENÇÃO
// ============================================

export type IntentType = 
  | 'list_projects'
  | 'project_status'
  | 'filter_by_directorate'
  | 'filter_by_status'
  | 'project_analysis'
  | 'executive_summary'
  | 'risks_issues'
  | 'help'
  | 'greeting'
  | 'unknown';

export interface ParsedIntent {
  type: IntentType;
  entities: {
    diretoria?: string;
    status?: ProjectStatus | 'all';
    responsavel?: string;
    projeto?: string;
  };
  confidence: number;
}

export interface AIResponse {
  text: string;
  data?: any;
  suggestedActions?: string[];
}

// ============================================
// DIRETORIAS CONHECIDAS
// ============================================

const DIRETORIAS_KEYWORDS: Record<string, string[]> = {
  'Garantia': ['garantia', 'fiança', 'riscos', 'rebeca'],
  'Property': ['property', 'construção', 'paulo', 'cardoso'],
  'Transportes': ['transportes', 'mecânica', 'elétrica', 'clark', 'pellegrino'],
  'RCG': ['rcg', 'responsabilidade civil geral', 'alex', 'guagliardi'],
  'RCP': ['rcp', 'responsabilidade civil profissional', 'everton', 'voleck'],
  'NIE': ['nie', 'inteligência estratégica', 'núcleo'],
  'COO': ['coo', 'luciana', 'hey'],
  'CEO': ['ceo', 'william', 'fernandez'],
  'CFO': ['cfo', 'max'],
};

// ============================================
// STATUS KEYWORDS
// ============================================

const STATUS_KEYWORDS: Record<string, ProjectStatus> = {
  'ativo': 'ativo',
  'ativos': 'ativo',
  'rodando': 'ativo',
  'em andamento': 'ativo',
  'concluído': 'concluido',
  'concluido': 'concluido',
  'finalizado': 'concluido',
  'pronto': 'concluido',
  'planejamento': 'planejamento',
  'planejado': 'planejamento',
  'pausado': 'pausado',
  'parado': 'pausado',
  'cancelado': 'cancelado',
};

// ============================================
// INTENT PARSER
// ============================================

export function parseIntent(message: string): ParsedIntent {
  const lowerMsg = message.toLowerCase().trim();
  
  // Saudações
  if (/^(oi|olá|ola|bom dia|boa tarde|boa noite|hey|e aí|tudo bem)/i.test(lowerMsg)) {
    return { type: 'greeting', entities: {}, confidence: 0.95 };
  }
  
  // Ajuda
  if (/(ajuda|help|como funciona|o que você faz|quem é você)/i.test(lowerMsg)) {
    return { type: 'help', entities: {}, confidence: 0.9 };
  }
  
  // Listar projetos
  if (/(quais|liste|mostre|quais são|me fale sobre).*(projetos|projeto)/i.test(lowerMsg) ||
      /(projetos|projeto).*(ativos|rodando|temos|existem)/i.test(lowerMsg)) {
    const intent: ParsedIntent = { type: 'list_projects', entities: {}, confidence: 0.9 };
    
    // Verificar se há filtro de status
    for (const [keyword, status] of Object.entries(STATUS_KEYWORDS)) {
      if (lowerMsg.includes(keyword)) {
        intent.entities.status = status;
        break;
      }
    }
    
    // Verificar diretoria
    for (const [diretoria, keywords] of Object.entries(DIRETORIAS_KEYWORDS)) {
      if (keywords.some(k => lowerMsg.includes(k))) {
        intent.entities.diretoria = diretoria;
        break;
      }
    }
    
    return intent;
  }
  
  // Análise/Resumo executivo
  if (/(resumo|sumário|executivo|panorama|visão geral|como está|status geral)/i.test(lowerMsg) ||
      /(análise|analise|analisar).*(situação|status|geral)/i.test(lowerMsg)) {
    return { type: 'executive_summary', entities: {}, confidence: 0.85 };
  }
  
  // Riscos e problemas
  if (/(risco|riscos|problema|problemas|crítico|critico|atrasado|atrasados|atenção|alerta)/i.test(lowerMsg) ||
      /(o que está ruim|o que não vai bem|dificuldade|dificuldades)/i.test(lowerMsg)) {
    return { type: 'risks_issues', entities: {}, confidence: 0.85 };
  }
  
  // Filtro por diretoria específica
  for (const [diretoria, keywords] of Object.entries(DIRETORIAS_KEYWORDS)) {
    if (keywords.some(k => lowerMsg.includes(k))) {
      return { 
        type: 'filter_by_directorate', 
        entities: { diretoria }, 
        confidence: 0.8 
      };
    }
  }
  
  // Status específico
  if (/(status|situação|estado|fase).*(projeto|de)/i.test(lowerMsg)) {
    const intent: ParsedIntent = { type: 'project_status', entities: {}, confidence: 0.75 };
    
    // Tentar extrair nome do projeto
    const projectMatch = lowerMsg.match(/(?:projeto|sistema)\s+(.+?)(?:\?|$)/i);
    if (projectMatch) {
      intent.entities.projeto = projectMatch[1].trim();
    }
    
    return intent;
  }
  
  return { type: 'unknown', entities: {}, confidence: 0.3 };
}

// ============================================
// GERADOR DE RESPOSTAS
// ============================================

function getProjectsData(): Project[] {
  // Em produção, isso viria de uma API ou contexto
  return MOCK_PROJECTS;
}

function formatProjectList(projects: Project[]): string {
  if (projects.length === 0) {
    return "Nenhum projeto encontrado com esses critérios.";
  }
  
  const lines = projects.slice(0, 10).map(p => {
    const statusIcon = p.status === 'ativo' ? '●' : 
                       p.status === 'concluido' ? '✓' : 
                       p.status === 'planejamento' ? '○' : '◐';
    const progress = p.progresso ? `(${p.progresso}%)` : '';
    return `${statusIcon} **${p.nome}** - ${p.diretoria} ${progress}`;
  });
  
  if (projects.length > 10) {
    lines.push(`\n... e mais ${projects.length - 10} projetos.`);
  }
  
  return lines.join('\n');
}

function analyzeRisks(projects: Project[]): string {
  const emPlanejamento = projects.filter(p => p.status === 'planejamento');
  const pausados = projects.filter(p => p.status === 'pausado');
  const baixoProgresso = projects.filter(p => p.progresso && p.progresso < 30 && p.status === 'ativo');
  
  const issues: string[] = [];
  
  if (emPlanejamento.length > 5) {
    issues.push(`${emPlanejamento.length} projetos ainda em planejamento - possível gargalo de iniciação`);
  }
  
  if (pausados.length > 0) {
    issues.push(`${pausados.length} projeto(s) pausado(s) que podem precisar de atenção`);
  }
  
  if (baixoProgresso.length > 3) {
    issues.push(`${baixoProgresso.length} projetos com progresso abaixo de 30% - revisar priorização`);
  }
  
  // Análise por diretoria
  const diretorias = [...new Set(projects.map(p => p.diretoria))];
  const diretoriaComMaisAtivos = diretorias
    .map(d => ({ 
      nome: d, 
      count: projects.filter(p => p.diretoria === d && p.status === 'ativo').length 
    }))
    .sort((a, b) => b.count - a.count)[0];
  
  if (diretoriaComMaisAtivos && diretoriaComMaisAtivos.count > 8) {
    issues.push(`Diretoria ${diretoriaComMaisAtivos.nome} com ${diretoriaComMaisAtivos.count} projetos ativos - avaliar capacidade de entrega`);
  }
  
  if (issues.length === 0) {
    return "Nenhum ponto crítico identificado. A operação está estável.";
  }
  
  return issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n');
}

// ============================================
// PROCESSADOR DE INTENÇÕES
// ============================================

export async function processIntent(intent: ParsedIntent, user?: User): Promise<AIResponse> {
  const projects = getProjectsData();
  
  switch (intent.type) {
    case 'greeting': {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
      return {
        text: `${greeting}. Sou a Addvalu, analista operacional do NIE. Posso te ajudar com informações sobre projetos, análises de status ou insights sobre a operação. O que você precisa?`,
        suggestedActions: [
          'Quais projetos estão ativos?',
          'Me dê um resumo geral',
          'Tem algum risco crítico?'
        ]
      };
    }
    
    case 'help': {
      return {
        text: `Eu sou a Addvalu, assistente operacional do Núcleo de Inteligência Estratégica.

**O que posso fazer:**
• Listar projetos por status ou diretoria
• Analisar riscos e gargalos operacionais
• Fornecer resumos executivos do portfólio
• Identificar projetos em atraso ou críticos

**Exemplos de perguntas:**
- "Quais projetos estão ativos?"
- "Como está a diretoria de Garantia?"
- "Tem algo crítico no momento?"
- "Me dê um resumo geral"

Estou conectada aos dados reais do sistema.`,
        suggestedActions: [
          'Listar projetos ativos',
          'Análise de riscos',
          'Resumo executivo'
        ]
      };
    }
    
    case 'list_projects': {
      let filtered = projects;
      
      if (intent.entities.status && intent.entities.status !== 'all') {
        filtered = filtered.filter(p => p.status === intent.entities.status);
      }
      
      if (intent.entities.diretoria) {
        filtered = filtered.filter(p => 
          p.diretoria.toLowerCase().includes(intent.entities.diretoria!.toLowerCase())
        );
      }
      
      const statusLabel = intent.entities.status 
        ? intent.entities.status === 'ativo' ? 'ativos' 
          : intent.entities.status === 'concluido' ? 'concluídos'
          : intent.entities.status === 'planejamento' ? 'em planejamento'
          : intent.entities.status
        : '';
      
      const diretoriaLabel = intent.entities.diretoria 
        ? `da diretoria ${intent.entities.diretoria}` 
        : '';
      
      return {
        text: `**${filtered.length} projetos ${statusLabel} ${diretoriaLabel}**

${formatProjectList(filtered)}`,
        data: { projects: filtered },
        suggestedActions: [
          'Analisar riscos desses projetos',
          'Ver projetos concluídos',
          'Resumo por diretoria'
        ]
      };
    }
    
    case 'executive_summary': {
      const ativos = projects.filter(p => p.status === 'ativo');
      const concluidos = projects.filter(p => p.status === 'concluido');
      const planejamento = projects.filter(p => p.status === 'planejamento');
      const pausados = projects.filter(p => p.status === 'pausado');
      
      const progressoMedio = ativos.length > 0
        ? Math.round(ativos.reduce((acc, p) => acc + (p.progresso || 0), 0) / ativos.length)
        : 0;
      
      // Projetos em destaque
      const destaques = projects.filter(p => p.destaque);
      
      return {
        text: `**Portfólio de Projetos NIE - Resumo Executivo**

**Situação Atual:**
• ${ativos.length} projetos ativos (progresso médio: ${progressoMedio}%)
• ${concluidos.length} projetos concluídos
• ${planejamento.length} em planejamento
• ${pausados.length} pausados

**Projetos em Destaque:**
${destaques.slice(0, 5).map(p => `• ${p.nome} (${p.diretoria})`).join('\n')}

**Recomendação:** ${progressoMedio < 50 ? 'Atenção ao progresso médio abaixo de 50%. Revisar priorização.' : 'Progresso saudável. Manter ritmo de entregas.'}`,
        data: { 
          ativos: ativos.length, 
          concluidos: concluidos.length, 
          planejamento: planejamento.length,
          progressoMedio 
        },
        suggestedActions: [
          'Ver detalhes dos projetos ativos',
          'Identificar riscos',
          'Análise por diretoria'
        ]
      };
    }
    
    case 'risks_issues': {
      return {
        text: `**Análise de Riscos - Portfólio NIE**

${analyzeRisks(projects)}

**Distribuição de Status:**
• Ativos: ${projects.filter(p => p.status === 'ativo').length}
• Concluídos: ${projects.filter(p => p.status === 'concluido').length}
• Planejamento: ${projects.filter(p => p.status === 'planejamento').length}
• Pausados: ${projects.filter(p => p.status === 'pausado').length}

**Ação Sugerida:** Revisar capacidade de entrega e priorizar projetos estratégicos.`,
        suggestedActions: [
          'Ver projetos em planejamento',
          'Listar todos os projetos',
          'Resumo executivo completo'
        ]
      };
    }
    
    case 'filter_by_directorate': {
      if (!intent.entities.diretoria) {
        return {
          text: "Não identifiquei qual diretoria você quer consultar. Pode especificar?",
          suggestedActions: ['Garantia', 'Property', 'RCG', 'NIE']
        };
      }
      
      const filtered = projects.filter(p => 
        p.diretoria.toLowerCase().includes(intent.entities.diretoria!.toLowerCase())
      );
      
      const ativos = filtered.filter(p => p.status === 'ativo');
      const concluidos = filtered.filter(p => p.status === 'concluido');
      
      return {
        text: `**Diretoria ${intent.entities.diretoria} - ${filtered.length} projetos**

**Ativos (${ativos.length}):**
${ativos.slice(0, 5).map(p => `• ${p.nome} (${p.progresso || 0}%)`).join('\n')}${ativos.length > 5 ? '\n...' : ''}

**Concluídos (${concluidos.length}):**
${concluidos.slice(0, 3).map(p => `• ${p.nome}`).join('\n')}${concluidos.length > 3 ? '\n...' : ''}

**Responsáveis principais:** ${[...new Set(filtered.map(p => p.responsavel))].slice(0, 3).join(', ')}`,
        data: { projects: filtered },
        suggestedActions: [
          'Analisar riscos desta diretoria',
          'Comparar com outras diretorias',
          'Ver projetos concluídos'
        ]
      };
    }
    
    case 'unknown': {
      return {
        text: "Não entendi bem o que você precisa. Posso ajudar com:\n\n• Listar projetos por status ou diretoria\n• Análise de riscos e gargalos\n• Resumo executivo do portfólio\n• Status de projetos específicos\n\nO que gostaria de saber?",
        suggestedActions: [
          'Listar projetos ativos',
          'Resumo geral',
          'Análise de riscos'
        ]
      };
    }
    
    default: {
      return {
        text: "Estou processando sua solicitação. Pode ser mais específico sobre o que precisa? Posso listar projetos, analisar riscos ou gerar resumos executivos.",
        suggestedActions: [
          'Ajuda',
          'Listar projetos',
          'Resumo executivo'
        ]
      };
    }
  }
}

// ============================================
// SERVIÇO PRINCIPAL
// ============================================

class AddvaluIntelligence {
  private static instance: AddvaluIntelligence;
  
  private constructor() {}
  
  public static getInstance(): AddvaluIntelligence {
    if (!AddvaluIntelligence.instance) {
      AddvaluIntelligence.instance = new AddvaluIntelligence();
    }
    return AddvaluIntelligence.instance;
  }
  
  public async processMessage(message: string, user?: User): Promise<AIResponse> {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const intent = parseIntent(message);
    return processIntent(intent, user);
  }
}

export const addvaluAI = AddvaluIntelligence.getInstance();
