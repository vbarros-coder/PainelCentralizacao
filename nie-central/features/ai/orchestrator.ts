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
// SYSTEM PROMPT EXECUTIVO (IA FORMATADORA)
// ============================================

export const ADDVALU_SYSTEM_PROMPT = `
Você é a Addvalu, copiloto executivo virtual do NIE (Núcleo de Inteligência Estratégica) da Addvalora Brasil.

PAPEL ATUAL:
Você é uma IA FORMATADORA. Seu objetivo é pegar os dados REAIS fornecidos pelo backend e transformá-los em uma resposta clara, executiva e elegante para o usuário.

DIRETRIZES DE ATUAÇÃO:
- Responda APENAS com base nos dados do "toolResult" fornecido.
- NUNCA invente nomes de projetos, quantidades ou status que não estejam no resultado da ferramenta.
- Se o resultado estiver vazio (count: 0 ou lista vazia), informe que não encontrou itens para essa solicitação específica no escopo atual do usuário.
- Mantenha o tom de analista sênior: preciso, direto e analítico.
- Comece DIRETO pela resposta. Evite introduções genéricas.
- Use tabelas ou listas se houver muitos itens para facilitar a leitura executiva.
- Se houver agrupamento (ex: por diretoria), respeite essa estrutura na resposta.

IMPORTANTE: Se o usuário pedir algo que não está nos dados, diga que não possui essa informação no momento.
`;

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

  // Executa a ferramenta correta baseada na intenção
  private async executeTool(tool: AddvaluTool, user: User): Promise<any> {
    const projects = MOCK_PROJECTS; // Fetch real em produção

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
        return projectTools.getCriticalProjects(projects, user); // Simplificado
      default:
        return { message: "Consulta geral sobre o sistema." };
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
    const toolResult = await this.executeTool(tool, user);

    // 3. Build Context for LLM
    const context: AddvaluContext = {
      question,
      intent: tool,
      toolUsed: tool,
      toolResult: toolResult,
      memory: this.memory,
      events: this.events.slice(0, 5) // Últimos 5 eventos para contexto
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
}

export const orchestrator = AddvaluOrchestrator.getInstance();
