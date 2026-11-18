"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileRenderOptions = {
  sitekey: string;
  action: "admin_login";
  theme?: "light" | "dark" | "auto";
  callback: (token: string) => void;
  "expired-callback"?: () => void;
  "timeout-callback"?: () => void;
  "error-callback"?: (errorCode: string) => boolean | void;
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

function describeTurnstileError(code: string): string {
  if (code === "110200") {
    return "نطاق صفحة الدخول غير مسموح في إعدادات Cloudflare. أضف نطاق Preview الحالي إلى Hostname Management في إعدادات Turnstile.";
  }

  if (["110100", "110110", "400020", "400070"].includes(code)) {
    return "مفتاح Turnstile غير صحيح أو غير موجود أو معطّل. راجع Sitekey وحالة Widget في Cloudflare.";
  }

  if (code === "400021") {
    return "منطقة مفتاح Turnstile لا تطابق النطاق المستخدم. راجع إعدادات Widget والنطاق.";
  }

  if (code === "200500" || code === "SCRIPT_LOAD_FAILED") {
    return "تعذّر على المتصفح تحميل خدمة Cloudflare. اسمح بالاتصال إلى challenges.cloudflare.com، ثم جرّب شبكة أو نافذة خاصة أخرى.";
  }

  if (code === "110600" || code === "110620" || code === "CHALLENGE_TIMEOUT") {
    return "انتهت مهلة التحقق الأمني. أعد المحاولة بعد تحديث الصفحة.";
  }

  if (code.startsWith("300") || code.startsWith("600")) {
    return "تعذّر إكمال تحدي Cloudflare. قد يكون السبب اتصال الشبكة أو إعدادات المتصفح أو فشل التحدي؛ جرّب نافذة خاصة أو شبكة أخرى.";
  }

  return "فشل التحقق الأمني. راجع رمز الخطأ أدناه، ثم أعد المحاولة.";
}

export function CloudflareTurnstile({
  onTokenChange,
}: CloudflareTurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const callbackRef = useRef(onTokenChange);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [scriptLoadFailed, setScriptLoadFailed] = useState(false);
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
        callback: (token) => {
          setErrorCode(null);
          setScriptLoadFailed(false);
          callbackRef.current(token);
        },
        "expired-callback": () => {
          setErrorCode("TOKEN_EXPIRED");
          callbackRef.current("");
        },
        "timeout-callback": () => setErrorCode("CHALLENGE_TIMEOUT"),
        "error-callback": (rawCode) => {
          const code = String(rawCode || "UNKNOWN");
          setErrorCode(code);
          callbackRef.current("");
          // Return false so Turnstile retains its default automatic retry behavior.
          return false;
        },
      });
    };

    const onScriptError = () => {
      setScriptLoadFailed(true);
      setErrorCode("SCRIPT_LOAD_FAILED");
      callbackRef.current("");
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.async = true;
        script.defer = true;
      }

      // Attach listeners before insertion so a fast script response cannot race
      // past the load handler.
      script.addEventListener("load", renderWidget);
      script.addEventListener("error", onScriptError);

      if (!script.isConnected) {
        document.head.appendChild(script);
      }
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
        بوابة الإدارة غير مهيأة: يجب ضبط NEXT_PUBLIC_TURNSTILE_SITE_KEY قبل
        تسجيل دخول الأدمن.
      </p>
    );
  }

  return (
    <div className="min-w-0">
      <p className="mb-2 text-body-sm font-medium text-foreground">
        تحقّق أمني إضافي
      </p>
      <div ref={containerRef} aria-label="اختبار التحقق الأمني" />
      {(errorCode || scriptLoadFailed) && (
        <p
          role="alert"
          className="mt-2 rounded-md border border-warning-200 bg-warning-50 px-3 py-2 text-caption leading-6 text-warning-800"
        >
          {describeTurnstileError(errorCode ?? "UNKNOWN")}
          <span className="mt-1 block font-mono" dir="ltr">
            Turnstile error: {errorCode ?? "UNKNOWN"}
          </span>
        </p>
      )}
    </div>
  );
}
