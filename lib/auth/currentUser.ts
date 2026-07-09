// Purpose: Resolves the current user from the httpOnly session cookie.
import { findSessionByToken, getSessionTokenFromCookie, toPublicUser } from "./session";

export async function getCurrentUser() {
  const token = await getSessionTokenFromCookie();
  const session = await findSessionByToken(token);
  return session ? toPublicUser(session.user) : null;
}
