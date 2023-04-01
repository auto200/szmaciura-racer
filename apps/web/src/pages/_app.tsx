import type { AppProps } from "next/app";
import { ThemeProvider } from "styled-components";

import "@components/OnCompleteModal/style.css";
import StoreContextProvider from "@contexts/Store";
import { darkTheme } from "@utils/theme";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={darkTheme}>
      <StoreContextProvider>
        <Component {...pageProps} />
      </StoreContextProvider>
    </ThemeProvider>
  );
}
