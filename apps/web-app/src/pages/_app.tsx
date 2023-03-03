import Layout from "@/components/Layout";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import { SEO } from "next-seo.config";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import "tailwindcss/tailwind.css";
import Script from 'next/script'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <RecoilRoot>
        <SessionProvider session={session}>
          <Layout>
            <DefaultSeo {...SEO} />
            <Script
              id="anal"
              dangerouslySetInnerHTML={{
                __html: `var _paq = window._paq = window._paq || [];
              /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
              _paq.push(['trackPageView']);
              _paq.push(['enableLinkTracking']);
              (function() {
                var u="//anal.movies4discord.tk/";
                _paq.push(['setTrackerUrl', u+'matomo.php']);
                _paq.push(['setSiteId', '1']);
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
              })();`,
              }}
            />
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </RecoilRoot>
    </>
  );
}

export default MyApp;
