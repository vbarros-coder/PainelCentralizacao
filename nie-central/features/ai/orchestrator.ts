import { Project, User } from '@/types';
import { MOCK_PROJECTS, MOCK_USERS } from '@/lib/mock-data';
import { 
  AddvaluContext, 
  ConversationMemory, 
  OperationalEvent, 
  filterAIContextByUserAccess,
  buildExecutiveSummary,
  generateOperationalInsights,
  groupProjectsByDirectorate
} from './types';

// ============================================
// SYSTEM PROMPT EXECUTIVO
// ============================================

export const ADDVALU_SYSTEM_PROMPT = `
Você é a Addvalu, copiloto executivo virtual do NIE (Núcleo de Inteligência Estratégica) da Addvalora Brasil.

DIRETRIZES DE ATUAÇÃO:
- Responda sempre com base no contexto técnico e operacional fornecido.
- NUNCA invente dados. Se não houver informação no contexto, informe que não possui o dado no momento.
- Comece DIRETO pela resposta. Evite frases genéricas como "Entendi sua solicitação" ou "Como assistente inteligente".
- Identifique riscos e prioridades proativamente.
- Use um tom de analista executivo sênior: preciso, direto e analítico.
- Reflita mudanças em tempo real baseadas nos eventos operacionais recentes.

ESTRUTURA DE RESPOSTA (Sempre que aplicável):
1. Resumo Direto (O que foi pedido)
2. Atenções/Riscos (O que o executivo precisa saber agora)
3. Insights Operacionais (Análise de carga, gargalos ou progresso)
4. Próximos Passos Sugeridos
`;

// ============================================
// ORQUESTRADOR DE CONVERSA
// ============================================

class AddvaluOrchestrator {
  private static instance: AddvaluOrchestrator;
  private memory: ConversationMemory = { contextStack: [] };
  private events: OperationalEvent[] = [];

  private constructor() {}

  public static getInstance(): AddvaluOrchestrator {
    if (!AddvaluOrchestrator.instance) {
      AddvaluOrchestrator.instance = new AddvaluOrchestrator();
      
      // Escutar eventos de alteração de permissão para invalidar memória/contexto
      if (typeof window !== 'undefined') {
        window.addEventListener('addvalu-operational-event', (e: any) => {
          const { type, userId } = e.detail;
          if (type === 'PERMISSION_CHANGE') {
            AddvaluOrchestrator.instance.registerEvent({
              eventType: 'status_change',
              entityType: 'user',
              entityId: userId,
              after: 'Permissions Updated',
              changedBy: 'SYSTEM',
              severity: 'medium'
            });
            // Limpa a memória de contexto para forçar releitura dos dados
            AddvaluOrchestrator.instance.memory.contextStack = [];
          }
        });
      }
    }
    return AddvaluOrchestrator.instance;
  }

  // Detecta intenção e resolve follow-ups
  private resolveIntent(message: string): string {
    const msg = message.toLowerCase();
    
    // Lógica de Follow-up (Herança de contexto)
    if (this.memory.lastIntent) {
      if (msg.includes('por diretoria') || msg.includes('e por diretoria')) return 'group_by_directorate';
      if (msg.includes('quem são os responsáveis') || msg.includes('e os responsáveis')) return 'list_owners';
      if (msg.includes('quais são os críticos') || msg.includes('e os críticos')) return 'list_critical';
      if (msg.includes('mais detalhes') || msg.includes('detalhe melhor')) return 'deep_dive';
    }

    // Intenções Primárias
    if (msg.includes('resumo') || msg.includes('panorama')) return 'executive_summary';
    if (msg.includes('risco') || msg.includes('problema') || msg.includes('atraso')) return 'risk_analysis';
    if (msg.includes('projeto') || msg.includes('quais são')) return 'list_projects';
    
    return 'general_query';
  }

  // Registra eventos operacionais em tempo real
  public registerEvent(event: Omit<OperationalEvent, 'eventId' | 'createdAt'>) {
    const newEvent: OperationalEvent = {
      ...event,
      eventId: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
    this.events.unshift(newEvent); // Adiciona no início (mais recente)
    if (this.events.length > 50) this.events.pop(); // Mantém últimos 50
  }

  // Constrói o contexto estruturado para o modelo de IA
  public async buildContext(question: string, user: User): Promise<AddvaluContext> {
    const intent = this.resolveIntent(question);
    
    // 1. Data Layer + Permission Layer
    const rawProjects = MOCK_PROJECTS; // Em produção: fetch real
    const authorizedProjects = filterAIContextByUserAccess(rawProjects, user);

    // 2. Intelligence Layer
    const summary = buildExecutiveSummary(authorizedProjects);
    const insights = generateOperationalInsights(authorizedProjects);
    
    // 3. Operational Memory (Eventos recentes que impactam a resposta)
    const recentEvents = this.events.filter(e => {
      const eventDate = new Date(e.createdAt);
      const now = new Date();
      return (now.getTime() - eventDate.getTime()) < 24 * 60 * 60 * 1000; // Últimas 24h
    });

    const context: AddvaluContext = {
      question,
      intent,
      summary,
      projects: authorizedProjects,
      insights,
      alerts: this.generateAlerts(authorizedProjects),
      memory: this.memory,
      events: recentEvents
    };

    // Atualiza memória curta
    this.memory = {
      ...this.memory,
      lastQuestion: question,
      lastIntent: intent,
      contextStack: [...this.memory.contextStack.slice(-4), intent]
    };

    return context;
  }

  private generateAlerts(projects: Project[]): string[] {
    const alerts: string[] = [];
    const delayed = projects.filter(p => p.status === 'ativo' && (p.progresso || 0) < 20);
    
    if (delayed.length > 0) {
      alerts.push(`${delayed.length} projetos com progresso crítico (abaixo de 20%)`);
    }
    
    return alerts;
  }
}

export const orchestrator = AddvaluOrchestrator.getInstance();
