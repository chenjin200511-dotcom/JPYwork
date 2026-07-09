"use client";

// Purpose: Provides the right-side sign-in panel for JPY team users.
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useId, useState } from "react";
import type { Dictionary, Language } from "@/lib/i18n/dictionary";

type LoginPanelProps = {
  copy: Dictionary;
  isOpen: boolean;
  language: Language;
  onClose: () => void;
};

type LoginResponse =
  | {
      success: true;
      data: {
        user: {
          email: string;
          id: string;
          name: string;
          role: "OWNER" | "OPERATOR" | "SUPPORT";
        };
      };
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

export function LoginPanel({
  copy,
  isOpen,
  language,
  onClose,
}: LoginPanelProps) {
  const router = useRouter();
  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = useCallback(() => {
    setError("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, isOpen]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({
          email,
          password,
          rememberDevice,
        }),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const result = (await response.json()) as LoginResponse;

      if (!response.ok || !result.success) {
        setError(copy.auth.invalidCredentials);
        return;
      }

      handleClose();
      router.push("/workspace");
      router.refresh();
    } catch {
      setError(copy.auth.invalidCredentials);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={`login-panel-shell${isOpen ? " is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        className="login-panel__backdrop"
        aria-label={copy.auth.close}
        tabIndex={isOpen ? 0 : -1}
        onClick={handleClose}
      />
      <aside
        className="login-panel"
        aria-labelledby="login-panel-title"
        aria-modal="true"
        data-language={language}
        role="dialog"
      >
        <div className="login-panel__topline">
          <span>{copy.common.teamShortName}</span>
          <button type="button" onClick={handleClose}>
            {copy.auth.close}
          </button>
        </div>

        <header className="login-panel__header">
          <h2 id="login-panel-title">{copy.auth.title}</h2>
          <p>{copy.auth.subtitle}</p>
        </header>

        <form
          className="login-panel__form"
          aria-busy={isSubmitting}
          onSubmit={handleSubmit}
        >
          <label className="login-panel__field" htmlFor={emailId}>
            <span>{copy.auth.email}</span>
            <input
              id={emailId}
              autoComplete="email"
              disabled={isSubmitting}
              inputMode="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
            />
          </label>

          <label className="login-panel__field" htmlFor={passwordId}>
            <span>{copy.auth.password}</span>
            <input
              id={passwordId}
              autoComplete="current-password"
              disabled={isSubmitting}
              name="password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
            />
          </label>

          <label className="login-panel__remember" htmlFor={rememberId}>
            <input
              id={rememberId}
              checked={rememberDevice}
              disabled={isSubmitting}
              name="rememberDevice"
              type="checkbox"
              onChange={(event) => setRememberDevice(event.target.checked)}
            />
            <span>{copy.auth.rememberDevice}</span>
          </label>

          <p className="login-panel__error" aria-live="polite">
            {error}
          </p>

          <button
            className="login-panel__submit primary-action"
            disabled={isSubmitting}
            type="submit"
          >
            {copy.auth.signIn}
          </button>
        </form>
      </aside>
    </div>
  );
}
