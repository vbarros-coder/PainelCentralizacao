/**
 * Conversation Memory
 * Gerencia a memória curta da conversa atual
 */

export interface ConversationMemory {
  lastTopic?: string | null;
  lastDirectorate?: string | null;
  lastIntent?: string | null;
  lastQuestion?: string | null;
  lastResponseType?: 'executive' | 'operational' | null;
  contextStack: string[];
}

export function createEmptyMemory(): ConversationMemory {
  return {
    lastTopic: null,
    lastDirectorate: null,
    lastIntent: null,
    lastQuestion: null,
    lastResponseType: null,
    contextStack: [],
  };
}

export function updateConversationMemory(
  memory: ConversationMemory,
  question: string,
  intent: string
): ConversationMemory {
  const lower = question.toLowerCase();

  // Detectar diretoria mencionada
  let lastDirectorate = memory.lastDirectorate;
  
  const directorates = [
    { key: 'garantia', name: 'Garantia / Fiança / Riscos' },
    { key: 'property', name: 'Property / Construção' },
    { key: 'transportes', name: 'Property / Transportes / Mecânica / Elétrica' },
    { key: 'rcg', name: 'Responsabilidade Civil Geral (RCG)' },
    { key: 'rcp', name: 'Responsabilidade Civil Profissional (RCP)' },
    { key: 'nie', name: 'Núcleo de Inteligência Estratégica' },
    { key: 'coo', name: 'COO - Addvalora Brasil' },
    { key: 'ceo', name: 'CEO - Addvalora Brasil' },
    { key: 'cfo', name: 'CFO - Addvalora Brasil' },
  ];

  for (const dir of directorates) {
    if (lower.includes(dir.key)) {
      lastDirectorate = dir.name;
      break;
    }
  }

  // Detectar tipo de resposta
  const lastResponseType = ['executive_summary', 'risk_analysis', 'priority_recommendation'].includes(intent)
    ? 'executive'
    : ['list', 'filter', 'operational_analysis'].includes(intent)
    ? 'operational'
    : memory.lastResponseType;

  // Atualizar context stack (manter últimos 3 contextos)
  const contextStack = [...memory.contextStack];
  if (intent !== 'greeting' && intent !== 'unknown') {
    contextStack.unshift(intent);
    if (contextStack.length > 3) {
      contextStack.pop();
    }
  }

  return {
    lastTopic: question,
    lastDirectorate,
    lastIntent: intent,
    lastQuestion: question,
    lastResponseType,
    contextStack,
  };
}

/**
 * Enriquece a pergunta com contexto da memória
 */
export function enrichQuestionWithMemory(
  question: string,
  memory: ConversationMemory
): string {
  // Se for follow-up e tiver diretoria anterior
  if (memory.lastIntent === 'follow_up' && memory.lastDirectorate) {
    const lower = question.toLowerCase();
    
    // Se a pergunta não especificar diretoria, adicionar contexto
    if (!directorateMentioned(lower)) {
      return `${question} (na diretoria ${memory.lastDirectorate})`;
    }
  }

  return question;
}

function directorateMentioned(text: string): boolean {
  const directorates = ['garantia', 'property', 'transportes', 'rcg', 'rcp', 'nie', 'coo', 'ceo', 'cfo'];
  return directorates.some(d => text.includes(d));
}
