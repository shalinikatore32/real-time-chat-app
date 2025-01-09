import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { StoreToken } from "./store/StoreToken";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <ChakraProvider>
      <StoreToken>
        <App />
      </StoreToken>
    </ChakraProvider>
  </>
);
