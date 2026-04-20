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

    // Respostas informais e saudações
    const informalGreetings = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'blz', 'beleza', 'tudo bem', 'hey'];
    const confirmations = ['ok', 'entendi', 'vlw', 'valeu', 'obrigado', 'obrigada', 'show', 'top', 'kkk', 'rsrs'];
    
    if (informalGreetings.some(g => lowerPrompt.includes(g) && prompt.length < 15)) {
      response = `Olá! Sou a Addvalu. Como posso ajudar você hoje no ${context.pageName}?`;
    }
    else if (confirmations.some(c => lowerPrompt.includes(c) && prompt.length < 10)) {
      response = "Disponha! Estou aqui se precisar de qualquer outra análise ou ajuda com o sistema.";
    }
    else if (lowerPrompt.includes('quem é você') || lowerPrompt.includes('o que você faz')) {
      response = "Eu sou a Addvalu, sua assistente inteligente na Central de Projetos NIE. Posso ajudar você a interpretar indicadores, gerar relatórios automáticos da sua diretoria e orientar sua navegação.";
    }
    else if (lowerPrompt.includes('relatório') || lowerPrompt.includes('gerar') || lowerPrompt.includes('resumo')) {
      if (context.userProfile === 'usuario') {
        response = "Desculpe, mas seu perfil de acesso não permite a geração de relatórios administrativos. Por favor, entre em contato com seu gestor.";
      } else {
        const scope = context.userDiretoria || 'Geral';
        response = `Com base nos dados atuais do painel, gerei um resumo executivo para a diretoria ${scope}: Temos 12 projetos ativos, com 85% de progresso médio. Identifiquei 2 pontos de atenção em atraso técnico. Gostaria que eu detalhasse os riscos desses projetos?`;
      }
    }
    else if (lowerPrompt.includes('atenção') || lowerPrompt.includes('atraso') || lowerPrompt.includes('risco')) {
      response = "Analisando o contexto: O projeto 'Painel de Controle de Prazos' apresenta um leve desvio no cronograma da fase 3. Recomendo revisar a alocação da equipe técnica. Deseja que eu envie um alerta para o coordenador responsável?";
    }
    else if (lowerPrompt.includes('ajuda') || lowerPrompt.includes('não entendi') || lowerPrompt.includes('explica melhor')) {
      response = `Claro! Atualmente você está em ${context.pageName}. Como ${context.userProfile}, você pode ver os dados da diretoria ${context.userDiretoria || 'Geral'}. O que especificamente você gostaria que eu detalhasse? Posso falar sobre indicadores, projetos ou permissões.`;
    }
    else if (context.pageName.includes('Painel') || context.pageName.includes('Dashboard')) {
      response = `Como assistente Addvalu, analisei os dados do seu Painel. Atualmente, a diretoria ${context.userDiretoria || 'Geral'} apresenta indicadores estáveis. Notei que você aplicou alguns filtros recentemente; deseja que eu faça uma projeção de entrega com base neles?`;
    }
    else {
      response = "Entendi sua mensagem. Como assistente inteligente, estou monitorando os dados em tempo real. Sua solicitação foi registrada e posso ajudar com análises mais profundas se você desejar. O que mais podemos fazer hoje?";
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
