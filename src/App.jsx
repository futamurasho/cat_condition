import { useEffect, useState } from "react";
import liff from "@line/liff";
import "./App.css";

function App() {
  const [userId, setUserId] = useState(""); // ユーザーIDの状態を定義
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    liff
      .init({
        liffId: import.meta.env.VITE_LIFF_ID,
      })
      .then(() => {
        setMessage("LIFF init succeeded."); // 初期化成功メッセージを設定
        // LIFFが初期化に成功したらプロファイル情報を取得
        if (liff.isLoggedIn()) {
          liff
            .getProfile()
            .then((profile) => {
              console.log(profile);
              setUserId(profile.userId); // ユーザーIDを状態にセット
            })
            .catch((err) => {
              console.error("Error fetching profile:", err);
              setError("Failed to fetch user profile.");
            });
        } else {
          liff.login(); // ログインしていない場合はログイン
        }
      })
      .catch((e) => {
        setMessage("LIFF init failed.");
        setError(`${e}`);
      });
  });

  return (
    <div>
      <h1>LIFF User ID Example</h1>
      {message && <p>{message}</p>} {/* 初期化結果メッセージ */}
      {userId ? (
        <p>User ID: {userId}</p> // ユーザーIDを表示
      ) : (
        <p>{error || "Loading user profile..."}</p> // エラーまたはロード中メッセージ
      )}
    </div>
  );
}

export default App;
