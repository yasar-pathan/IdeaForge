import { supabaseAdmin } from '@/lib/supabase/server';
import { generateWithFlash, generateWithPro } from '@/lib/gemini/client';
import { PROMPTS } from '@/lib/gemini/prompts';
import { MODULE_STATUS_KEYS, type ModuleStatusKey } from '@/lib/modules';

export { MODULE_STATUS_KEYS, type ModuleStatusKey };

export const WORKSPACE_MODULE_IDS = ['idea_title', ...MODULE_STATUS_KEYS] as const;
export type WorkspaceModuleId = (typeof WORKSPACE_MODULE_IDS)[number];

const isModuleStatusKey = (k: string): k is ModuleStatusKey =>
  (MODULE_STATUS_KEYS as readonly string[]).includes(k as ModuleStatusKey);

export function isWorkspaceModuleId(id: string): id is WorkspaceModuleId {
  return (WORKSPACE_MODULE_IDS as readonly string[]).includes(id);
}


async function setModuleFlag(sessionId: string, key: ModuleStatusKey) {
  const { error } = await supabaseAdmin
    .from('module_status')
    .update({ [key]: true, updated_at: new Date().toISOString() })
    .eq('session_id', sessionId);
  if (error) throw error;
}

async function refreshSessionCompleteIfAllModules(sessionId: string) {
  const { data: row } = await supabaseAdmin
    .from('module_status')
    .select('*')
    .eq('session_id', sessionId)
    .single();
  if (!row) return;
  const allDone = MODULE_STATUS_KEYS.every((k) => row[k] === true);
  if (allDone) {
    await supabaseAdmin.from('idea_sessions').update({ status: 'complete' }).eq('id', sessionId);
  } else {
    await supabaseAdmin.from('idea_sessions').update({ status: 'processing' }).eq('id', sessionId);
  }
}

/**
 * Runs a single generator for `sessionId` + `rawIdea`.
 * `idea_title` only updates `idea_sessions` (no module_status row).
 */
export async function runSingleModule(sessionId: string, rawIdea: string, moduleId: string): Promise<void> {
  switch (moduleId) {
    case 'idea_title': {
      const titleData = await generateWithFlash(PROMPTS.ideaTitleAndCategory(rawIdea));
      const { error } = await supabaseAdmin
        .from('idea_sessions')
        .update({
          idea_title: titleData.title as string,
          idea_category: titleData.category as string,
        })
        .eq('id', sessionId);
      if (error) throw error;
      return;
    }
    case 'pitch_speech': {
      const data = await generateWithFlash(PROMPTS.pitchSpeech(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('pitch_speech')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'pitch_speech');
      break;
    }
    case 'market_research': {
      const data = await generateWithFlash(PROMPTS.marketResearch(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('market_research')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'market_research');
      break;
    }
    case 'competitor_intelligence': {
      const data = await generateWithFlash(PROMPTS.competitorIntelligence(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('competitor_intelligence')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'competitor_intelligence');
      break;
    }
    case 'success_probability': {
      const data = await generateWithPro(PROMPTS.successProbability(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('success_probability')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'success_probability');
      break;
    }
    case 'feature_recommendations': {
      const data = await generateWithFlash(PROMPTS.featureRecommendations(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('feature_recommendations')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'feature_recommendations');
      break;
    }
    case 'domain_suggestions': {
      const data = await generateWithFlash(PROMPTS.domainSuggestions(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('domain_suggestions')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'domain_suggestions');
      break;
    }
    case 'roast_analysis': {
      const data = await generateWithPro(PROMPTS.roastAnalysis(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('roast_analysis')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'roast_analysis');
      break;
    }
    case 'validation_checklist': {
      const data = await generateWithFlash(PROMPTS.validationChecklist(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('validation_checklist')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'validation_checklist');
      break;
    }
    case 'monetization_strategies': {
      const data = await generateWithFlash(PROMPTS.monetizationStrategies(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('monetization_strategies')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'monetization_strategies');
      break;
    }
    case 'team_structure': {
      const data = await generateWithFlash(PROMPTS.teamStructure(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('team_structure')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'team_structure');
      break;
    }
    case 'budget_breakdown': {
      const data = await generateWithFlash(PROMPTS.budgetBreakdown(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('budget_breakdown')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'budget_breakdown');
      break;
    }
    case 'ui_flow': {
      const data = await generateWithFlash(PROMPTS.uiFlow(rawIdea));
      {
        const { error } = await supabaseAdmin
          .from('ui_flow')
          .upsert({ session_id: sessionId, ...data }, { onConflict: 'session_id' });
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'ui_flow');
      break;
    }
    case 'ppt_slides': {
      const { data: analysis } = await supabaseAdmin
        .from('pitch_speech')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();
      const pptData = await generateWithFlash(PROMPTS.pptSlides(rawIdea, analysis || {}));
      await supabaseAdmin.from('ppt_slides').delete().eq('session_id', sessionId);
      if (pptData.slides && Array.isArray(pptData.slides)) {
        const { error } = await supabaseAdmin.from('ppt_slides').insert(
          (pptData.slides as Record<string, unknown>[]).map((slide) => ({
            session_id: sessionId,
            slide_number: slide.slide_number,
            title: slide.title,
            content: slide.content,
            layout: slide.layout ?? 'default',
            speaker_notes: slide.speaker_notes,
          }))
        );
        if (error) throw error;
      }
      await setModuleFlag(sessionId, 'ppt_slides');
      break;
    }
    default:
      throw new Error(`Unknown module: ${moduleId}`);
  }

  if (isModuleStatusKey(moduleId)) {
    await refreshSessionCompleteIfAllModules(sessionId);
  }
}
