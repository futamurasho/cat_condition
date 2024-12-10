import React from "react";
import ReactDOM from "react-dom/client"; // 修正ポイント
import App from "./App";

// createRootを使用してReactアプリをマウント
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
