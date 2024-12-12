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

//chatgptにリクエスト
async function getCompletion(prompt) {
  try {
    const response = await client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
    });

    // ChatGPTの応答を取得
    console.log(response.choices[0].message.content);
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching ChatGPT completion:", error.message);
    throw new Error("Failed to fetch comment from ChatGPT");
  }
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

// 動的プロンプト作成
function createPrompt(date, breakfast, lunch, dinner, isToday) {
  let mealDescriptions = `日付: ${date}\n`;

  if (breakfast) mealDescriptions += `朝食: ${JSON.stringify(breakfast)}\n`;
  if (lunch) mealDescriptions += `昼食: ${JSON.stringify(lunch)}\n`;
  if (dinner) mealDescriptions += `夕食: ${JSON.stringify(dinner)}\n`;

  const dayLabel = isToday ? "今日" : "昨日";
  return `
      以下はユーザーの${dayLabel}の食事記録です:
      ${mealDescriptions}
      この食事記録の朝食、昼食、夕食のうちからランダムに一つ選び、その内容について猫のキャラクターとして30文字以内にコメントしてください。
      コメント例:${dayLabel}食べたハンバーグはジューシーで美味しかったにゃん！！
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

    //score,user_idが取得されなかったら
    if (scoreRows.length === 0) {
      return res.status(200).json({
        score: 4,
        comment: "初めましてにゃん!!",
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
    console.log(healthRows);

    if (healthRows.length === 0) {
      return res.status(200).json({
        score,
        comment: "こんにちはにゃん!!",
        comment_bool: false,
      });
    }

    // 日付と食事データの準備
    const latestMeal = {
      ...healthRows[0],
      date: convertToJapanTime(healthRows[0].date),
    };
    const recordDate = new Date(latestMeal.date);
    const commentBool = isTodayOrYesterday(recordDate);

    // プロンプト生成
    const prompt = commentBool
      ? createPrompt(
          latestMeal.date,
          latestMeal.breakfast,
          latestMeal.lunch,
          latestMeal.dinner,
          recordDate.toDateString() === new Date().toDateString()
        )
      : null;
    console.log(prompt);

    // ChatGPT APIにリクエスト
    const comment = commentBool
      ? await getCompletion(prompt)
      : "こんにちはにゃん!!";

    res.json({
      score,
      comment,
      comment_bool: commentBool,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export { get_cat };
