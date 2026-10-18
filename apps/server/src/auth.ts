import { betterAuth } from 'better-auth';
import { admin, emailOTP, organization } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, memberAc, ownerAc } from 'better-auth/plugins/organization/access';
import { getMigrations } from 'better-auth/db/migration';
import { electron } from '@better-auth/electron';
import { db, newId, nowIso } from './db.ts';
import { AUTH_SECRET, DESKTOP_SCHEME, LOCAL_MODE, PUBLIC_URL } from './env.ts';

// Same role set as the desktop client's organizationClient (cloud/lib/auth-client.ts).
const ac = createAccessControl(defaultStatements);
const roles = {
  owner: ac.newRole(ownerAc.statements),
  editor: ac.newRole(memberAc.statements),
  viewer: ac.newRole(memberAc.statements),
};

function firstOrganizationOf(userId: string): string | null {
  const row = db
    .prepare('SELECT organizationId FROM member WHERE userId = ? ORDER BY createdAt ASC LIMIT 1')
    .get(userId) as { organizationId: string } | undefined;
  return row?.organizationId ?? null;
}

function createPersonalOrganization(user: { id: string; name?: string | null; email: string }) {
  if (firstOrganizationOf(user.id)) return;
  const orgId = newId();
  const label = (user.name || user.email.split('@')[0] || 'My').trim();
  const now = nowIso();
  db.prepare('INSERT INTO organization (id, name, slug, logo, metadata, createdAt) VALUES (?, ?, ?, NULL, NULL, ?)').run(
    orgId,
    `${label}'s workspace`,
    `${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'org'}-${orgId.slice(0, 8)}`,
    now,
  );
  db.prepare('INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, ?, ?)').run(newId(), orgId, user.id, 'owner', now);
}

export const auth = betterAuth({
  baseURL: PUBLIC_URL,
  basePath: '/api/auth',
  secret: AUTH_SECRET,
  database: db,
  trustedOrigins: [PUBLIC_URL, `${DESKTOP_SCHEME}:/`, `${DESKTOP_SCHEME}://`, 'http://localhost:*', 'http://127.0.0.1:*'],
  emailAndPassword: { enabled: true, autoSignIn: true },
  // Local mode keeps one long-lived session for the built-in user.
  ...(LOCAL_MODE ? { session: { expiresIn: 60 * 60 * 24 * 365 } } : {}),
  user: {
    additionalFields: {
      onboardingCompleted: { type: 'boolean', defaultValue: false, input: false },
    },
  },
  databaseHooks: {
    user: { create: { after: async (user) => createPersonalOrganization(user) } },
    session: {
      create: {
        // The sign-up session is inserted before the user `after` hook runs, so
        // make sure the personal workspace exists here too.
        before: async (session) => {
          if (!firstOrganizationOf(session.userId)) {
            const user = db.prepare('SELECT id, name, email FROM "user" WHERE id = ?').get(session.userId) as { id: string; name: string; email: string } | undefined;
            if (user) createPersonalOrganization(user);
          }
          return {
            data: { ...session, activeOrganizationId: (session as { activeOrganizationId?: string }).activeOrganizationId ?? firstOrganizationOf(session.userId) },
          };
        },
      },
    },
  },
  plugins: [
    electron(),
    organization({ ac, roles, creatorRole: 'owner' }),
    admin(),
    emailOTP({
      // Self-hosted: no mail provider by default, so codes are printed to the server log.
      async sendVerificationOTP({ email, otp, type }) {
        console.log(`[auth] ${type} code for ${email}: ${otp}`);
      },
    }),
  ],
});

export async function migrateAuthSchema() {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
}

export type SessionUser = { id: string; name: string; email: string; emailVerified: boolean; image?: string | null; role?: string | null; onboardingCompleted?: boolean; createdAt: Date; updatedAt: Date };
export type SessionRecord = { id: string; userId: string; expiresAt: Date; activeOrganizationId?: string | null; impersonatedBy?: string | null };
