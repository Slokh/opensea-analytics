import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import theme from "../theme";
import Head from "next/head";
import { OpenSeaProvider } from "../context/opensea";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <OpenSeaProvider>
      <ChakraProvider theme={theme}>
        <Head>
          <title>OpenSea Analytics</title>
          <link
            href="favicon-32x32.png"
            rel="icon"
            sizes="32x32"
            type="image/png"
          />
          <link
            href="favicon-16x16.png"
            rel="icon"
            sizes="16x16"
            type="image/png"
          />
        </Head>
        <Component {...pageProps} />
      </ChakraProvider>
    </OpenSeaProvider>
  );
}

export default MyApp;
