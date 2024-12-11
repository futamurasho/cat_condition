import { useEffect, useState } from "react";
import scoreApi from "./api/get_score";
import liff from "@line/liff";
// import "./App.css";
import condition1 from "./assets/images/condition1.PNG";
import condition2 from "./assets/images/condition2.PNG";
import condition3 from "./assets/images/condition3.PNG";
import condition4 from "./assets/images/condition4.PNG";
import condition5 from "./assets/images/condition5.PNG";
import condition6 from "./assets/images/condition6.PNG";

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
              setScore(null); // スコア取得に失敗した場合、nullに設定
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

  // スコアに応じた画像の選択
  const getImageForScore = (score) => {
    if (score === null) return condition3; // スコアが取得できない場合はデフォルト画像
    if (score >= 7 && score <= 10) return condition6;
    if (score >= 4 && score <= 6) return condition5;
    if (score >= 1 && score <= 3) return condition4;
    if (score >= -2 && score <= 0) return condition3;
    if (score >= -5 && score <= -3) return condition2;
    if (score >= -9 && score <= -6) return condition1;
    return condition3; // その他の場合もデフォルト画像
  };

  return (
    <div>
      <h1>LIFF App</h1>
      {message && <p>{message}</p>}
      {userId && <p>User ID: {userId}</p>}
      <div>
        <p>Score: {score !== null ? score : "Not available"}</p>
        <img
          src={getImageForScore(score)}
          alt="Score-based image"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      </div>
      {error && <p>Error: {error.toString()}</p>}
    </div>
  );
}

export default App;
