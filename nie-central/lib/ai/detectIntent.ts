/**
 * Detect Intent
 * Detecta a intenção da pergunta do usuário
 */

import { Intent } from './systemPrompt';

export function detectIntent(question: string): Intent {
  const q = question.toLowerCase().trim();

  // Saudações
  if (/^(oi|olá|ola|bom dia|boa tarde|boa noite|hey|e aí|tudo bem|oi addvalu)/i.test(q)) {
    return 'greeting';
  }

  // Disponibilidade de usuários
  if (/(quem está disponível|quem está online|quem está ocupado|presença|status da equipe)/i.test(q)) {
    return 'availability_query';
  }

  // Prioridades
  if (/(o que devo priorizar|por onde devo começar|qual a prioridade|o que fazer primeiro)/i.test(q)) {
    return 'priority_recommendation';
  }

  // Riscos e gargalos
  if (/(maior gargalo|maior risco|tem algo crítico|problemas|dificuldades|o que está ruim)/i.test(q)) {
    return 'risk_analysis';
  }

  // Comparação
  if (/(compare|comparar|comparação|versus|vs)/i.test(q)) {
    return 'comparison';
  }

  // Tendências
  if (/(tendência|evolução|como está indo|progresso|andamento)/i.test(q)) {
    return 'trend_analysis';
  }

  // Resumo executivo
  if (/(como está a operação|panorama|resumo geral|visão geral|situação atual|executivo)/i.test(q)) {
    return 'executive_summary';
  }

  // Follow-up (perguntas curtas começando com "e" ou referências a contexto anterior)
  if (/^(e |e em |e o |e a |qual |quais |como |onde )/i.test(q) && q.length < 50) {
    return 'follow_up';
  }

  // Listagem
  if (/(quais|liste|listar|mostrar|mostre|quais são).*(projetos|tarefas|itens)/i.test(q)) {
    return 'list';
  }

  // Filtro
  if (/(filtrar|filtro|somente|apenas|somente os|mostrar só)/i.test(q)) {
    return 'filter';
  }

  // Análise operacional (padrão para perguntas sobre projetos específicos)
  if (/(projeto|status|situação|detalhes|informações sobre)/i.test(q)) {
    return 'operational_analysis';
  }

  return 'unknown';
}

/**
 * Detecta se a pergunta é de modo executivo ou operacional
 */
export function detectResponseMode(intent: Intent): 'executive' | 'operational' {
  const executiveIntents: Intent[] = [
    'executive_summary',
    'risk_analysis',
    'priority_recommendation',
    'comparison',
    'trend_analysis',
  ];

  return executiveIntents.includes(intent) ? 'executive' : 'operational';
}
