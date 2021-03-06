import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Amplify } from "aws-amplify";
import awsExports from "./aws-exports";
import UserDataContextProvider from "./context/UserDataContextProvider";
import GameDataContextProvider from "./context/GameDataContextProvider";

//Amplify 리소스 사용
Amplify.configure(awsExports);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  // <React.StrictMode>
  <UserDataContextProvider>
    <GameDataContextProvider>
      <App />
    </GameDataContextProvider>
  </UserDataContextProvider>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
