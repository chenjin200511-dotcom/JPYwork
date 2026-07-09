// Purpose: Reads the initial language from a request cookie for server-rendered routes.
import { cookies } from "next/headers";
import type { Language } from "./dictionary";
import { LANGUAGE_STORAGE_KEY } from "./languageStorage";

function normalizeLanguage(value: string | undefined): Language {
  return value === "en" ? "en" : "zh";
}

export async function getInitialLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  return normalizeLanguage(cookieStore.get(LANGUAGE_STORAGE_KEY)?.value);
}
