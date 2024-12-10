import express from "express";
import mysql from "mysql2/promise";
import env from "dotenv";
env.config();
const router = express.Router();

// localMySQL接続設定
// const pool = mysql.createPool({
//   host: process.env.LOCAL_DB_HOST,
//   user: process.env.LOCAL_DB_USER,
//   password: process.env.LOCAL_DB_PASS,
//   database: process.env.LOCAL_DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

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

// ユーザーIDからスコアを取得
router.get("/:line_id", async (req, res) => {
  const { line_id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT score FROM users WHERE line_id = ?",
      [line_id]
    );

    if (rows.length > 0) {
      res.json({ score: rows[0].score }); // スコアを返す
    } else {
      res.status(404).json({ error: "User not found" }); // 該当ユーザーがいない場合
    }
  } catch (error) {
    console.error("Error fetching score:", error);
    res.status(500).json({ error: "Internal Server Error" }); // エラー処理
  }
});

export default router;
