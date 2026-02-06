"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile: any;
  }
}

export default function Turnstile({ onVerify }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!window.turnstile || !containerRef.current) return;

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
        callback: (token) => {
          onVerify(token); // 驗證成功回傳 token
        },
        "expired-callback": () => onVerify(""),
        "error-callback": () => onVerify(""),
      });

      clearInterval(interval);
    }, 100);

    return () => {
      clearInterval(interval);
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [onVerify]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
      />
      <div ref={containerRef} />
    </>
  );
}
