"use client";

// Purpose: Manages local zh/en language state and keeps the choice in localStorage.
import { useMemo, useSyncExternalStore } from "react";
import { dictionary, type Language } from "./dictionary";
import { LANGUAGE_STORAGE_KEY } from "./languageStorage";

const LANGUAGE_CHANGE_EVENT = "jpy-language-change";

function isLanguage(value: string | null): value is Language {
  return value === "zh" || value === "en";
}

function readStoredLanguage(fallbackLanguage: Language): Language {
  if (typeof window === "undefined") {
    return fallbackLanguage;
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isLanguage(storedLanguage) ? storedLanguage : fallbackLanguage;
}

function subscribeToLanguageChange(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onStoreChange);
  };
}

function persistLanguageCookie(language: Language) {
  document.cookie = `${LANGUAGE_STORAGE_KEY}=${language}; path=/; max-age=31536000; SameSite=Lax`;
}

export function useLanguage(initialLanguage: Language = "zh") {
  const language = useSyncExternalStore(
    subscribeToLanguageChange,
    () => readStoredLanguage(initialLanguage),
    (): Language => initialLanguage,
  );
  const copy = useMemo(() => dictionary[language], [language]);

  function setLanguage(nextLanguage: Language) {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    persistLanguageCookie(nextLanguage);
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
  }

  function toggleLanguage() {
    setLanguage(language === "zh" ? "en" : "zh");
  }

  return {
    language,
    copy,
    setLanguage,
    toggleLanguage,
  };
}
