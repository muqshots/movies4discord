import Layout from "@/components/Layout";
import { SessionProvider } from "next-auth/react";
import { DefaultSeo } from "next-seo";
import { SEO } from "next-seo.config";
import type { AppProps } from "next/app";
import { RecoilRoot } from "recoil";
import "tailwindcss/tailwind.css";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
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
