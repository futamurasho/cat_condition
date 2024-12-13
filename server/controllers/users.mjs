import mysql from "mysql2/promise";
import env from "dotenv";
env.config();
import OpenAI from "openai";
const client = new OpenAI();

//RDSのMySQL接続設定
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

//chatgpt生成
async function getCompletion(prompt, maxRetries = 3) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await client.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-4o-mini",
      });

      // console.log(response.choices[0].message.content);
      const content = response.choices[0].message.content.trim();

      // ChatGPTの応答をJSONとして解析
      const parsedResponse = JSON.parse(content);

      // 配列かどうか確認
      if (Array.isArray(parsedResponse)) {
        return parsedResponse; // 正常なリスト形式なら返す
      } else {
        throw new Error("Response is not a valid list");
      }
    } catch (error) {
      console.error(`Retry ${retries + 1}:`, error.message);
      retries++;
    }
  }

  // 最大リトライ後に失敗した場合、デフォルトのリストを返す
  return [
    "こんにちはにゃん！",
    "もっと触ってほしいにゃん！",
    "いろんなものを食べてみたいにゃ！",
    "いっぱい運動したいにゃ!",
    "たくさんお世話してほしいにゃ",
  ];
}

// 日付を日本時間に変換する関数
function convertToJapanTime(dateString) {
  const date = new Date(dateString);
  // UTCから日本時間 (UTC+9) に変換
  date.setHours(date.getHours() + 9);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD形式で返す
}

// 日付の確認（今日または昨日）
function isTodayOrYesterday(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  return (
    date.toDateString() === today.toDateString() ||
    date.toDateString() === yesterday.toDateString()
  );
}

function conditionCat(score) {
  if (score >= 7) return "絶好調";
  if (score >= 4 && score <= 6) return "いい気分";
  if (score >= 1 && score <= 3) return "普通";
  if (score >= -2 && score <= 0) return "少し疲れている";
  if (score >= -5 && score <= -3) return "気分が悪い";
  if (score >= -9 && score <= -6) return "死にそう";
}

// 動的プロンプト作成(食事記録あり)
function createPrompt(date, breakfast, lunch, dinner, score, isToday) {
  let mealDescriptions = `日付: ${date}\n`;

  if (breakfast) mealDescriptions += `朝食: ${JSON.stringify(breakfast)}\n`;
  if (lunch) mealDescriptions += `昼食: ${JSON.stringify(lunch)}\n`;
  if (dinner) mealDescriptions += `夕食: ${JSON.stringify(dinner)}\n`;

  const dayLabel = isToday ? "今日" : "昨日";
  const condition = conditionCat(score);
  return `
      あなたはユーザのペットの猫のキャラになりきってください。そのペットの今の体調は${condition}です。この数値は運動量と食事量で決まっています。
      以下はあるユーザがペットに与えた${dayLabel}の食事記録です:
      ${mealDescriptions}
      次からキャラになりきってコメントする際は体調も参考にしてください。
      まず、この食事記録の朝食、昼食、夕食のうちからランダムに一つ選び、その内容についてコメントを5つしてください。\n
      次に体調に合わせたコメントを5つしてください。この際、数値が低い場合は運動や食事をしたい、というような内容だと良い\n
      そして、以下のように、今までのコメント内容をpythonで解釈できるように一つのリスト形式にして出力ください。リスト以外は何も出力しないでください。リスト形式でなければ罰が与えられます。\n
      出力例:["ハンバーグ美味しかったにゃん！","朝のパンは最高だったにゃん!","今日のうどんは腰があって美味しかったにゃん!","卵美味しかったにゃん","パンと牛乳の組み合わせは最高にゃ","とても気分がいいにゃ","運動いっぱいできて嬉しいにゃ","いっぱい食べれて最高にゃ","もっと運動したいにゃ","毎日楽しいにゃ"]
    `;
}

//動的プロンプト作成(食事記録なし)
function createPrompt0(score) {
  const condition = conditionCat(score);
  return `
      あなたはユーザのペットの猫のキャラになりきってください。そのペットの今の体調は${condition}です。この数値は運動量と食事量で決まっています。\n
      体調に合わせたコメントを5つしてください。この際、数値が低い場合は運動や食事をしたい、というような内容だと良い\n
      そして、以下のようにコメント内容をpythonで解釈できるように一つのリスト形式にして出力してください。リスト以外は何も出力しないでください。リスト形式でなければ罰が与えられます。\n
      出力例:["とても気分がいいにゃ","運動いっぱいできて嬉しいにゃ","いっぱい食べれて最高にゃ","もっと運動したいにゃ","毎日楽しいにゃ"]
      `;
}

async function get_cat(req, res) {
  const { line_id } = req.params;
  try {
    //scoreとuser_idを取得
    const [scoreRows] = await pool.query(
      "SELECT score,id FROM users WHERE line_id = ?",
      [line_id]
    );

    //score,user_idが取得されない場合
    if (scoreRows.length === 0) {
      return res.status(200).json({
        score: 4,
        comments: [
          "初めましてにゃん!",
          "いっぱい世話してほしいのにゃ",
          "こんにちはにゃん!",
          "もっと触ってほしいにゃん！",
          "いろんなものを食べてみたいにゃ！",
          "いっぱい運動したいにゃ!",
        ],
        comment_bool: false,
      });
    }

    const { score, id: userId } = scoreRows[0];

    // 食事記録取得
    const [healthRows] = await pool.query(
      `SELECT date, breakfast, lunch, dinner 
          FROM health_data 
          WHERE user_id = ? 
          ORDER BY date DESC 
          LIMIT 1`,
      [userId]
    );

    //user_idはあるが、食事記録が一切ない場合
    if (healthRows.length === 0) {
      const prompt = createPrompt0(score);
      const comments = await getCompletion(prompt);
      return res.json({
        score,
        comments,
        comment_bool: false,
      });
    }

    // 日付と食事データの準備
    const latestMeal = {
      ...healthRows[0],
      date: convertToJapanTime(healthRows[0].date),
    };
    const recordDate = new Date(latestMeal.date);
    //今日昨日の食事記録があったか
    const commentBool = isTodayOrYesterday(recordDate);

    // プロンプト生成(今日昨日の食事記録あるなし)
    const prompt = commentBool
      ? createPrompt(
          latestMeal.date,
          latestMeal.breakfast,
          latestMeal.lunch,
          latestMeal.dinner,
          score,
          recordDate.toDateString() === new Date().toDateString()
        )
      : createPrompt0(score);
    // console.log(prompt);

    // ChatGPT APIにリクエスト
    const comments = await getCompletion(prompt);

    res.json({
      score,
      comments,
      comment_bool: commentBool,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export { get_cat };
