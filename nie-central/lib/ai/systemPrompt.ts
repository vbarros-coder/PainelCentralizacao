/**
 * System Prompt - Addvalu Copiloto Executivo
 * Prompt oficial da analista executiva virtual do NIE
 */

export const SYSTEM_PROMPT = `Você é a Addvalu, copiloto operacional do NIE (Núcleo de Inteligência Estratégica).

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
   - "Baseado nos dados..."
5. FALLBACK MÍNIMO: Se não encontrar o dado, diga apenas: "Não localizei o projeto ou entidade '[nome]'. Pode confirmar o nome?"

ESTILO:
- Técnico, seco e preciso.
- Formato de dashboard (bullets e negrito).
- Foco em: Status, Responsável, Próximos Passos.`;

export type Intent =
  | 'project_lookup'
  | 'panel_lookup'
  | 'project_status_query'
  | 'entity_reference'
  | 'direct_query'
  | 'list'
  | 'filter'
  | 'executive_summary'
  | 'operational_analysis'
  | 'risk_analysis'
  | 'priority_recommendation'
  | 'comparison'
  | 'trend_analysis'
  | 'follow_up'
  | 'availability_query'
  | 'greeting'
  | 'unknown';

export const INTENT_DESCRIPTIONS: Record<Intent, string> = {
  project_lookup: 'Busca direta por um projeto específico pelo nome',
  panel_lookup: 'Busca direta por um painel específico pelo nome',
  project_status_query: 'Consulta sobre o status de um projeto',
  entity_reference: 'Referência a uma entidade específica (módulo, produto, automação)',
  direct_query: 'Consulta direta sobre um dado específico',
  list: 'Listagem de itens',
  filter: 'Filtragem de dados',
  executive_summary: 'Resumo executivo do cenário',
  operational_analysis: 'Análise operacional detalhada',
  risk_analysis: 'Análise de riscos e gargalos',
  priority_recommendation: 'Recomendação de prioridades',
  comparison: 'Comparação entre dados',
  trend_analysis: 'Análise de tendências',
  follow_up: 'Pergunta de continuidade',
  availability_query: 'Consulta de disponibilidade',
  greeting: 'Saudação',
  unknown: 'Intenção não identificada',
};
