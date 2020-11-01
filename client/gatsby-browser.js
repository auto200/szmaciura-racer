import React from "react";
import StoreContextProvider from "./src/contexts/Store";
import CarContextProvider from "./src/contexts/CarsContext";
import { ThemeProvider } from "styled-components";
import { darkTheme } from "./src/utils/theme";

export const wrapRootElement = ({ element }) => {
  return (
    <StoreContextProvider>
      <CarContextProvider>
        <ThemeProvider theme={darkTheme}>{element}</ThemeProvider>
      </CarContextProvider>
    </StoreContextProvider>
  );
};
