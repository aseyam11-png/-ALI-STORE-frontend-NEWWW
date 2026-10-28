"use client";

import { useEffect, useRef } from "react";

type TurnstileRenderOptions = {
  sitekey: string;
  action: "admin_login";
  theme?: "light" | "dark" | "auto";
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

type CloudflareTurnstileProps = {
  onTokenChange: (token: string) => void;
};

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export function CloudflareTurnstile({ onTokenChange }: CloudflareTurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onTokenChange);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

  useEffect(() => {
    callbackRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let disposed = false;
    let script = document.querySelector<HTMLScriptElement>(
      'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]',
    );

    const renderWidget = () => {
      if (
        disposed ||
        !window.turnstile ||
        !containerRef.current ||
        widgetIdRef.current
      ) {
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action: "admin_login",
        theme: "light",
        callback: (token) => callbackRef.current(token),
        "expired-callback": () => callbackRef.current(""),
        "error-callback": () => callbackRef.current(""),
      });
    };

    const onScriptError = () => callbackRef.current("");

    if (window.turnstile) {
      renderWidget();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener("load", renderWidget);
      script.addEventListener("error", onScriptError);
    }

    return () => {
      disposed = true;
      script?.removeEventListener("load", renderWidget);
      script?.removeEventListener("error", onScriptError);

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [siteKey]);

  if (!siteKey) {
    return (
      <p
        role="alert"
        className="rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-caption text-warning-800"
      >
        بوابة الإدارة غير مهيأة: يجب ضبط NEXT_PUBLIC_TURNSTILE_SITE_KEY قبل تسجيل دخول الأدمن.
      </p>
    );
  }

  return (
    <div>
      <p className="mb-2 text-body-sm font-medium text-foreground">
        تحقّق أمني إضافي
      </p>
      <div ref={containerRef} aria-label="اختبار التحقق الأمني" />
    </div>
  );
}
