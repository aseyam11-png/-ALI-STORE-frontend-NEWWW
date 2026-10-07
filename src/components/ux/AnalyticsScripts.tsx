import Script from "next/script";

const enabled = process.env.NEXT_PUBLIC_UX_ANALYTICS_ENABLED === "true";
const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
const gaMeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

export function AnalyticsScripts() {
  if (!enabled) return null;

  return (
    <>
      {gaMeasurementId ? (
        <>
          <Script
            src={
              "https://www.googletagmanager.com/gtag/js?id=" +
              encodeURIComponent(gaMeasurementId)
            }
            strategy="afterInteractive"
          />
          <Script id="ali-store-ga4" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag("js", new Date());
            gtag("config", ${JSON.stringify(gaMeasurementId)}, {
              send_page_view: false,
              anonymize_ip: true
            });
          `}</Script>
        </>
      ) : null}

      {clarityProjectId ? (
        <Script id="ali-store-clarity" strategy="afterInteractive">{`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", ${JSON.stringify(clarityProjectId)});
        `}</Script>
      ) : null}

      {posthogToken ? (
        <>
          <Script
            src={posthogHost + "/static/array.js"}
            strategy="afterInteractive"
          />
          <Script id="ali-store-posthog" strategy="afterInteractive">{`
            (function initPostHog() {
              if (window.posthog && typeof window.posthog.init === "function") {
                window.posthog.init(${JSON.stringify(posthogToken)}, {
                  api_host: ${JSON.stringify(posthogHost)},
                  defaults: "2026-05-30",
                  capture_pageview: false,
                  capture_pageleave: true
                });
                return;
              }
              window.setTimeout(initPostHog, 100);
            })();
          `}</Script>
        </>
      ) : null}
    </>
  );
}
