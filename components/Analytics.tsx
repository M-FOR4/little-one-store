"use client";

import Script from "next/script";

export function Analytics() {
    const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID;
    const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

    // Don't load analytics scripts if IDs are not configured
    const hasGA = GA_TRACKING_ID && !GA_TRACKING_ID.includes("XXXXX");
    const hasFB = FB_PIXEL_ID && !FB_PIXEL_ID.includes("XXXXX");

    if (!hasGA && !hasFB) return null;

    return (
        <>
            {/* ---------------------------------------------------- */}
            {/* 1. Google Analytics (gtag.js)                          */}
            {/* ---------------------------------------------------- */}
            {hasGA && (
                <>
                    <Script
                        strategy="afterInteractive"
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
                    />
                    <Script
                        id="google-analytics"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_TRACKING_ID}', {
                  page_path: window.location.pathname,
                });
              `,
                        }}
                    />
                </>
            )}

            {/* ---------------------------------------------------- */}
            {/* 2. Meta (Facebook) Pixel                             */}
            {/* ---------------------------------------------------- */}
            {hasFB && (
                <>
                    <Script
                        id="fb-pixel"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${FB_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
                        }}
                    />
                    <noscript>
                        <img
                            height="1"
                            width="1"
                            style={{ display: "none" }}
                            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
                            alt=""
                        />
                    </noscript>
                </>
            )}
        </>
    );
}
