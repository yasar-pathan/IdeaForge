/** DB `module_status` boolean columns (13). */
export const MODULE_STATUS_KEYS = [
  'pitch_speech',
  'market_research',
  'competitor_intelligence',
  'success_probability',
  'feature_recommendations',
  'domain_suggestions',
  'roast_analysis',
  'validation_checklist',
  'monetization_strategies',
  'team_structure',
  'budget_breakdown',
  'ui_flow',
  'ppt_slides',
] as const;

export type ModuleStatusKey = (typeof MODULE_STATUS_KEYS)[number];

export const MODULE_ORDER = [
  { key: 'success_probability', label: 'Success Score', icon: '🎯', sectionId: 'success' },
  { key: 'pitch_speech', label: 'Pitch Speech', icon: '🎤', sectionId: 'pitch' },
  { key: 'market_research', label: 'Market Research', icon: '📊', sectionId: 'market' },
  { key: 'competitor_intelligence', label: 'Competitors', icon: '🔍', sectionId: 'competitors' },
  { key: 'feature_recommendations', label: 'Feature Roadmap', icon: '🛠', sectionId: 'features' },
  { key: 'domain_suggestions', label: 'Domain Names', icon: '🌐', sectionId: 'domains' },
  { key: 'roast_analysis', label: 'Roast Mode', icon: '🔥', sectionId: 'roast' },
  { key: 'validation_checklist', label: 'Checklist', icon: '✅', sectionId: 'checklist' },
  { key: 'monetization_strategies', label: 'Monetization', icon: '💰', sectionId: 'monetization' },
  { key: 'team_structure', label: 'Team', icon: '👥', sectionId: 'team' },
  { key: 'budget_breakdown', label: 'Budget', icon: '💸', sectionId: 'budget' },
  { key: 'ui_flow', label: 'UI Flow', icon: '🗺', sectionId: 'uiflow' },
] as const;

export const ANALYZE_MODULE_CHIPS: { key: string; label: string }[] = [
  ...MODULE_ORDER.map(({ key, label }) => ({ key, label })),
  { key: 'ppt_slides', label: 'Pitch Deck' },
];

/** On-demand workspace: one row per generate button (order shown on /workspace/[id]). */
export const WORKSPACE_MODULE_ROWS: { id: string; label: string; hint: string }[] = [
  {
    id: 'idea_title',
    label: 'Name & category',
    hint: 'Short title and category (shown on your dashboard).',
  },
  ...MODULE_ORDER.map((m) => ({
    id: m.key,
    label: m.label,
    hint: `Generate ${m.label} for your idea.`,
  })),
  {
    id: 'ppt_slides',
    label: 'Pitch deck (PPT)',
    hint: 'Slide outline for download; richer if pitch speech exists.',
  },
];

/** Fragment for `/results/[id]#…` so workspace links scroll to the right module card. */
export function resultsHashForWorkspaceModule(moduleId: string): string {
  if (moduleId === 'idea_title' || moduleId === 'ppt_slides') return '';
  const row = MODULE_ORDER.find((m) => m.key === moduleId);
  return row ? `#${row.sectionId}` : '';
}
