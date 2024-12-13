import { useEffect, useState } from "react";
import "./App.css";
import condition1 from "./assets/images/condition1.PNG";
import condition2 from "./assets/images/condition2.PNG";
import condition3 from "./assets/images/condition3.PNG";
import condition4 from "./assets/images/condition4.PNG";
import condition5 from "./assets/images/condition5.PNG";
import condition6 from "./assets/images/condition6.PNG";

function App() {
  const [isMock, setIsMock] = useState(true); // モックモードを切り替える
  const [userName, setUserName] = useState("二村");
  const [score, setScore] = useState(10); // テスト用スコア
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState([
    "朝のパンはふわふわで美味しかったにゃん！",
    "お昼のうどんがつるつるで最高だったにゃん！",
    "夜の魚の煮付けはとても健康的だったにゃん！",
  ]);
  const [isTyping, setIsTyping] = useState(false); // タイピング中のフラグ
  const [displayedComment, setDisplayedComment] = useState(""); // 表示されるコメント

  // ランダムなコメントを取得
  const getRandomComment = () => {
    const randomIndex = Math.floor(Math.random() * comments.length);
    return comments[randomIndex];
  };

  // 吹き出しをタップした際に実行
  const handleSpeechBubbleClick = () => {
    if (isTyping) return;
    setIsTyping(true); // タイピングを開始
    const newComment = getRandomComment(); // ランダムにコメントを取得
    console.log(newComment);
    let localComment = "";
    setDisplayedComment(""); // 表示中のコメントをリセット

    // 1文字ずつ表示
    let index = 0;
    const interval = setInterval(() => {
      if (index < newComment.length) {
        localComment += newComment[index];
        setDisplayedComment(localComment);
        index++;
      } else {
        clearInterval(interval); // 全文字表示後、インターバルを停止
        setIsTyping(false); // タイピング終了
      }
    }, 100); // 文字表示間隔（ミリ秒）
  };

  useEffect(() => {
    if (!isMock) {
      // 本番モードならLINEログイン処理
      import("@line/liff").then((liff) => {
        liff
          .init({
            liffId: import.meta.env.VITE_LIFF_ID,
            withLoginOnExternalBrowser: true,
          })
          .then(() => {
            console.log("LIFF init succeeded.");
            if (liff.isLoggedIn()) {
              liff.getProfile().then((profile) => {
                setUserName(profile.displayName);
                setScore(7); // 仮のAPIリクエスト結果
                setComment("ログイン後のコメントです。");
              });
            } else {
              liff.login();
            }
          })
          .catch((err) => {
            console.error("Error initializing LIFF:", err);
          });
      });
    }
  }, [isMock]);

  // スコアに応じた画像の選択
  const getImageForScore = (score) => {
    if (score === null) return condition3; // デフォルト画像
    if (score >= 7 && score <= 10) return condition6;
    if (score >= 4 && score <= 6) return condition5;
    if (score >= 1 && score <= 3) return condition4;
    if (score >= -2 && score <= 0) return condition3;
    if (score >= -5 && score <= -3) return condition2;
    if (score >= -9 && score <= -6) return condition1;
    return condition3; // その他
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

  // ダミーの非同期処理 (例: 3秒後にロード終了)
  setTimeout(() => {
    setIsLoading(false);
  }, 3000);

  return (
    <div>
      {isLoading && (
        <div className="loading-container">
          <p className="loading-text">ロード中...</p>
          <div className="pet-animation">
            <img src={condition4} alt="Loading Pet" className="pet-image" />
          </div>
        </div>
      )}
      {!isLoading && (
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
              onClick={handleSpeechBubbleClick}
            />
            <div className="speech-bubble" onClick={handleSpeechBubbleClick}>
              {displayedComment || "吹き出しをタップしてコメントを表示"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
