// Purpose: Manages secure httpOnly cookie sessions for JPY team users.
import { cookies } from "next/headers";
import type { Session } from "@prisma/client";
import { prisma } from "../db/prisma";
import {
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
} from "./sessionToken";

export const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME || "jpy_session";

export {
  createSessionToken,
  getSessionExpiry,
  hashSessionToken,
  toPublicUser,
} from "./sessionToken";

export async function createUserSession(userId: string, rememberDevice: boolean) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiry(rememberDevice);

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return {
    session,
    token,
  };
}

export async function findSessionByToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    include: {
      user: true,
    },
    where: {
      tokenHash: hashSessionToken(token),
    },
  });

  if (!session || session.expiresAt <= new Date() || session.user.status !== "ACTIVE") {
    return null;
  }

  return session;
}

export async function deleteSessionByToken(token: string | undefined | null) {
  if (!token) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      tokenHash: hashSessionToken(token),
    },
  });
}

export async function setSessionCookie(token: string, session: Pick<Session, "expiresAt">) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    expires: session.expiresAt,
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getSessionTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}
