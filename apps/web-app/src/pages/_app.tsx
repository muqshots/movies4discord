import Layout from "@/components/Layout";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import { SEO } from "next-seo.config";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import "tailwindcss/tailwind.css";
import { init, push } from "@socialgouv/matomo-next";
import { useEffect } from "react";

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL!;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID || "1";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  useEffect(() => {
    init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID });
    push(["enableHeartBeatTimer"]);
  }, []);

  return (
    <>
      <RecoilRoot>
        <SessionProvider session={session}>
          <Layout>
            <DefaultSeo {...SEO} />
            <Component {...pageProps} />
          </Layout>
        </SessionProvider>
      </RecoilRoot>
    </>
  );
}

export default MyApp;
