/**
 * Addvalu AI Service
 * Camada de integração com o modelo de IA e gerenciamento de contexto
 */

import { Message, AIContext, ADDVALU_SYSTEM_PROMPT } from './types';
import { generateId } from '@/lib/utils';

class AddvaluService {
  private static instance: AddvaluService;
  private history: Message[] = [];

  private constructor() {}

  public static getInstance(): AddvaluService {
    if (!AddvaluService.instance) {
      AddvaluService.instance = new AddvaluService();
    }
    return AddvaluService.instance;
  }

  /**
   * Simula o processamento da IA localmente ou via API
   * Para esta implementação, usaremos um motor de regras inteligente + simulador de LLM
   */
  public async getResponse(prompt: string, context: AIContext): Promise<string> {
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };
    this.history.push(userMessage);

    // Lógica de resposta contextual baseada na página e dados
    let response = "";

    // 1. Identificar intenção e contexto
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('quem é você') || lowerPrompt.includes('o que você faz')) {
      response = "Eu sou a Addvalu, sua assistente inteligente na Central de Projetos NIE. Posso ajudar você a interpretar os indicadores desta tela, orientar sua navegação e tirar dúvidas sobre os processos da Addvalora.";
    } 
    else if (lowerPrompt.includes('ajuda') || lowerPrompt.includes('navegação') || lowerPrompt.includes('como usar')) {
      response = `Atualmente você está na página de ${context.pageName}. Nesta área você pode visualizar os principais indicadores operacionais. O menu lateral permite acessar Projetos, Equipe e Relatórios. Como posso auxiliar em sua tarefa específica agora?`;
    }
    else if (context.pageName.includes('Painel') || context.pageName.includes('Dashboard')) {
      if (lowerPrompt.includes('indicador') || lowerPrompt.includes('card') || lowerPrompt.includes('número')) {
        response = "Os indicadores no topo mostram o volume de projetos ativos, em destaque e seus status. Por exemplo, os cards de destaque indicam projetos que requerem atenção prioritária da diretoria.";
      } else if (lowerPrompt.includes('atraso') || lowerPrompt.includes('alerta')) {
        response = "Indicadores em atraso referem-se a projetos que ultrapassaram o SLA acordado ou a data final planejada. O status de alerta é ativado quando o progresso está abaixo do esperado para o cronograma atual.";
      } else {
        response = `Com base no contexto do ${context.pageName}, posso analisar os projetos visíveis para você. Como seu perfil é de ${context.userProfile}, você tem acesso aos dados da diretoria ${context.userDiretoria || 'Geral'}.`;
      }
    }
    else if (context.pageName.includes('Usuários') || context.pageName.includes('Administração')) {
       response = "Esta é a área de gestão de acessos. Aqui os administradores podem aprovar novos cadastros e definir perfis de permissão (RBAC). Novos usuários aparecem com um destaque roxo até serem revisados.";
    }
    else {
      response = "Entendi sua solicitação. Como assistente Addvalu, analisei os dados presentes nesta tela e posso confirmar que as informações seguem os padrões operacionais da Addvalora. Precisa de uma explicação técnica sobre algum ponto específico?";
    }

    // Adicionar ao histórico
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: response,
      timestamp: Date.now()
    };
    this.history.push(assistantMessage);

    return response;
  }

  public getHistory(): Message[] {
    return this.history;
  }

  public clearHistory(): void {
    this.history = [];
  }
}

export const aiService = AddvaluService.getInstance();
