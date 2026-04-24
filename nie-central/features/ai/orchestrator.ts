import { Project, User } from '@/types';
import { MOCK_PROJECTS } from '@/lib/mock-data';
import { 
  AddvaluContext, 
  ConversationMemory, 
  OperationalEvent, 
  filterAIContextByUserAccess,
} from './types';
import { routeQuestionToTool, AddvaluTool } from '@/lib/addvalu/tools/toolRouter';
import * as projectTools from '@/lib/addvalu/tools/projectTools';
import * as panelTools from '@/lib/addvalu/tools/panelTools';
import * as analyticsTools from '@/lib/addvalu/tools/analyticsTools';

// ============================================
// SYSTEM PROMPT EXECUTIVO
// ============================================

export const ADDVALU_SYSTEM_PROMPT = `Você é a Addvalu, copiloto operacional do NIE (Núcleo de Inteligência Estratégica).

SUA FUNÇÃO:
Atuar como uma ferramenta de consulta direta e execução. Priorize fatos, status e dados estruturados sobre qualquer narrativa.

REGRAS ABSOLUTAS:
1. TOOL FIRST: Sua primeira reação deve ser buscar dados.
2. RESPOSTA DIRETA: Comece imediatamente com a informação solicitada.
3. SEM PERSONA: Não use saudações longas, apresentações ou frases de preenchimento.
4. PROIBIDO COMPLETAMENTE:
   - "Recebi sua solicitação..."
   - "Como sou uma IA formatadora..."
   - "Estou à disposição para detalhar..."
   - "Posso aprofundar..."
   - "Sob sua responsabilidade..."
   - "Entendi o que você precisa..."
5. FALLBACK MÍNIMO: Se não encontrar o dado, diga apenas: "Não localizei essa referência nos projetos ou painéis disponíveis. Pode me dizer se você quer consultar um projeto, painel ou análise?"

ESTILO:
- Técnico, seco e preciso.
- Formato de dashboard (bullets e negrito).
- Foco em: Status, Responsável, Próximos Passos.`;

// ============================================
// ORQUESTRADOR DE CONVERSA (AGENTE COM TOOLS)
// ============================================

class AddvaluOrchestrator {
  private static instance: AddvaluOrchestrator;
  private memory: ConversationMemory = { contextStack: [] };
  private events: OperationalEvent[] = [];

  private constructor() {}

  public static getInstance(): AddvaluOrchestrator {
    if (!AddvaluOrchestrator.instance) {
      AddvaluOrchestrator.instance = new AddvaluOrchestrator();
      
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
            AddvaluOrchestrator.instance.memory.contextStack = [];
            AddvaluOrchestrator.instance.memory.lastIntent = undefined;
          }
        });
      }
    }
    return AddvaluOrchestrator.instance;
  }

  /**
   * Entity Resolver - Localiza projetos ou painéis citados na pergunta
   */
  private resolveEntityMention(question: string, projects: Project[]): Project | null {
    const q = question.toLowerCase().trim();
    
    // Busca exata ou parcial por nome de projeto
    const project = projects.find(p => 
      q.includes(p.nome.toLowerCase()) || 
      p.nome.toLowerCase().includes(q)
    );

    return project || null;
  }

  // Executa a ferramenta correta baseada na intenção
  private async executeTool(tool: AddvaluTool, user: User, question: string): Promise<any> {
    const projects = MOCK_PROJECTS;

    // 1. Entity Resolution Primeiro (Prioridade Máxima)
    const resolvedEntity = this.resolveEntityMention(question, projects);
    if (resolvedEntity) {
      return projectTools.getProjectDetails(projects, user, resolvedEntity.id);
    }

    switch (tool) {
      case 'getCompletedProjects':
        return projectTools.getCompletedProjects(projects, user);
      case 'getActiveProjects':
        return projectTools.getActiveProjects(projects, user);
      case 'getPlanningProjects':
        return projectTools.getPlanningProjects(projects, user);
      case 'getDelayedProjects':
        return projectTools.getDelayedProjects(projects, user);
      case 'getCriticalProjects':
        return projectTools.getCriticalProjects(projects, user);
      case 'getProjectsByDirectorate':
        const authorizedDir = filterAIContextByUserAccess(projects, user);
        return analyticsTools.groupProjectsByDirectorate(authorizedDir);
      case 'getProjectsByOwner':
        const authorizedOwner = filterAIContextByUserAccess(projects, user);
        return analyticsTools.groupProjectsByOwner(authorizedOwner);
      case 'getPanels':
        return panelTools.getPanels(projects, user);
      case 'getExecutiveSummary':
        const authorizedSum = filterAIContextByUserAccess(projects, user);
        return analyticsTools.getExecutiveSummary(authorizedSum);
      case 'summarizeRisks':
        return projectTools.getCriticalProjects(projects, user);
      default:
        return null;
    }
  }

  public registerEvent(event: Omit<OperationalEvent, 'eventId' | 'createdAt'>) {
    const newEvent: OperationalEvent = {
      ...event,
      eventId: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString()
    };
    this.events.unshift(newEvent);
    if (this.events.length > 50) this.events.pop();
  }

  public async buildContext(question: string, user: User): Promise<AddvaluContext> {
    // 1. Route to Tool
    const tool = routeQuestionToTool(question, this.memory);
    
    // 2. Execute Tool (Dados Reais)
    const toolResult = await this.executeTool(tool, user, question);

    // 3. Build Context
    const context: AddvaluContext = {
      question,
      intent: tool,
      toolUsed: tool,
      toolResult: toolResult,
      memory: this.memory,
      events: this.events.slice(0, 5)
    };

    // 4. Update Memory
    this.memory = {
      ...this.memory,
      lastQuestion: question,
      lastIntent: tool,
      contextStack: [...this.memory.contextStack.slice(-4), tool]
    };

    return context;
  }

  /**
   * Gera a resposta final formatada baseada no contexto e dados reais
   */
  public async generateResponse(context: AddvaluContext, user: User): Promise<string> {
    const { intent, toolResult, question } = context;
    const q = question.toLowerCase();

    // Casos Básicos: Saudações
    if (q === 'olá' || q === 'oi' || q.startsWith('bom dia') || q.startsWith('boa tarde')) {
      return "Olá! Posso ajudar com projetos, painéis, riscos ou prioridades do NIE.";
    }

    // Se a ferramenta retornou um projeto específico (Entity Resolution)
    if (toolResult?.tool === 'getProjectDetails' && toolResult.item) {
      const p = toolResult.item;
      return `### ${p.nome}
**Status:** ${p.status.toUpperCase()}
**Diretoria:** ${p.diretoria}
**Responsável:** ${p.responsavel || 'Não definido'}

${p.descricao ? `**Descrição:** ${p.descricao}` : ''}
${p.link ? `**Link:** [Acessar Projeto](${p.link})` : ''}`;
    }

    // Listagem de Projetos
    if (['getCompletedProjects', 'getActiveProjects', 'getPlanningProjects', 'getCriticalProjects'].includes(intent)) {
      if (!toolResult || toolResult.count === 0) {
        return `Não localizei projetos com esse status no seu escopo atual.`;
      }
      return `### Projetos ${intent.replace('get', '').replace('Projects', '')} (${toolResult.count})
${toolResult.items.map((p: any) => `- **${p.name}** [${p.status}] - ${p.directorate}`).join('\n')}`;
    }

    // Painéis
    if (intent === 'getPanels') {
      if (!toolResult || toolResult.count === 0) {
        return "Não há painéis disponíveis para seu nível de acesso.";
      }
      return `### Painéis Disponíveis (${toolResult.count})
${toolResult.items.map((p: any) => `- **${p.name}** - [Abrir](${p.link})`).join('\n')}`;
    }

    // Resumo Executivo
    if (intent === 'getExecutiveSummary' && toolResult) {
      return `### Panorama Executivo NIE
Atualmente temos **${toolResult.active} projetos ativos** e **${toolResult.completed} concluídos**.

**Destaques:**
- Total de Projetos: ${toolResult.total}
- Aguardando Início: ${toolResult.planning}
- Pontos de Atenção: ${toolResult.critical || 0}`;
    }

    // Agrupamento por Diretoria
    if (intent === 'getProjectsByDirectorate' && toolResult) {
      const entries = Object.entries(toolResult);
      if (entries.length === 0) return "Não há dados agrupados por diretoria no momento.";
      
      return `### Projetos por Diretoria
${entries.map(([dir, projs]: [string, any]) => `- **${dir}**: ${projs.length} projetos`).join('\n')}`;
    }

    // Fallback Natural
    return "Não encontrei essa referência nos projetos ou painéis disponíveis. Pode me dizer se você quer consultar um projeto, painel ou análise?";
  }
}

export const orchestrator = AddvaluOrchestrator.getInstance();
