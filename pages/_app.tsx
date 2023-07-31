import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import NextTopLoader from "nextjs-toploader";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <NextTopLoader
        color="#073d5c"
        showSpinner={false}
        shadow="0 0 6px #073d5c,0 0 3px #073d5c"
      />
      <Component {...pageProps} />
    </UserProvider>
  );
}
