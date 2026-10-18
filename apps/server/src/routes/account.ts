import { db, defineSchema, newId, nowIso, parseJson } from '../db.ts';
import { jsonError, type App } from '../lib/http.ts';
import { activeOrgId, memberRole, readBody, resolveOrgId } from './account/common.ts';
import { registerAccountIntegrations } from './account/integrations.ts';
import { registerProjectRoutes } from './account/projects.ts';

defineSchema(`
CREATE TABLE IF NOT EXISTS onboarding (
  user_id TEXT PRIMARY KEY,
  answers TEXT NOT NULL DEFAULT '{}',
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  message TEXT NOT NULL,
  source TEXT,
  page_url TEXT,
  ticket_id TEXT,
  created_at TEXT NOT NULL
);
`);

/** Self-hosted: every workspace is on the top plan with no limits; the catalog is only shown in upgrade UI. */
const PLANS = [
  { id: 'free', name: 'Free', tagline: 'For trying things out', monthly: 0, annual: 0, features: ['3 files', 'Unlimited pages', 'Community support'] },
  { id: 'basic', name: 'Basic', tagline: 'For individuals', monthly: 20, annual: 16, features: ['Unlimited files', 'Invite collaborators', 'Share links'] },
  { id: 'pro', name: 'Pro', tagline: 'For teams', monthly: 40, annual: 32, features: ['Everything in Basic', 'Higher MCP limits', 'Priority support'] },
];

type OnboardingAnswers = { selections?: unknown; text?: unknown; stepIndex?: unknown; welcomeTourPending?: boolean };
type OnboardingRow = { answers: string; completed: number };

export default function register(app: App) {
  // ---- session ----
  app.get('/session', (c) => {
    const user = c.get('user');
    const session = c.get('session');
    if (!user || !session) return jsonError(c, 401, 'Not signed in');
    const row = db.prepare('SELECT onboardingCompleted, role FROM "user" WHERE id = ?').get(user.id) as
      | { onboardingCompleted: number | null; role: string | null }
      | undefined;
    const orgId = activeOrgId(c);
    const org = orgId ? (db.prepare('SELECT name FROM organization WHERE id = ?').get(orgId) as { name: string } | undefined) : undefined;
    return c.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: !!user.emailVerified,
        image: user.image ?? null,
        role: row?.role ?? user.role ?? 'user',
        onboardingCompleted: !!(row?.onboardingCompleted ?? user.onboardingCompleted),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      session: {
        id: session.id,
        userId: session.userId,
        expiresAt: session.expiresAt,
        activeOrganizationId: orgId,
        activeOrganizationName: org?.name ?? null,
        activeOrganizationRole: orgId ? memberRole(orgId, user.id) : null,
        impersonated: !!session.impersonatedBy,
      },
    });
  });

  // ---- billing ----
  app.get('/billing/summary', (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const orgId = resolveOrgId(c, c.req.query('organizationId'));
    if (!orgId) return jsonError(c, 400, 'organizationId is required');
    if (!memberRole(orgId, user.id)) return jsonError(c, 403, 'You are not a member of this workspace');
    const seats = db.prepare("SELECT COUNT(*) AS n FROM member WHERE organizationId = ? AND role IN ('owner', 'editor')").get(orgId) as { n: number };
    return c.json({
      organizationId: orgId,
      plan: 'pro',
      canManageBilling: true,
      seats: Math.max(1, Number(seats.n) || 1),
      subscription: { status: 'active', billingInterval: 'year' },
      plans: PLANS,
      limits: { maxProjects: null, maxProjectBytes: null, invitePeople: true, mcpCallsPerWeek: null },
      selfHosted: true,
    });
  });
  app.post('/billing/upgrade', (c) => jsonError(c, 400, 'Billing is not available on Petal.'));
  app.post('/billing/mcp-usage', (c) => c.json({ allowed: true }));

  // ---- onboarding ----
  const readOnboarding = (userId: string) => db.prepare('SELECT answers, completed FROM onboarding WHERE user_id = ?').get(userId) as OnboardingRow | undefined;

  app.get('/onboarding', (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const row = readOnboarding(user.id);
    if (!row) return c.json({ answers: null, completed: false });
    return c.json({ answers: parseJson<OnboardingAnswers>(row.answers, {}), completed: !!row.completed });
  });

  app.post('/onboarding', async (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const body = await readBody(c);
    const incoming = (body.answers && typeof body.answers === 'object' ? body.answers : {}) as OnboardingAnswers;
    const row = readOnboarding(user.id);
    const prev = row ? parseJson<OnboardingAnswers>(row.answers, {}) : {};
    const wasCompleted = !!row?.completed;
    const completing = body.completed === true;
    const completed = wasCompleted || completing;
    const answers: OnboardingAnswers = {
      selections: incoming.selections ?? prev.selections ?? {},
      text: incoming.text ?? prev.text ?? {},
      stepIndex: typeof incoming.stepIndex === 'number' ? incoming.stepIndex : (prev.stepIndex ?? 0),
    };
    const pending = completing && !wasCompleted ? true : prev.welcomeTourPending;
    if (pending !== undefined) answers.welcomeTourPending = pending;
    const now = nowIso();
    db.transaction(() => {
      db.prepare(
        `INSERT INTO onboarding (user_id, answers, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (user_id) DO UPDATE SET answers = excluded.answers, completed = excluded.completed, updated_at = excluded.updated_at`,
      ).run(user.id, JSON.stringify(answers), completed ? 1 : 0, now, now);
      if (completed) db.prepare('UPDATE "user" SET onboardingCompleted = 1 WHERE id = ?').run(user.id);
    })();
    return c.json({ ok: true, answers, completed });
  });

  app.post('/onboarding/welcome-tour/dismiss', (c) => {
    const user = c.get('user');
    if (!user) return jsonError(c, 401, 'Not signed in');
    const row = readOnboarding(user.id);
    const now = nowIso();
    if (row) {
      const answers = { ...parseJson<OnboardingAnswers>(row.answers, {}), welcomeTourPending: false };
      db.prepare('UPDATE onboarding SET answers = ?, updated_at = ? WHERE user_id = ?').run(JSON.stringify(answers), now, user.id);
    } else {
      db.prepare('INSERT INTO onboarding (user_id, answers, completed, created_at, updated_at) VALUES (?, ?, 0, ?, ?)').run(
        user.id,
        JSON.stringify({ welcomeTourPending: false }),
        now,
        now,
      );
    }
    return c.json({ ok: true });
  });

  // ---- feedback ----
  app.post('/feedback', async (c) => {
    const user = c.get('user');
    const body = await readBody(c);
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) return jsonError(c, 400, 'message is required');
    const str = (v: unknown) => (typeof v === 'string' && v ? v.slice(0, 2000) : null);
    const id = newId();
    db.prepare('INSERT INTO feedback (id, user_id, message, source, page_url, ticket_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id,
      user?.id ?? null,
      message.slice(0, 20000),
      str(body.source),
      str(body.pageUrl),
      str(body.ticketId),
      nowIso(),
    );
    console.log(`[feedback] ${user?.email ?? 'anonymous'} (${str(body.source) ?? '?'} ${str(body.pageUrl) ?? ''}): ${message}`);
    return c.json({ ok: true, id });
  });

  registerAccountIntegrations(app);
  registerProjectRoutes(app);
}
