import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Bounce, ToastContainer } from "react-toastify";
import App from "./App.tsx";
import { GameConfiguration } from "./gameConfiguration.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <ToastContainer
      position={GameConfiguration.TOAST_POSITION}
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={GameConfiguration.TOAST_POSITION.includes("bottom")}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      transition={Bounce}
    />
  </StrictMode>,
);
