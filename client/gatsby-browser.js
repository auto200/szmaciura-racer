import React from "react";
import StoreContextProvider from "./src/contexts/Store";
import CarContextProvider from "./src/contexts/CarsContext";

export const wrapRootElement = ({ element }) => {
  return (
    <StoreContextProvider>
      <CarContextProvider>{element}</CarContextProvider>
    </StoreContextProvider>
  );
};
