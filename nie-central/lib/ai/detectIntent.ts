/**
 * Detect Intent
 * Detecta a intenção da pergunta do usuário
 */

import { Intent } from './systemPrompt';

export function detectIntent(question: string): Intent {
  const q = question.toLowerCase().trim();

  // 1. Prioridade Máxima: Entity & Project Lookup (TOOL FIRST)
  // Se o usuário pergunta por um nome específico que parece ser um projeto ou painel
  if (q.length > 3 && !q.includes(' ') || /(projeto|painel|automação|módulo|produto)/i.test(q)) {
    if (/(status|situação|como está|andamento)/i.test(q)) {
      return 'project_status_query';
    }
    if (/(painel|dashboard|visão)/i.test(q)) {
      return 'panel_lookup';
    }
    return 'project_lookup';
  }

  // 2. Explicit Tool Intents
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

  // 3. Analytical Intents
  // Comparação
  if (/(compare|comparar|comparação|versus|vs)/i.test(q)) {
    return 'comparison';
  }

  // Tendências
  if (/(tendência|evolução|como está indo|andamento)/i.test(q)) {
    return 'trend_analysis';
  }

  // Resumo executivo
  if (/(como está a operação|panorama|resumo geral|visão geral|situação atual|executivo)/i.test(q)) {
    return 'executive_summary';
  }

  // 4. Follow-up & Navigation
  // Follow-up
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

  // Saudações (Prioridade baixa para evitar capturar nomes de projetos como saudações)
  if (/^(oi|olá|ola|bom dia|boa tarde|boa noite|hey|e aí|tudo bem)$/i.test(q)) {
    return 'greeting';
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
