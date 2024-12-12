import { useEffect, useState } from "react";
import scoreApi from "./api/get_score";
import liff from "@line/liff";
import "./App.css";
import condition1 from "./assets/images/condition1.PNG";
import condition2 from "./assets/images/condition2.PNG";
import condition3 from "./assets/images/condition3.PNG";
import condition4 from "./assets/images/condition4.PNG";
import condition5 from "./assets/images/condition5.PNG";
import condition6 from "./assets/images/condition6.PNG";

function App() {
  const [userId, setUserId] = useState(""); // ユーザーIDの状態を定義
  const [userName, setUserName] = useState("名無し");
  const [score, setScore] = useState(null); // スコア
  const [comment, setComment] = useState(""); //キャラのコメント内容
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    liff
      .init({
        liffId: import.meta.env.VITE_LIFF_ID,
        withLoginOnExternalBrowser: true,
      })
      .then(() => {
        console.log("LIFF init succeeded."); // 初期化成功メッセージを設定
        // LIFFが初期化に成功したらプロファイル情報を取得
        if (liff.isLoggedIn()) {
          liff
            .getProfile()
            .then((profile) => {
              setUserName(profile.displayName);
              setUserId(profile.userId); // ユーザーIDを状態にセット
              // APIからスコアを取得
              return scoreApi.get(profile.userId);
            })
            .then((data) => {
              setScore(data.score); // スコアをセット
              setComment(data.comment); //コメントセット
              setIsLoading(false); // ローディング完了
            })
            .catch((err) => {
              console.error("Error fetching score:", err);
              setError(err); // エラーメッセージをセット
              setScore(null); // スコア取得に失敗した場合、nullに設定
              setIsLoading(false); // ローディング完了
            });
        } else {
          liff.login(); // ログインしていない場合はログイン
        }
      })
      .catch((e) => {
        setMessage("LIFFの初期化に失敗しました");
        setError(`${e}`);
        setIsLoading(false); // ローディング完了
      });
  }, []);

  // スコアに応じた画像の選択
  const getImageForScore = (score) => {
    if (score === null) return condition4; // スコアが取得できない場合はデフォルト画像
    if (score >= 7 && score <= 10) return condition6;
    if (score >= 4 && score <= 6) return condition5;
    if (score >= 1 && score <= 3) return condition4;
    if (score >= -2 && score <= 0) return condition3;
    if (score >= -5 && score <= -3) return condition2;
    if (score >= -9 && score <= -6) return condition1;
    return condition4; // その他の場合もデフォルト画像
  };

  const getScorePercentage = (score) => {
    // スコアの割合を計算（例: スコア -9 ~ 10）
    const minScore = -9;
    const maxScore = 10;
    return Math.max(0, ((score - minScore) / (maxScore - minScore)) * 100); // パーセンテージに変換
  };
  const getBarColor = (score) => {
    if (score > 0) return "#29aa2d"; // 緑
    if (score > -6) return "#ffeb3b"; // 黄色
    return "#f44336"; // 赤
  };

  const scorePercentage = getScorePercentage(score);

  if (isLoading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1 className="username-title">{userName}のペット</h1>

      <div className="pet-container">
        <p className="hp-bar-label">元気度</p>
        <div className="hp-bar-container">
          <div
            className="hp-bar"
            style={{
              width: `${scorePercentage}%`,
              backgroundColor: getBarColor(score),
            }}
          ></div>
        </div>
        <img
          src={getImageForScore(score)}
          alt="Score-based image"
          className="pet-image"
        />
        <div className="speech-bubble">
          {comment !== null ? comment : "コメントがありません"}
        </div>
      </div>
    </div>
  );
}

// function App() {
//   const [isMock, setIsMock] = useState(true); // モックモードを切り替える
//   const [userName, setUserName] = useState("テスト");
//   const [score, setScore] = useState(10); // テスト用スコア
//   const [comment, setComment] = useState(
//     "朝のパンはふわふわで美味しかったにゃん！"
//   );

//   useEffect(() => {
//     if (!isMock) {
//       // 本番モードならLINEログイン処理
//       import("@line/liff").then((liff) => {
//         liff
//           .init({
//             liffId: import.meta.env.VITE_LIFF_ID,
//             withLoginOnExternalBrowser: true,
//           })
//           .then(() => {
//             console.log("LIFF init succeeded.");
//             if (liff.isLoggedIn()) {
//               liff.getProfile().then((profile) => {
//                 setUserName(profile.displayName);
//                 setScore(7); // 仮のAPIリクエスト結果
//                 setComment("ログイン後のコメントです。");
//               });
//             } else {
//               liff.login();
//             }
//           })
//           .catch((err) => {
//             console.error("Error initializing LIFF:", err);
//           });
//       });
//     }
//   }, [isMock]);

//   // スコアに応じた画像の選択
//   const getImageForScore = (score) => {
//     if (score === null) return condition3; // デフォルト画像
//     if (score >= 7 && score <= 10) return condition6;
//     if (score >= 4 && score <= 6) return condition5;
//     if (score >= 1 && score <= 3) return condition4;
//     if (score >= -2 && score <= 0) return condition3;
//     if (score >= -5 && score <= -3) return condition2;
//     if (score >= -9 && score <= -6) return condition1;
//     return condition3; // その他
//   };

//   const getScorePercentage = (score) => {
//     // スコアの割合を計算（例: スコア -9 ~ 10）
//     const minScore = -9;
//     const maxScore = 10;
//     return Math.max(0, ((score - minScore) / (maxScore - minScore)) * 100); // パーセンテージに変換
//   };
//   const getBarColor = (score) => {
//     if (score > 0) return "#29aa2d"; // 緑
//     if (score > -6) return "#ffeb3b"; // 黄色
//     return "#f44336"; // 赤
//   };

//   const scorePercentage = getScorePercentage(score);

//   return (
//     <div>
//       <h1 className="username-title">{userName}のペット</h1>

//       <div className="pet-container">
//         <p className="hp-bar-label">元気度</p>
//         <div className="hp-bar-container">
//           <div
//             className="hp-bar"
//             style={{
//               width: `${scorePercentage}%`,
//               backgroundColor: getBarColor(score),
//             }}
//           ></div>
//         </div>
//         <img
//           src={getImageForScore(score)}
//           alt="Score-based image"
//           className="pet-image"
//         />
//         <div className="speech-bubble">
//           {comment !== null ? comment : "コメントがありません"}
//         </div>
//       </div>
//     </div>
//   );
// }

export default App;
