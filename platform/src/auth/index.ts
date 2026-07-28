/**
 * Auth helpers for Supabase-backed deployments.
 * Local MemoryStore demos create profiles directly without JWT.
 */

export interface AuthUser {
  id: string;
  email: string;
}

export function assertOwnerEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Invalid email");
  }
  return normalized;
}

/** Placeholder for Supabase JWT verification — wire with @supabase/supabase-js in production. */
export async function resolveUserFromBearer(
  _authorizationHeader: string | null,
): Promise<AuthUser | null> {
  return null;
}
