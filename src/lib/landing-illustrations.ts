/**
 * Landing illustration catalog — Google Marketing / Workspace style.
 * Assets live in /public/landing/illustrations/
 */

export type LandingIllustrationId =
  | 'hero'
  | 'inbox'
  | 'calendar'
  | 'agent'
  | 'analytics'
  | 'security'
  | 'integrations'
  | 'workflow'
  | 'team'
  | 'productivity'
  | 'focus'
  | 'connect';

export type LandingIllustrationMeta = {
  id: LandingIllustrationId;
  src: string;
  alt: string;
  /** Design lineage for credits in devtools / README */
  source: 'unDraw-style' | 'ManyPixels-style' | 'DrawKit-style' | 'Storyset-style' | 'Ouch-style' | 'Blush-style';
  aspect: 'square' | 'landscape' | 'portrait';
};

export const LANDING_ILLUSTRATIONS: Record<LandingIllustrationId, LandingIllustrationMeta> = {
  hero: {
    id: 'hero',
    src: '/landing/illustrations/hero.svg',
    alt: 'Unified email and calendar workspace',
    source: 'unDraw-style',
    aspect: 'landscape',
  },
  inbox: {
    id: 'inbox',
    src: '/landing/illustrations/inbox.svg',
    alt: 'Smart inbox triage',
    source: 'unDraw-style',
    aspect: 'landscape',
  },
  calendar: {
    id: 'calendar',
    src: '/landing/illustrations/calendar.svg',
    alt: 'Calendar scheduling',
    source: 'Storyset-style',
    aspect: 'landscape',
  },
  agent: {
    id: 'agent',
    src: '/landing/illustrations/agent.svg',
    alt: 'AI assistant',
    source: 'ManyPixels-style',
    aspect: 'landscape',
  },
  analytics: {
    id: 'analytics',
    src: '/landing/illustrations/analytics.svg',
    alt: 'Communication analytics',
    source: 'DrawKit-style',
    aspect: 'landscape',
  },
  security: {
    id: 'security',
    src: '/landing/illustrations/security.svg',
    alt: 'Secure OAuth connection',
    source: 'Ouch-style',
    aspect: 'square',
  },
  integrations: {
    id: 'integrations',
    src: '/landing/illustrations/integrations.svg',
    alt: 'Tool integrations',
    source: 'Blush-style',
    aspect: 'landscape',
  },
  workflow: {
    id: 'workflow',
    src: '/landing/illustrations/workflow.svg',
    alt: 'Email workflow pipeline',
    source: 'unDraw-style',
    aspect: 'landscape',
  },
  team: {
    id: 'team',
    src: '/landing/illustrations/team.svg',
    alt: 'Teams collaborating',
    source: 'ManyPixels-style',
    aspect: 'landscape',
  },
  productivity: {
    id: 'productivity',
    src: '/landing/illustrations/productivity.svg',
    alt: 'Productive focused work',
    source: 'unDraw-style',
    aspect: 'square',
  },
  focus: {
    id: 'focus',
    src: '/landing/illustrations/focus.svg',
    alt: 'Deep focus mode',
    source: 'DrawKit-style',
    aspect: 'square',
  },
  connect: {
    id: 'connect',
    src: '/landing/illustrations/connect.svg',
    alt: 'Connect Google account',
    source: 'Storyset-style',
    aspect: 'landscape',
  },
};

export const showcaseIllustrationIds: LandingIllustrationId[] = [
  'inbox',
  'calendar',
  'agent',
  'analytics',
];

export const featureIllustrationMap: Record<string, LandingIllustrationId> = {
  'Smart triage': 'inbox',
  'AI drafts': 'agent',
  'Command palette': 'focus',
  Analytics: 'analytics',
};
