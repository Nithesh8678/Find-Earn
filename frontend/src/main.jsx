import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ContractProvider } from "./contexts/ContractContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ContractProvider>
      <App />
    </ContractProvider>
  </React.StrictMode>
);
