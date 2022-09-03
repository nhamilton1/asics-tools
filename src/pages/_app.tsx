// src/pages/_app.tsx
import { withTRPC } from "@trpc/next";
import type { AppRouter } from "../server/router";
import superjson from "superjson";
import "../styles/globals.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import favicon from "../public/images/favicon.ico";
import favicon32 from "../public/images/favicon-32x32.png";
import favicon16 from "../public/images/favicon-16x16.png";
import appleTouchIcon from "../public/images/apple-touch-icon.png";
import PlausibleProvider from "next-plausible";

export type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return getLayout(
    <>
      <PlausibleProvider domain="asic-tools.com">
        <Head>
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href={appleTouchIcon.src}
          />
          <link rel="shortcut icon" href={favicon.src} type="image/x-icon" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href={favicon32.src}
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href={favicon16.src}
          />
          <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
          <meta name="msapplication-TileColor" content="#da532c" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <Component {...pageProps} />
      </PlausibleProvider>
    </>
  );
}

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = `${getBaseUrl()}/api/trpc`;

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
  //@ts-ignore
})(MyApp);
