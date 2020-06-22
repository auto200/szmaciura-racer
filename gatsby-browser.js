import React from "react";
import StoreContextProvider from "./src/contexts/Store";

export const wrapRootElement = ({ element }) => {
  return <StoreContextProvider>{element}</StoreContextProvider>;
};
