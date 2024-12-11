import { useEffect, useState } from "react";
import scoreApi from "./api/get_score";
import liff from "@line/liff";
import "./App.css";

function App() {
  const [userId, setUserId] = useState(""); // ユーザーIDの状態を定義
  const [score, setScore] = useState(null); // スコア
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
              setUserId(profile.userId); // ユーザーIDを状態にセット
              // APIからスコアを取得
              return scoreApi.get(profile.userId);
            })
            .then((data) => {
              setScore(data.score); // スコアをセット
            })
            .catch((err) => {
              console.error("Error fetching score:", err);
              setError(err); // エラーメッセージをセット
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
      <h1>LIFF App</h1>
      {message && <p>{message}</p>}
      {userId && <p>User ID: {userId}</p>}
      {score !== null ? (
        <p>Score: {score}</p>
      ) : (
        <p>{error || "Fetching score..."}</p>
      )}
    </div>
  );
}

export default App;
