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
  const [comments, setComments] = useState([]); //キャラのコメント内容
  const [displayedComment, setDisplayedComment] = useState(""); // 表示されるコメント
  const [isTyping, setIsTyping] = useState(false); // タイピング中のフラグ
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
              setComments(data.comments); //コメントセット
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

  // ランダムなコメントを取得
  const getRandomComment = () => {
    if (comments.length === 0) {
      return "コメントがありませんにゃん！"; // デフォルトコメント
    }
    const randomIndex = Math.floor(Math.random() * comments.length);
    return comments[randomIndex];
  };

  // 吹き出しをタップした際に実行
  const handleSpeechBubbleClick = () => {
    if (isTyping) return; // タイピング中は何もしない
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

  return (
    <div>
      {isLoading && (
        <div className="loading-container">
          <p className="loading-text">ロード中...</p>
          <div className="pet-animation">
            <img
              src={condition4}
              alt="Loading Pet"
              className="pet-loadingimage"
            />
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
              {displayedComment || "こんにちはにゃん!"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
