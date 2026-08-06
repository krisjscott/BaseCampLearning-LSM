"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const ENABLED = process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === "true";
const SCRIPT_ID = "basecamp-turnstile-script";

export type TurnstileWidgetHandle = {
  getToken: () => string | null;
  reset: () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      getResponse: (widgetId: string) => string | undefined;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TurnstileWidget = forwardRef<TurnstileWidgetHandle>(function TurnstileWidget(_, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!ENABLED || !SITE_KEY) return;
    if (!containerRef.current) return;

    const render = () => {
      if (!containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        action: "turnstile-spin-v2",
      });
    };

    if (window.turnstile) {
      render();
    } else {
      const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
      if (existingScript) {
        existingScript.addEventListener("load", render, { once: true });
      } else {
        const script = document.createElement("script");
        script.id = SCRIPT_ID;
        script.src = TURNSTILE_SCRIPT_URL;
        script.async = true;
        script.defer = true;
        script.onload = render;
        document.head.appendChild(script);
      }
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getToken: () => {
      if (!widgetIdRef.current || !window.turnstile) return null;
      return window.turnstile.getResponse(widgetIdRef.current) ?? null;
    },
    reset: () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  if (!ENABLED || !SITE_KEY) return null;

  return (
    <div className="turnstile-slot">
      <div ref={containerRef} />
    </div>
  );
});

export default TurnstileWidget;
